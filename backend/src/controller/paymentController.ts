import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import MpesaService from "../utils/mpesaService.js";
import { getAdminSettings } from "../lib/adminSettings.js";

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

function errorPayload(error: any) {
  if (process.env.NODE_ENV !== "production") {
    return { message: error.message, detail: error.response?.data ?? null };
  }
  return { message: "An error occurred. Please try again." };
}

// INITIATE PAYMENT

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, phoneNumber, amount } = req.body;

    if (orderId === undefined || !phoneNumber || amount === undefined) {
      return res.status(400).json({
        message: "Missing required fields: orderId, phoneNumber, amount",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const adminSettings = await getAdminSettings();
    if (!adminSettings.mpesaEnabled) {
      return res.status(400).json({
        message: "M-Pesa payments are currently disabled. Please select another payment method.",
      });
    }

    //  ownership check: authenticated user must own the order
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== null && order.userId !== req.user?.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

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
    if (existing?.status === "pending" && existing.updatedAt) {
      const ageMs = Date.now() - new Date(existing.updatedAt).getTime();
      if (ageMs < 2 * 60 * 1000) {
        return res.status(409).json({
          message:
            "A payment for this order is already in progress. Please check your phone.",
          checkoutRequestId: existing.checkoutRequestId,
          payment: { id: existing.id, status: existing.status },
        });
      }
    }

    // create / reset the payment record BEFORE calling Safaricom ---
    // The unique constraint on orderId is the race-condition guard.
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

    // call Safaricom
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
    const upstreamStatus = error.response?.status;
    const safaricomCode: string = error.response?.data?.errorCode ?? "";

    // Safaricom "System is busy" — errorCode 500.003.x or HTTP 503/429.
    const isSafaricomBusy =
      safaricomCode.startsWith("500.003") ||
      upstreamStatus === 503 ||
      upstreamStatus === 429;

    if (isSafaricomBusy) {
      console.warn(
        "[payment] Safaricom busy:",
        safaricomCode || upstreamStatus,
      );
      return res.status(503).json({
        message:
          "M-Pesa is temporarily busy. Please wait a moment and try again.",
        retryable: true,
      });
    }

    // Safaricom config/validation error (500.001.x, 500.002.x)
    if (upstreamStatus === 500 && safaricomCode) {
      console.error(
        "[payment] Safaricom rejected request:",
        safaricomCode,
        error.response?.data?.errorMessage,
      );
      return res.status(502).json({
        message:
          process.env.NODE_ENV !== "production"
            ? `Safaricom error ${safaricomCode}: ${error.response?.data?.errorMessage ?? "check STK push configuration"}`
            : "Payment gateway error. Contact support.",
        safaricomCode,
      });
    }

    if (upstreamStatus === 401 || upstreamStatus === 403) {
      console.error(
        "[payment] Safaricom auth error — check MPESA_CONSUMER_KEY/SECRET/PASSKEY",
      );
      return res.status(502).json({
        message:
          process.env.NODE_ENV !== "production"
            ? `Safaricom auth failed (${upstreamStatus}): ${error.response?.data?.errorMessage ?? "check credentials"}`
            : "Payment gateway authentication failed. Contact support.",
      });
    }

    return res.status(500).json(errorPayload(error));
  }
};

// CALLBACK HANDLER

export const handleMpesaCallback = async (req: Request, res: Response) => {
  // Verify callback secret to reject forged callbacks
  const expectedSecret = process.env.MPESA_CALLBACK_SECRET;
  if (expectedSecret) {
    const providedSecret = req.query.secret as string | undefined;
    if (providedSecret !== expectedSecret) {
      console.warn("[payment] callback rejected — invalid secret");
      return res.status(403).json({ ResultCode: 1, ResultDesc: "Forbidden" });
    }
  }

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

    if (payment.status === "completed" || payment.status === "failed") {
      return res
        .status(200)
        .json({ ResultCode: 0, ResultDesc: "Already processed" });
    }

    const isSuccess = callbackData.resultCode === "0";

    // Update payment status atomically with order changes. Stock is reserved
    // at order creation time, so success only confirms the order.
    if (isSuccess) {
      await prisma.$transaction(async (tx: any) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            resultCode: callbackData.resultCode,
            resultDescription: callbackData.resultDescription,
            mpesaReceiptNumber: callbackData.mpesaReceiptNumber,
            status: "completed",
            completedAt: new Date(),
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "completed", orderStatus: "confirmed" },
        });
      });
    } else {
      await prisma.$transaction(async (tx: any) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            resultCode: callbackData.resultCode,
            resultDescription: callbackData.resultDescription,
            status: "failed",
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "failed" },
        });

        const items = await tx.orderItem.findMany({
          where: { orderId: payment.orderId },
        });

        for (const item of items) {
          await tx.product.updateMany({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      });
    }

    return res.status(200).json({ ResultCode: 0, ResultDesc: "Processed" });
  } catch (error: any) {
    console.error("[payment] callback error:", error.message);
    // Always return 200 to Safaricom to prevent retries
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Received" });
  }
};

// QUERY PAYMENT STATUS

export const queryPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, checkoutRequestId } = req.query;

    let payment;

    if (checkoutRequestId) {
      payment = await prisma.payment.findUnique({
        where: { checkoutRequestId: checkoutRequestId as string },
        include: { order: { select: { userId: true } } },
      });
    } else if (orderId) {
      payment = await prisma.payment.findUnique({
        where: { orderId: Number(orderId) },
        include: { order: { select: { userId: true } } },
      });
    } else {
      return res
        .status(400)
        .json({ message: "Provide orderId or checkoutRequestId" });
    }

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // If the order belongs to a specific user, verify the caller owns it
    if (payment.order.userId !== null && req.user) {
      if (payment.order.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
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

// GET PAYMENT DETAILS

export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.orderId);

    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: { select: { userId: true } } },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Ensuring the requesting user owns the order
    if (
      payment.order.userId !== null &&
      payment.order.userId !== req.user?.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { order: _order, ...safePayment } = payment;
    return res.status(200).json(safePayment);
  } catch (error: any) {
    console.error("[payment] getPaymentDetails error:", error.message);
    return res.status(500).json(errorPayload(error));
  }
};
