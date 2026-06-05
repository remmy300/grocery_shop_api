import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

const getAuthenticatedUserId = (req: Request) => {
  const userId = Number(req.user?.id);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
};

const parsePositiveInteger = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

// GET CART (USER-SCOPED)
export const getCartController = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

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
    console.error("Fetch cart error:", error);
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// ADD TO CART
export const addToCartController = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const productId = parsePositiveInteger(req.body.productId);
    const quantity = parsePositiveInteger(req.body.quantity);

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
      },
    });

    const item = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ message: "Failed to add item" });
  }
};

// UPDATE CART ITEM
export const updateCartItemController = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const productId = parsePositiveInteger(req.params.productId);
    const quantity = parsePositiveInteger(req.body.quantity);

    if (!productId || !quantity) {
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
      include: {
        product: true,
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({ message: "Failed to update cart item" });
  }
};

// REMOVE CART ITEM
export const removeCartItemController = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const productId = parsePositiveInteger(req.params.productId);
    if (!productId) {
      return res.status(400).json({ message: "Invalid product" });
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
      return res.status(404).json({ message: "Item not found" });
    }

    await prisma.cartItem.delete({
      where: { id: item.id },
    });

    return res.status(200).json({ message: "Item removed" });
  } catch (error) {
    console.error("Remove cart item error:", error);
    return res.status(500).json({ message: "Failed to remove item" });
  }
};

// CLEAR CART
export const clearCartController = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

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
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({ message: "Failed to clear cart" });
  }
};
