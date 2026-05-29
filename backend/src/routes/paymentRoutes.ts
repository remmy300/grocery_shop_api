import express from "express";
import {
  initiatePayment,
  handleMpesaCallback,
  queryPaymentStatus,
  getPaymentDetails,
} from "../controller/paymentController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/payments/initiate
 * Initiate M-Pesa STK Push payment
 * Body: { orderId, phoneNumber, amount }
 */
router.post("/initiate", initiatePayment);

/**
 * POST /api/payments/callback
 * M-Pesa callback endpoint (webhook)
 * No auth required - called by M-Pesa servers
 */
router.post("/callback", handleMpesaCallback);

/**
 * GET /api/payments/status?orderId=123 or ?checkoutRequestId=xxx
 * Query payment status
 */
router.get("/status", queryPaymentStatus);

/**
 * GET /api/payments/:orderId
 * Get payment details for an order
 */
router.get("/:orderId", auth, getPaymentDetails);

export default router;
