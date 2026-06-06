import { Router } from "express";
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
} from "../controller/cartController.js";

const router = Router();

// Cart endpoints are now accessible to both authenticated users and guests
// Guests will use localStorage-based carts on the frontend
// Authenticated users will have backend-persisted carts

router.get("/", getCartController);

router.post("/", addToCartController);

router.patch("/:productId", updateCartItemController);

router.delete("/:productId", removeCartItemController);

router.delete("/", clearCartController);

export default router;
