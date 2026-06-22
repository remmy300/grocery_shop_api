import { Router } from "express";
import { auth, optionalAuth } from "../middleware/auth.js";
import { cartLimiter } from "../middleware/rateLimiter.js";
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
  mergeCartController,
} from "../controller/cartController.js";

const router = Router();

router.get("/", optionalAuth, getCartController);
router.post("/merge", auth, cartLimiter, mergeCartController);
router.post("/", optionalAuth, cartLimiter, addToCartController);
router.patch("/:productId", optionalAuth, cartLimiter, updateCartItemController);
router.delete("/:productId", optionalAuth, cartLimiter, removeCartItemController);
router.delete("/", optionalAuth, cartLimiter, clearCartController);

export default router;
