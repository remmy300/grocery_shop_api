import prisma from "../lib/prisma.js";
import { Request, Response } from "express";

export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log("Body:", req.body);

    const { name, stock, price, imageUrl } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        price,
        stock,
        imageUrl,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to create new product" });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product by id" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, stock, imageUrl, price } = req.body;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, stock, imageUrl, price },
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to update products" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({ message: "Product deleted succesfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete  product by id" });
  }
};
