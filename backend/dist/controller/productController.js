"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createProduct = async (req, res) => {
    try {
        const { name, stock, price, imageUrl } = req.body;
        const product = await prisma_1.default.product.create({
            data: {
                name,
                price,
                stock,
                imageUrl,
            },
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create new product" });
    }
};
exports.createProduct = createProduct;
