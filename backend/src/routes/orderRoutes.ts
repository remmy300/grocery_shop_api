import express from "express";
import {
  createOrder,
  updateOrderStatus,
  getOrders,
} from "../controller/orderController";

const router = express.Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.patch("/:id/orderStatus", updateOrderStatus);

export default router;
