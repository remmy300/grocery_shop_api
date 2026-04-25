import prisma from "../lib/prisma.js";
import { Request, Response } from "express";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customer, phone, address, items } = req.body;

    const normalizedCustomer =
      typeof customer === "string" ? customer.trim() : "";
    const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
    const normalizedAddress =
      typeof address === "string" ? address.trim() : "";

    if (
      !normalizedCustomer ||
      !normalizedPhone ||
      !normalizedAddress ||
      !items ||
      !Array.isArray(items)
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must include at least one item" });
    }

    const parsedItems = items
      .map((item: any) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      }))
      .filter(
        (item) =>
          Number.isInteger(item.productId) &&
          item.productId > 0 &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0,
      );

    if (parsedItems.length !== items.length) {
      return res
        .status(400)
        .json({ message: "Each item must have a valid productId and quantity" });
    }

    const productIds = parsedItems.map((item) => item.productId);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });

    const existingIdSet = new Set(existingProducts.map((p) => p.id));
    const missingIds = productIds.filter(
      (id: number) => !existingIdSet.has(id),
    );
    if (missingIds.length > 0) {
      return res.status(400).json({
        message: `Invalid productId(s): ${missingIds.join(", ")}`,
      });
    }

    const priceById = new Map(existingProducts.map((p) => [p.id, p.price]));
    let total = 0;
    parsedItems.forEach((item) => {
      const productPrice = priceById.get(item.productId) ?? 0;
      total += item.quantity * productPrice;
    });

    const itemsToCreate = parsedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: priceById.get(item.productId) ?? 0,
    }));

    const order = await prisma.order.create({
      data: {
        phone: normalizedPhone,
        customer: normalizedCustomer,
        total,
        address: normalizedAddress,
        items: {
          create: itemsToCreate,
        },
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create an order" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch  orders" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { orderStatus },
    });
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};
