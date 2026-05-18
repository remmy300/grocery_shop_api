// src/controllers/cart.controller.ts

import { Request, Response } from "express";

import prisma from "../lib/prisma.js";

//  GET CART

export const getCartController = async (req: Request, res: Response) => {
  try {
    const cart = await prisma.cart.findFirst({
      include: {
        items: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return res.status(200).json({
        items: [],
      });
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch cart",
    });
  }
};

//  ADD TO CART

export const addToCartController = async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        message: "Product ID and quantity required",
      });
    }

    let cart = await prisma.cart.findFirst();

    if (!cart) {
      cart = await prisma.cart.create({
        data: {},
      });
    }

    //   CHECK EXISTING ITEM

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      const updatedItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },

        data: {
          quantity: existingItem.quantity + quantity,
        },
      });

      return res.status(200).json(updatedItem);
    }

    /*
      CREATE NEW ITEM
    */

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    return res.status(201).json(cartItem);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to add item",
    });
  }
};

//  UPDATE CART ITEM

export const updateCartItemController = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const parsedProductId = parseInt(productId as string, 10);

    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        message: "Invalid quantity",
      });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        productId: parsedProductId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        id: cartItem.id,
      },

      data: {
        quantity,
      },
    });

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update cart item",
    });
  }
};

//  REMOVE CART ITEM

export const removeCartItemController = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const parsedProductId = parseInt(productId as string, 10);

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        productId: parsedProductId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    await prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    });

    return res.status(200).json({
      message: "Item removed",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to remove cart item",
    });
  }
};

//  CLEAR CART

export const clearCartController = async (req: Request, res: Response) => {
  try {
    await prisma.cartItem.deleteMany();

    return res.status(200).json({
      message: "Cart cleared",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to clear cart",
    });
  }
};
