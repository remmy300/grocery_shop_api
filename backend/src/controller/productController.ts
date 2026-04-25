import prisma from "../lib/prisma.js";
import { Request, Response } from "express";

const parseInteger = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const normalizeImageUrl = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, stock, price, imageUrl } = req.body;

    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedStock = parseInteger(stock);
    const normalizedPrice = parseInteger(price);

    if (!normalizedName || normalizedStock === null || normalizedPrice === null) {
      return res.status(400).json({
        message: "Name, stock, and price are required and must be valid numbers",
      });
    }

    const product = await prisma.product.create({
      data: {
        name: normalizedName,
        price: normalizedPrice,
        stock: normalizedStock,
        imageUrl: normalizeImageUrl(imageUrl),
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to create new product" });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product by id" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = Number(id);
    const { name, stock, imageUrl, price } = req.body;

    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedStock = parseInteger(stock);
    const normalizedPrice = parseInteger(price);

    if (!normalizedName || normalizedStock === null || normalizedPrice === null) {
      return res.status(400).json({
        message: "Name, stock, and price are required and must be valid numbers",
      });
    }

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const existingProduct = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: normalizedName,
        stock: normalizedStock,
        imageUrl: normalizeImageUrl(imageUrl),
        price: normalizedPrice,
      },
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to update products" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (existingProduct.deletedAt) {
      return res.status(200).json({
        message: "Product already archived",
      });
    }

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({ message: "Product archived successfully" });
  } catch (error) {
    console.error("Failed to archive product:", error);
    res.status(500).json({ message: "Failed to archive product" });
  }
};
