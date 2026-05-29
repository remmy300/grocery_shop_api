import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import MpesaService from "../utils/mpesaService.js";

// Initialize M-Pesa service
const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || "",
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
  shortCode: process.env.MPESA_SHORT_CODE || "",
  passkey: process.env.MPESA_PASSKEY || "",
  callbackUrl: process.env.MPESA_CALLBACK_URL || "",
  environment: (process.env.MPESA_ENVIRONMENT || "sandbox") as
    | "sandbox"
    | "production",
};

const mpesaService = new MpesaService(mpesaConfig);

/**
 * Initiate M-Pesa STK Push payment
 */
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, phoneNumber, amount } = req.body;

    // Validate input
    if (!orderId || !phoneNumber || !amount) {
      return res
        .status(400)
        .json({
          message: "Missing required fields: orderId, phoneNumber, amount",
        });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if payment already exists
    let payment = await prisma.payment.findUnique({
      where: { orderId: Number(orderId) },
    });

    // If payment exists and is completed, reject
    if (payment && payment.status === "completed") {
      return res
        .status(400)
        .json({ message: "Payment already completed for this order" });
    }

    try {
      // Initiate STK Push
      const stkResponse = await mpesaService.initiateStkPush(
        phoneNumber,
        amount,
        Number(orderId),
        order.customer,
      );

      // Check response code
      if (stkResponse.ResponseCode !== "0") {
        return res.status(400).json({
          message: stkResponse.ResponseDescription,
          responseCode: stkResponse.ResponseCode,
        });
      }

      // Create or update payment record
      if (!payment) {
        payment = await prisma.payment.create({
          data: {
            orderId: Number(orderId),
            amount,
            paymentMethod: "mpesa",
            status: "pending",
            merchantRequestId: stkResponse.MerchantRequestID,
            checkoutRequestId: stkResponse.CheckoutRequestID,
            responseCode: stkResponse.ResponseCode,
            responseDescription: stkResponse.ResponseDescription,
            customerMessage: stkResponse.CustomerMessage,
          },
        });
      } else {
        payment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            merchantRequestId: stkResponse.MerchantRequestID,
            checkoutRequestId: stkResponse.CheckoutRequestID,
            responseCode: stkResponse.ResponseCode,
            responseDescription: stkResponse.ResponseDescription,
            customerMessage: stkResponse.CustomerMessage,
            status: "pending",
          },
        });
      }

      return res.status(200).json({
        message: "M-Pesa STK Push initiated",
        checkoutRequestId: stkResponse.CheckoutRequestID,
        merchantRequestId: stkResponse.MerchantRequestID,
        customerMessage: stkResponse.CustomerMessage,
        payment: payment,
      });
    } catch (mpesaError: any) {
      console.error("M-Pesa error:", mpesaError);
      return res.status(400).json({
        message: mpesaError.message || "Failed to initiate M-Pesa payment",
      });
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
};

/**
 * Handle M-Pesa callback
 */
export const handleMpesaCallback = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    console.log("M-Pesa Callback received:", JSON.stringify(body, null, 2));

    // Parse the callback response
    const callbackData = mpesaService.parseCallbackResponse(body);

    // Find payment by checkoutRequestId
    const payment = await prisma.payment.findUnique({
      where: { checkoutRequestId: callbackData.checkoutRequestId || "" },
    });

    if (!payment) {
      console.warn(
        "Payment not found for callback:",
        callbackData.checkoutRequestId,
      );
      // Still return 200 to acknowledge receipt
      return res.status(200).json({ message: "Callback received" });
    }

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        resultCode: callbackData.resultCode,
        resultDescription: callbackData.resultDescription,
        mpesaReceiptNumber: callbackData.mpesaReceiptNumber,
        status: callbackData.resultCode === "0" ? "completed" : "failed",
        completedAt: callbackData.resultCode === "0" ? new Date() : null,
      },
    });

    // Update order status if payment successful
    if (callbackData.resultCode === "0") {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "completed",
          orderStatus: "confirmed",
        },
      });
    } else {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "failed",
        },
      });
    }

    // Return success response to M-Pesa
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Callback received successfully",
    });
  } catch (error) {
    console.error("Callback handling error:", error);
    res.status(500).json({
      ResultCode: 1,
      ResultDesc: "Error processing callback",
    });
  }
};

/**
 * Query payment status
 */
export const queryPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, checkoutRequestId } = req.query;

    if (!orderId && !checkoutRequestId) {
      return res
        .status(400)
        .json({ message: "Provide either orderId or checkoutRequestId" });
    }

    let payment;

    if (orderId) {
      payment = await prisma.payment.findUnique({
        where: { orderId: Number(orderId) },
        include: { order: true },
      });
    } else {
      payment = await prisma.payment.findUnique({
        where: { checkoutRequestId: checkoutRequestId as string },
        include: { order: true },
      });
    }

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // If status is still pending, query M-Pesa for latest status
    if (payment.status === "pending" && payment.checkoutRequestId) {
      try {
        const queryResult = await mpesaService.querySTKPushStatus(
          payment.checkoutRequestId,
        );

        // Update if we get a result
        if (queryResult.ResultCode === "0" && payment.status !== "completed") {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "completed",
              resultCode: "0",
              completedAt: new Date(),
            },
          });

          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              paymentStatus: "completed",
              orderStatus: "confirmed",
            },
          });

          payment = await prisma.payment.findUnique({
            where: { id: payment.id },
            include: { order: true },
          })!;
        }
      } catch (error) {
        console.error("Error querying STK status:", error);
        // Continue with existing payment data if query fails
      }
    }

    res.status(200).json({
      payment,
      status: payment.status,
      message: `Payment ${payment.status}`,
    });
  } catch (error) {
    console.error("Query payment error:", error);
    res.status(500).json({ message: "Failed to query payment status" });
  }
};

/**
 * Get payment details
 */
export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { orderId: Number(orderId) },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Get payment details error:", error);
    res.status(500).json({ message: "Failed to fetch payment details" });
  }
};
