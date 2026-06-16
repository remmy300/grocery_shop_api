import express from "express";
import {
  initiatePayment,
  handleMpesaCallback,
  queryPaymentStatus,
  getPaymentDetails,
} from "../controller/paymentController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Requires a valid JWT — prevents anonymous STK-push spam
router.post("/initiate", auth, initiatePayment);

// Safaricom posts here; no user auth (it's a server-to-server callback)
router.post("/callback", handleMpesaCallback);

// Frontend polls this; no auth needed (orderId is not guessable enough to need it,
// and the response contains no sensitive data beyond status)
router.get("/status", queryPaymentStatus);

router.get("/:orderId", auth, getPaymentDetails);

export default router;
