import express from "express";
import {
  initiatePayment,
  handleMpesaCallback,
  queryPaymentStatus,
  getPaymentDetails,
} from "../controller/paymentController.js";
import { auth, optionalAuth } from "../middleware/auth.js";
import { callbackLimiter, paymentInitLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { initiatePaymentSchema } from "../schemas/index.js";
import { mpesaIpWhitelist } from "../middleware/mpesaIpWhitelist.js";

const router = express.Router();

router.post("/initiate", auth, paymentInitLimiter, validate(initiatePaymentSchema), initiatePayment);
// IP whitelist runs before rate limiter to reject non-Safaricom traffic immediately
router.post("/callback", mpesaIpWhitelist, callbackLimiter, handleMpesaCallback);
router.get("/status", optionalAuth, queryPaymentStatus);
router.get("/:orderId", auth, getPaymentDetails);

export default router;
