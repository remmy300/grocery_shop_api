import prisma from "../lib/prisma.js";
import express from "express";
import { Request, Response } from "express";
import { Router } from "express";

const router = express.Router();

const parseInteger = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const normalizeImageUrl = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
};

const normalizeCategory = (value: unknown) => {
  if (typeof value !== "string") return "General Grocery";
  const trimmed = value.trim();
  return trimmed || "General Grocery";
};

// CREATE PRODUCT
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, category, unit, stock, price, imageUrl } = req.body;

    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedStock = parseInteger(stock);
    const normalizedPrice = parseInteger(price);
    const normalizedUnit = typeof unit === "string" && unit.trim() ? unit.trim() : "per piece";

    if (
      !normalizedName ||
      normalizedStock === null ||
      normalizedPrice === null
    ) {
      return res.status(400).json({
        message:
          "Name, stock, and price are required and must be valid integers",
      });
    }

    const product = await prisma.product.create({
      data: {
        name: normalizedName,
        category: normalizeCategory(category),
        unit: normalizedUnit,
        stock: normalizedStock,
        price: normalizedPrice,
        imageUrl: normalizeImageUrl(imageUrl),
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return res.status(500).json({ message: "Failed to create product" });
  }
};

// GET PRODUCTS (ONLY ACTIVE)
export const getProducts = async (_: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch products",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// GET SINGLE PRODUCT
export const getProduct = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch {
    return res.status(500).json({ message: "Failed to fetch product" });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const { name, category, unit, stock, price, imageUrl } = req.body;

    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedStock = parseInteger(stock);
    const normalizedPrice = parseInteger(price);
    const normalizedUnit = typeof unit === "string" && unit.trim() ? unit.trim() : "per piece";

    if (
      !normalizedName ||
      normalizedStock === null ||
      normalizedPrice === null
    ) {
      return res.status(400).json({
        message:
          "Name, stock, and price are required and must be valid integers",
      });
    }

    const existingProduct = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: normalizedName,
        category: normalizeCategory(category),
        unit: normalizedUnit,
        stock: normalizedStock,
        price: normalizedPrice,
        imageUrl: normalizeImageUrl(imageUrl),
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update product" });
  }
};

// SEARCH PRODUCTS
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q, category, maxPrice, page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (q && typeof q === "string" && q.trim()) {
      where.name = { contains: q.trim(), mode: "insensitive" };
    }
    if (category && typeof category === "string") {
      where.category = category;
    }
    if (maxPrice && Number.isFinite(Number(maxPrice))) {
      where.price = { lte: Number(maxPrice) };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: "asc" },
      }),
      prisma.product.count({ where }),
    ]);

    return res.status(200).json({
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("SEARCH PRODUCTS ERROR:", error);
    return res.status(500).json({ message: "Failed to search products" });
  }
};

// SOFT DELETE PRODUCT
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
    });

    return res.status(200).json({ message: "Product archived successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to archive product" });
  }
};
