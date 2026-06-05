import { Router } from "express";
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
} from "../controller/cartController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/", getCartController);

router.post("/", addToCartController);

router.patch("/:productId", updateCartItemController);

router.delete("/:productId", removeCartItemController);

router.delete("/", clearCartController);

export default router;
