import express from "express";
import { auth, authorizeRoles } from "../middleware/auth";
import {
  createOrder,
  updateOrderStatus,
  getOrders,
} from "../controller/orderController";

const router = express.Router();

router.get("/", auth, authorizeRoles("admin"), getOrders);
router.post("/", createOrder);
router.patch(
  "/:id/orderStatus",
  auth,
  authorizeRoles("admin"),
  updateOrderStatus,
);

export default router;
