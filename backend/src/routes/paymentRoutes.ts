import express from "express";
import {
  initiatePayment,
  handleMpesaCallback,
  queryPaymentStatus,
  getPaymentDetails,
} from "../controller/paymentController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/initiate", initiatePayment);

router.post("/callback", handleMpesaCallback);

router.get("/status", queryPaymentStatus);

router.get("/:orderId", auth, getPaymentDetails);

export default router;
