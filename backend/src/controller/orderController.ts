import prisma from "../lib/prisma.js";
import { getAdminSettings } from "../lib/adminSettings.js";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      customer,
      phone,
      address,
      street,
      city,
      postalCode,
      items,
      latitude,
      longitude,
      paymentMethod,
    } = req.body;

    const normalizedCustomer =
      typeof customer === "string" ? customer.trim() : "";
    const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
    const normalizedAddress = typeof address === "string" ? address.trim() : "";

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
      return res.status(400).json({
        message: "Each item must have a valid productId and quantity",
      });
    }

    const productIds = parsedItems.map((item) => item.productId);
    const [existingProducts, adminSettings] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds }, deletedAt: null },
        select: { id: true, price: true, stock: true, name: true },
      }),
      getAdminSettings(),
    ]);

    if (!adminSettings.storeOpen) {
      return res.status(409).json({
        message: "The store is currently closed. Please try again later.",
      });
    }

    const existingIdSet = new Set(existingProducts.map((p: any) => p.id));
    const missingIds = productIds.filter(
      (id: number) => !existingIdSet.has(id),
    );
    if (missingIds.length > 0) {
      return res.status(400).json({
        message: `Invalid productId(s): ${missingIds.join(", ")}`,
      });
    }

    // Stock validation — reject before payment if any item is unavailable
    const stockById = new Map<number, { stock: number; name: string }>(
      existingProducts.map((p: any) => [
        p.id,
        { stock: p.stock as number, name: p.name as string },
      ]),
    );
    const stockErrors: string[] = [];
    for (const item of parsedItems) {
      const product = stockById.get(item.productId);
      if (!product) continue;
      if (product.stock <= 0) {
        stockErrors.push(`"${product.name}" is out of stock`);
      } else if (item.quantity > product.stock) {
        stockErrors.push(
          `"${product.name}" only has ${product.stock} unit(s) available (requested ${item.quantity})`,
        );
      }
    }
    if (stockErrors.length > 0) {
      return res.status(409).json({
        message: "Some items are unavailable",
        errors: stockErrors,
      });
    }

    const priceById = new Map(
      existingProducts.map((p: any) => [p.id, p.price]),
    );
    let subtotal = 0;
    parsedItems.forEach((item: { productId: number; quantity: number }) => {
      const rawPrice = priceById.get(item.productId);
      const productPrice = Number(rawPrice ?? 0);
      subtotal += item.quantity * productPrice;
    });

    const deliveryMethod =
      req.body.deliveryMethod === "express" ? "express" : "standard";
    const deliveryFee =
      deliveryMethod === "express" ? 0 : adminSettings.deliveryFee;
    const tax = subtotal * (adminSettings.taxRate / 100);
    const total = subtotal + deliveryFee + tax;

    if (adminSettings.minOrderAmount > 0 && subtotal < adminSettings.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is ${adminSettings.defaultCurrency} ${adminSettings.minOrderAmount.toLocaleString()}. Please add more items to continue.`,
      });
    }

    const requestedMethod = paymentMethod === "cod" ? "cod" : "mpesa";
    let normalizedPaymentMethod = requestedMethod;

    if (!adminSettings.mpesaEnabled && !adminSettings.codEnabled) {
      return res.status(400).json({
        message: "No payment methods are currently available. Please try again later.",
      });
    }

    if (!adminSettings.mpesaEnabled) normalizedPaymentMethod = "cod";
    if (!adminSettings.codEnabled) normalizedPaymentMethod = "mpesa";

    const itemsToCreate = parsedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: Number(priceById.get(item.productId) ?? 0),
    }));

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    const orderData: any = {
      phone: normalizedPhone,
      customer: normalizedCustomer,
      total,
      address: normalizedAddress,
      street: typeof street === "string" ? street.trim() : null,
      city: typeof city === "string" ? city.trim() : null,
      postalCode: typeof postalCode === "string" ? postalCode.trim() : null,
      items: {
        create: itemsToCreate,
      },
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: "pending",
    };

    if (Number.isFinite(parsedLatitude)) orderData.latitude = parsedLatitude;
    if (Number.isFinite(parsedLongitude)) orderData.longitude = parsedLongitude;

    // attach authenticated user if present
    if ((req as any).user && (req as any).user.id) {
      const uid = Number((req as any).user.id);
      if (Number.isInteger(uid)) orderData.userId = uid;
    }

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdOrder = await tx.order.create({ data: orderData });

      for (const item of itemsToCreate) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count !== 1) {
          throw new Error(
            `Insufficient stock available for product ${item.productId}`,
          );
        }
      }

      return createdOrder;
    });

    res.status(201).json(order);
  } catch (error: any) {
    console.error(error);
    if (
      typeof error.message === "string" &&
      error.message.includes("Insufficient stock available")
    ) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create an order" });
  }
};

export const getOrders = async (_req: Request, res: Response) => {
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

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    if (!(req as any).user)
      return res.status(401).json({ message: "unauthorized" });
    const uid = Number((req as any).user.id);
    const orders = await prisma.order.findMany({
      where: { userId: uid } as any,
      include: {
        items: {
          include: { product: { select: { name: true, imageUrl: true } } },
        },
        payment: { select: { mpesaReceiptNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
};

export const getNearbyOrders = async (req: Request, res: Response) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Number(req.query.radiusKm) || 5;

    if (!isFinite(lat) || !isFinite(lng)) {
      return res
        .status(400)
        .json({ message: "lat and lng query params required" });
    }

    // approximate degree delta (rough): 1 deg ~ 111 km
    const delta = radiusKm / 111;

    const orders = await prisma.order.findMany({
      where: {
        latitude: { gte: lat - delta, lte: lat + delta },
        longitude: { gte: lng - delta, lte: lng + delta },
      } as any,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch nearby orders" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const existing = await prisma.order.findUnique({
      where: { id: Number(id) },
      select: { paymentMethod: true, paymentStatus: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Order not found" });
    }

    // When a COD order is marked delivered, the cash has been collected —
    // mark paymentStatus as completed so it counts toward revenue.
    const isCodDelivered =
      orderStatus === "delivered" &&
      existing.paymentMethod === "cod" &&
      existing.paymentStatus !== "completed";

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        orderStatus,
        ...(isCodDelivered && { paymentStatus: "completed" }),
      },
    });

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "completed") {
      return res.status(409).json({
        message: "Cannot delete a completed (paid) order",
      });
    }

    const items = await prisma.orderItem.findMany({ where: { orderId: id } });

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const item of items) {
        await tx.product.updateMany({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });

    res.json({ message: "Order deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete order" });
  }
};
