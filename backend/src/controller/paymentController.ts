import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import MpesaService from "../utils/mpesaService.js";

//  ENV VALIDATION

const requiredEnv = [
  "MPESA_CONSUMER_KEY",
  "MPESA_CONSUMER_SECRET",
  "MPESA_SHORT_CODE",
  "MPESA_PASSKEY",
  "MPESA_CALLBACK_URL",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

//  MPESA CONFIG

const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
  shortCode: process.env.MPESA_SHORT_CODE!,
  passkey: process.env.MPESA_PASSKEY!,
  callbackUrl: process.env.MPESA_CALLBACK_URL!,
  environment: (process.env.MPESA_ENVIRONMENT || "sandbox") as
    | "sandbox"
    | "production",
};

const mpesaService = new MpesaService(mpesaConfig);

//  INITIATE PAYMENT

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, phoneNumber, amount } = req.body;

    if (orderId === undefined || !phoneNumber || amount === undefined) {
      return res.status(400).json({
        message: "Missing required fields: orderId, phoneNumber, amount",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let payment = await prisma.payment.findUnique({
      where: { orderId: Number(orderId) },
    });

    if (payment && payment.status === "completed") {
      return res.status(200).json({
        message: "Payment already completed for this order",
      });
    }

    const stkResponse = await mpesaService.initiateStkPush(
      phoneNumber,
      amount,
      Number(orderId),
      order.customer,
    );

    if (stkResponse.ResponseCode !== "0") {
      return res.status(400).json({
        message: stkResponse.ResponseDescription,
        responseCode: stkResponse.ResponseCode,
      });
    }

    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          orderId: Number(orderId),
          amount: new Prisma.Decimal(amount),
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
      payment,
    });
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return res.status(500).json({
      message: error.message || "Failed to initiate payment",
    });
  }
};

//  CALLBACK HANDLER

export const handleMpesaCallback = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    console.log("M-Pesa Callback:", JSON.stringify(body, null, 2));

    const callbackData = mpesaService.parseCallbackResponse(body);

    const payment = await prisma.payment.findUnique({
      where: {
        checkoutRequestId: callbackData.checkoutRequestId || "",
      },
    });

    if (!payment) {
      return res.status(200).json({
        ResultCode: 0,
        ResultDesc: "Callback received",
      });
    }

    if (payment.status === "completed") {
      return res.status(200).json({
        ResultCode: 0,
        ResultDesc: "Already processed",
      });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        resultCode: callbackData.resultCode,
        resultDescription: callbackData.resultDescription,
        mpesaReceiptNumber: callbackData.mpesaReceiptNumber,
        status: callbackData.resultCode === "0" ? "completed" : "failed",
        completedAt: callbackData.resultCode === "0" ? new Date() : null,
      },
    });

    if (callbackData.resultCode === "0") {
      await prisma.$transaction(async (tx: any) => {
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: "completed",
            orderStatus: "confirmed",
          },
        });

        const items = await tx.orderItem.findMany({
          where: { orderId: payment.orderId },
        });

        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      });
    } else {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "failed",
        },
      });
    }

    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Processed successfully",
    });
  } catch (error) {
    console.error("Callback error:", error);
    return res.status(500).json({
      ResultCode: 1,
      ResultDesc: "Callback processing failed",
    });
  }
};

//  QUERY PAYMENT STATUS

export const queryPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, checkoutRequestId } = req.query;

    let payment;

    if (orderId) {
      payment = await prisma.payment.findUnique({
        where: { orderId: Number(orderId) },
        include: { order: true },
      });
    } else {
      payment = await prisma.payment.findUnique({
        where: {
          checkoutRequestId: checkoutRequestId as string,
        },
        include: { order: true },
      });
    }

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (payment.status === "pending" && payment.checkoutRequestId) {
      try {
        const queryResult = await mpesaService.querySTKPushStatus(
          payment.checkoutRequestId,
        );

        if (queryResult.ResultCode === "0") {
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
        } else {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "failed",
              resultCode: queryResult.ResultCode,
              resultDescription: queryResult.ResultDescription,
            },
          });
        }
      } catch (err) {
        console.error("STK query error:", err);
      }
    }

    return res.status(200).json({
      payment,
      status: payment.status,
      message: `Payment ${payment.status}`,
    });
  } catch (error) {
    console.error("Query error:", error);
    return res.status(500).json({
      message: "Failed to query payment",
    });
  }
};

//  GET PAYMENT DETAILS

export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { orderId: Number(orderId) },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    return res.status(200).json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    return res.status(500).json({
      message: "Failed to fetch payment",
    });
  }
};
