import express from "express";
import { auth, authorizeRoles } from "../middleware/auth.js";
import {
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrders,
  getMyOrders,
  getNearbyOrders,
} from "../controller/orderController.js";

const router = express.Router();

router.get("/", auth, authorizeRoles("admin"), getOrders);
router.post("/", auth, createOrder);
router.get("/my", auth, getMyOrders);
router.get("/orders", auth, getMyOrders); // legacy alias
router.get("/nearby", auth, authorizeRoles("admin"), getNearbyOrders);
router.patch("/:id/orderStatus", auth, authorizeRoles("admin"), updateOrderStatus);
router.delete("/:id", auth, authorizeRoles("admin"), deleteOrder);

export default router;
