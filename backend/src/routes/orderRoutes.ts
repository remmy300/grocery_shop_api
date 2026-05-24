import express from "express";
import { auth, authorizeRoles } from "../middleware/auth.js";
import {
  createOrder,
  updateOrderStatus,
  getOrders,
  getMyOrders,
  getNearbyOrders,
} from "../controller/orderController.js";

const router = express.Router();

router.get("/", auth, authorizeRoles("admin"), getOrders);
router.post("/", createOrder);
router.get("/my", auth, getMyOrders);
router.get("/nearby", auth, authorizeRoles("admin"), getNearbyOrders);
router.patch(
  "/:id/orderStatus",
  auth,
  authorizeRoles("admin"),
  updateOrderStatus,
);

export default router;
