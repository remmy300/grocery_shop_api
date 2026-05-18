// src/routes/cart.routes.ts

import { Router } from "express";
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
} from "../controller/cartController.js";

const router = Router();

router.get("/", getCartController);

router.post("/", addToCartController);

router.patch("/:productId", updateCartItemController);

router.delete("/:productId", removeCartItemController);

router.delete("/", clearCartController);

export default router;
