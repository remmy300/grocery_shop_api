import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import MpesaService from "../utils/mpesaService.js";

// ---------------------------------------------------------------------------
// Lazy service initialisation
// Throwing at module-load time crashes the whole process. By initialising
// on first use we get a proper 500 response and a clear log instead.
// ---------------------------------------------------------------------------

const REQUIRED_ENV = [
  "MPESA_CONSUMER_KEY",
  "MPESA_CONSUMER_SECRET",
  "MPESA_SHORT_CODE",
  "MPESA_PASSKEY",
  "MPESA_CALLBACK_URL",
];

let _mpesaService: MpesaService | null = null;

function getMpesaService(): MpesaService {
  if (_mpesaService) return _mpesaService;

  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing M-Pesa env vars: ${missing.join(", ")}`);
  }

  const key = process.env.MPESA_CONSUMER_KEY!;
  console.log(
    `[mpesa] initialising service — env:${process.env.MPESA_ENVIRONMENT} shortCode:${process.env.MPESA_SHORT_CODE} key:${key.slice(0, 6)}... passkey:${process.env.MPESA_PASSKEY?.slice(0, 8)}...`,
  );

  _mpesaService = new MpesaService({
    consumerKey: key,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
    shortCode: process.env.MPESA_SHORT_CODE!,
    passkey: process.env.MPESA_PASSKEY!,
    callbackUrl: process.env.MPESA_CALLBACK_URL!,
    environment: (process.env.MPESA_ENVIRONMENT || "sandbox") as
      | "sandbox"
      | "production",
  });

  return _mpesaService;
}

// Generic error payload — never leak internals to the client in production
function errorPayload(error: any) {
  if (process.env.NODE_ENV !== "production") {
    return { message: error.message, detail: error.response?.data ?? null };
  }
  return { message: "An error occurred. Please try again." };
}

// ---------------------------------------------------------------------------
// INITIATE PAYMENT
// ---------------------------------------------------------------------------

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, phoneNumber, amount } = req.body;

    if (orderId === undefined || !phoneNumber || amount === undefined) {
      return res
        .status(400)
        .json({ message: "Missing required fields: orderId, phoneNumber, amount" });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // --- ownership check: authenticated user must own the order ---
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== null && order.userId !== req.user?.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // --- guard against double-charge ---
    // Check for an existing payment record BEFORE calling Safaricom.
    const existing = await prisma.payment.findUnique({
      where: { orderId: Number(orderId) },
    });

    if (existing?.status === "completed") {
      return res
        .status(200)
        .json({ message: "Payment already completed for this order" });
    }

    // If a pending payment was initiated less than 2 minutes ago, block a
    // duplicate STK push (Daraja prompts expire in ~3 min).
    if (existing?.status === "pending" && existing.createdAt) {
      const ageMs = Date.now() - new Date(existing.createdAt).getTime();
      if (ageMs < 2 * 60 * 1000) {
        return res.status(409).json({
          message: "A payment for this order is already in progress. Please check your phone.",
          checkoutRequestId: existing.checkoutRequestId,
          payment: { id: existing.id, status: existing.status },
        });
      }
    }

    // --- create / reset the payment record BEFORE calling Safaricom ---
    // The unique constraint on orderId is the race-condition guard.
    // If two requests arrive simultaneously the second upsert wins harmlessly;
    // only one STK push is sent because we only reach this point once per window.
    const payment = await prisma.payment.upsert({
      where: { orderId: Number(orderId) },
      update: {
        status: "pending",
        amount: new Prisma.Decimal(amount),
        merchantRequestId: null,
        checkoutRequestId: null,
      },
      create: {
        orderId: Number(orderId),
        amount: new Prisma.Decimal(amount),
        paymentMethod: "mpesa",
        status: "pending",
      },
    });

    // --- call Safaricom ---
    let stkResponse;
    try {
      stkResponse = await getMpesaService().initiateStkPush(
        phoneNumber,
        Math.ceil(Number(amount)),
        Number(orderId),
      );
    } catch (stkError: any) {
      // Mark the record as failed so the user can retry
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });
      throw stkError;
    }

    if (stkResponse.ResponseCode !== "0") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });
      return res.status(400).json({
        message: stkResponse.ResponseDescription,
        responseCode: stkResponse.ResponseCode,
      });
    }

    // --- persist STK response details ---
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        merchantRequestId: stkResponse.MerchantRequestID,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        responseCode: stkResponse.ResponseCode,
        responseDescription: stkResponse.ResponseDescription,
        customerMessage: stkResponse.CustomerMessage,
      },
    });

    return res.status(200).json({
      message: "M-Pesa STK Push initiated",
      checkoutRequestId: stkResponse.CheckoutRequestID,
      merchantRequestId: stkResponse.MerchantRequestID,
      customerMessage: stkResponse.CustomerMessage,
      payment: { id: updated.id, status: updated.status },
    });
  } catch (error: any) {
    console.error("[payment] initiatePayment error:", error.message);
    return res.status(500).json(errorPayload(error));
  }
};

// ---------------------------------------------------------------------------
// CALLBACK HANDLER
// Safaricom posts the payment result here. This is the authoritative status
// update — the status-poll endpoint should only READ from the DB.
// ---------------------------------------------------------------------------

export const handleMpesaCallback = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const callbackData = getMpesaService().parseCallbackResponse(body);

    if (!callbackData.checkoutRequestId) {
      console.warn("[payment] callback missing checkoutRequestId");
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Received" });
    }

    const payment = await prisma.payment.findUnique({
      where: { checkoutRequestId: callbackData.checkoutRequestId },
    });

    if (!payment) {
      console.warn(
        "[payment] callback for unknown checkoutRequestId:",
        callbackData.checkoutRequestId,
      );
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Received" });
    }

    if (payment.status === "completed") {
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Already processed" });
    }

    const isSuccess = callbackData.resultCode === "0";

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        resultCode: callbackData.resultCode,
        resultDescription: callbackData.resultDescription,
        mpesaReceiptNumber: callbackData.mpesaReceiptNumber,
        status: isSuccess ? "completed" : "failed",
        completedAt: isSuccess ? new Date() : null,
      },
    });

    if (isSuccess) {
      await prisma.$transaction(async (tx: any) => {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "completed", orderStatus: "confirmed" },
        });

        const items = await tx.orderItem.findMany({
          where: { orderId: payment.orderId },
        });

        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      });
    } else {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "failed" },
      });
    }

    return res.status(200).json({ ResultCode: 0, ResultDesc: "Processed" });
  } catch (error: any) {
    console.error("[payment] callback error:", error.message);
    // Always return 200 to Safaricom to prevent retries
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Received" });
  }
};

// ---------------------------------------------------------------------------
// QUERY PAYMENT STATUS
// Reads from the DB only. The callback is the source of truth.
// No Daraja API calls on every poll — that would hammer the rate limit.
// ---------------------------------------------------------------------------

export const queryPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, checkoutRequestId } = req.query;

    let payment;

    if (checkoutRequestId) {
      payment = await prisma.payment.findUnique({
        where: { checkoutRequestId: checkoutRequestId as string },
      });
    } else if (orderId) {
      payment = await prisma.payment.findUnique({
        where: { orderId: Number(orderId) },
      });
    } else {
      return res
        .status(400)
        .json({ message: "Provide orderId or checkoutRequestId" });
    }

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json({
      payment: {
        id: payment.id,
        status: payment.status,
        mpesaReceiptNumber: payment.mpesaReceiptNumber,
        resultCode: payment.resultCode,
        resultDescription: payment.resultDescription,
      },
      status: payment.status,
    });
  } catch (error: any) {
    console.error("[payment] queryPaymentStatus error:", error.message);
    return res.status(500).json(errorPayload(error));
  }
};

// ---------------------------------------------------------------------------
// GET PAYMENT DETAILS
// ---------------------------------------------------------------------------

export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.orderId);

    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Ensure the requesting user owns the order
    if (
      payment.order.userId !== null &&
      payment.order.userId !== req.user?.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(payment);
  } catch (error: any) {
    console.error("[payment] getPaymentDetails error:", error.message);
    return res.status(500).json(errorPayload(error));
  }
};
