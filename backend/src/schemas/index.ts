import { z } from "zod";

//  Auth

export const googleLoginSchema = z.object({
  token: z.string().min(1, "Google token is required"),
});

export const refreshTokenSchema = z.object({
  token: z.string().min(1, "Refresh token is required"),
});

//  Products

export const createProductSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  category: z.string().min(1).max(100).trim(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  unit: z.string().max(50).trim().optional().default("per piece"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const updateProductSchema = createProductSchema.partial();

//  Orders

const kenyaPhone = z
  .string()
  .regex(
    /^(\+?254|0)[0-9]{9}$/,
    "Invalid Kenyan phone number (e.g. 0712345678)",
  );

export const createOrderSchema = z.object({
  customer: z.string().min(2).max(100).trim(),
  phone: kenyaPhone,
  address: z.string().min(5).max(300).trim(),
  street: z.string().max(300).trim().optional(),
  city: z.string().max(100).trim().optional(),
  postalCode: z.string().max(30).trim().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  paymentMethod: z.enum(["mpesa", "cod"]).optional().default("mpesa"),
  deliveryMethod: z.enum(["standard", "express"]).optional().default("standard"),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce
          .number()
          .int()
          .positive("Quantity must be at least 1"),
      }),
    )
    .min(1, "Order must contain at least one item"),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
    "pending",
    "confirmed",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]),
});

// Payments

export const initiatePaymentSchema = z.object({
  orderId: z.coerce.number().int().positive("Invalid order ID"),
  phoneNumber: kenyaPhone,
  amount: z.coerce.number().positive("Amount must be greater than 0"),
});
