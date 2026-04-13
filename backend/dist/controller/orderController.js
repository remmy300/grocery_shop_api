import prisma from "../lib/prisma.js";
export const createOrder = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const { customer, phone, address, items } = req.body;
        if (!customer || !phone || !address || !items || !Array.isArray(items)) {
            return res.status(400).json({ message: "Missing required  fields" });
        }
        if (items.length === 0) {
            return res
                .status(400)
                .json({ message: "Order must include at least one item" });
        }
        const productIds = items
            .map((item) => Number(item.productId))
            .filter(Boolean);
        const existingProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, price: true },
        });
        const existingIdSet = new Set(existingProducts.map((p) => p.id));
        const missingIds = productIds.filter((id) => !existingIdSet.has(id));
        if (missingIds.length > 0) {
            return res.status(400).json({
                message: `Invalid productId(s): ${missingIds.join(", ")}`,
            });
        }
        const priceById = new Map(existingProducts.map((p) => [p.id, p.price]));
        let total = 0;
        items.forEach((item) => {
            const productPrice = priceById.get(Number(item.productId)) ?? 0;
            total += item.quantity * productPrice;
        });
        const itemsToCreate = items.map((item) => ({
            productId: Number(item.productId),
            quantity: item.quantity,
            price: item.price,
        }));
        const order = await prisma.order.create({
            data: {
                phone,
                customer,
                total,
                address,
                items: {
                    create: itemsToCreate,
                },
            },
        });
        res.status(201).json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create an order" });
    }
};
export const getOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: { items: true },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(orders);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch  orders" });
    }
};
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;
        const order = await prisma.order.update({
            where: { id: Number(id) },
            data: { orderStatus },
        });
        res.status(200).json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update order status" });
    }
};
