import express from "express";
import { auth, authorizeRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createOrderSchema, updateOrderStatusSchema } from "../schemas/index.js";
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
router.post("/", auth, validate(createOrderSchema), createOrder);
router.get("/my", auth, getMyOrders);
router.get("/orders", auth, getMyOrders); // legacy alias
router.get("/nearby", auth, authorizeRoles("admin"), getNearbyOrders);
router.patch("/:id/orderStatus", auth, authorizeRoles("admin"), validate(updateOrderStatusSchema), updateOrderStatus);
router.delete("/:id", auth, authorizeRoles("admin"), deleteOrder);

export default router;
