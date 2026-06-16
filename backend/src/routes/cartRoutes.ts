import { Router } from "express";
import { auth, optionalAuth } from "../middleware/auth.js";
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
router.post("/merge", auth, mergeCartController);
router.post("/", optionalAuth, addToCartController);
router.patch("/:productId", optionalAuth, updateCartItemController);
router.delete("/:productId", optionalAuth, removeCartItemController);
router.delete("/", optionalAuth, clearCartController);

export default router;
