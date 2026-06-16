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

const getCartWithItemsByUserId = (userId: number) =>
  prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: { product: true },
      },
    },
  });

// GET CART (USER-SCOPED)
// Authenticated users: returns their persisted cart from database
// Unauthenticated users: returns empty cart (they use localStorage on frontend)
export const getCartController = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);

    // For unauthenticated requests, return empty cart (frontend uses localStorage)
    if (!userId) {
      return res.status(200).json({ items: [] });
    }

    const cart = await getCartWithItemsByUserId(userId);
    return res.status(200).json(cart ?? { items: [] });
  } catch (error) {
    console.error("Fetch cart error:", error);
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// ADD TO CART
// Authenticated users: adds to database cart
// Unauthenticated users: returns 401 (they should use localStorage on frontend)
export const addToCartController = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);

    // For unauthenticated requests, return 401 (frontend handles with localStorage)
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Please sign in to persist cart" });
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
      create: { userId },
    });

    await prisma.cartItem.upsert({
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
    });

    const cartWithItems = await getCartWithItemsByUserId(userId);
    return res.status(201).json(cartWithItems);
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ message: "Failed to add item" });
  }
};

// UPDATE CART ITEM
// Authenticated users only (guests use localStorage frontend cart)
export const updateCartItemController = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const productId = parsePositiveInteger(req.params.productId);
    const quantity = parsePositiveInteger(req.body.quantity);

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await prisma.cart.findUnique({
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

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    const cartWithItems = await getCartWithItemsByUserId(userId);
    return res.status(200).json(cartWithItems);
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({ message: "Failed to update cart item" });
  }
};

// REMOVE CART ITEM
// Authenticated users only (guests use localStorage frontend cart)
export const removeCartItemController = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const productId = parsePositiveInteger(req.params.productId);
    if (!productId) {
      return res.status(400).json({ message: "Invalid product" });
    }

    const cart = await prisma.cart.findUnique({
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

    const cartWithItems = await getCartWithItemsByUserId(userId);
    return res.status(200).json(cartWithItems);
  } catch (error) {
    console.error("Remove cart item error:", error);
    return res.status(500).json({ message: "Failed to remove item" });
  }
};

// MERGE GUEST CART ON LOGIN
export const mergeCartController = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { items } = req.body as {
      items: Array<{ productId: number; quantity: number }>;
    };

    if (!Array.isArray(items) || !items.length) {
      return res.status(200).json(await getCartWithItemsByUserId(userId) ?? { items: [] });
    }

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    for (const item of items) {
      const productId = parsePositiveInteger(item.productId);
      const quantity = parsePositiveInteger(item.quantity);
      if (!productId || !quantity) continue;

      await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        update: { quantity: { increment: quantity } },
        create: { cartId: cart.id, productId, quantity },
      });
    }

    const cartWithItems = await getCartWithItemsByUserId(userId);
    return res.status(200).json(cartWithItems ?? { items: [] });
  } catch (error) {
    console.error("Merge cart error:", error);
    return res.status(500).json({ message: "Failed to merge cart" });
  }
};

// CLEAR CART
// Authenticated users only (guests use localStorage frontend cart)
export const clearCartController = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    const cartWithItems = await getCartWithItemsByUserId(userId);
    return res.status(200).json(cartWithItems);
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({ message: "Failed to clear cart" });
  }
};
