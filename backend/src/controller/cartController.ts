import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// GET CART (USER-SCOPED)
export const getCartController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: "desc" },
          include: { product: true },
        },
      },
    });

    return res.status(200).json(cart ?? { items: [] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// ADD TO CART
export const addToCartController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity);

    if (
      !Number.isInteger(productId) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });

      return res.status(200).json(updated);
    }

    const item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add item" });
  }
};

// UPDATE CART ITEM
export const updateCartItemController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const productId = Number(req.params.productId);
    const quantity = Number(req.body.quantity);

    if (
      !Number.isInteger(productId) ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return res.status(200).json(updated);
  } catch {
    return res.status(500).json({ message: "Failed to update cart item" });
  }
};

// REMOVE CART ITEM
export const removeCartItemController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const productId = Number(req.params.productId);

    const cart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await prisma.cartItem.delete({
      where: { id: item.id },
    });

    return res.status(200).json({ message: "Item removed" });
  } catch {
    return res.status(500).json({ message: "Failed to remove item" });
  }
};

// CLEAR CART
export const clearCartController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const cart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return res.status(200).json({ message: "Cart cleared" });
  } catch {
    return res.status(500).json({ message: "Failed to clear cart" });
  }
};
