import express from "express";
import {
  initiatePayment,
  handleMpesaCallback,
  queryPaymentStatus,
  getPaymentDetails,
} from "../controller/paymentController.js";
import { auth, optionalAuth } from "../middleware/auth.js";
import { callbackLimiter, paymentInitLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/initiate", auth, paymentInitLimiter, initiatePayment);
router.post("/callback", callbackLimiter, handleMpesaCallback);
// optionalAuth: if authenticated, ownership is verified inside the handler
router.get("/status", optionalAuth, queryPaymentStatus);
router.get("/:orderId", auth, getPaymentDetails);

export default router;
