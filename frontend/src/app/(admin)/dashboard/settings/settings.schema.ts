import { z } from "zod";

const numberInput = (
  schema = z.coerce.number({ error: "Enter a valid number" }),
) =>
  z.preprocess(
    (value) => (value === "" || Number.isNaN(value) ? undefined : value),
    schema,
  );

const stringInput = z.string().trim();

export const settingsSchema = z.object({
  workspaceName: z.coerce
    .string()
    .trim()
    .min(3, "Workspace name must be at least 3 characters"),

  defaultCurrency: z.coerce
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Use a 3-letter currency code, e.g. KES"),

  notificationsEnabled: z.boolean(),

  timezone: z.string().min(1, "Select a timezone"),

  language: z.enum(["en", "sw"]),

  lowStockThreshold: numberInput(
    z.coerce
      .number({ error: "Enter a valid number" })
      .int("Enter a whole number")
      .min(0, "Low stock threshold cannot be negative"),
  ),

  orderAutoCancelHours: numberInput(
    z.coerce
      .number({ error: "Enter a valid number" })
      .int("Enter a whole number")
      .min(1, "Auto cancel must be at least 1 hour"),
  ),

  deliveryFee: numberInput(
    z.coerce
      .number({ error: "Enter a valid number" })
      .min(0, "Delivery fee cannot be negative"),
  ),

  minOrderAmount: numberInput(
    z.coerce
      .number({ error: "Enter a valid number" })
      .min(0, "Minimum order cannot be negative"),
  ),

  freeDeliveryThreshold: numberInput(
    z.coerce
      .number({ error: "Enter a valid number" })
      .min(0, "Free delivery threshold cannot be negative"),
  ),

  deliveryRadiusKm: numberInput(
    z.coerce
      .number({ error: "Enter a valid number" })
      .int("Enter a whole number")
      .min(1, "Delivery radius must be at least 1 km"),
  ),

  deliveryTimeWindow: stringInput,

  taxRate: numberInput(
    z.coerce
      .number({ error: "Enter a valid number" })
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot be more than 100"),
  ),

  mpesaEnabled: z.boolean(),

  codEnabled: z.boolean(),

  allowRegistration: z.boolean(),

  hideOutOfStock: z.boolean(),

  storeOpen: z.boolean(),

  storeTagline: stringInput,

  announcementBanner: stringInput,

  supportEmail: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      { message: "Enter a valid support email" },
    ),

  supportPhone: z
    .string()
    .trim()
    .refine(
      (value) => {
        const normalized = value.replace(/[\s-]/g, "");
        return normalized === "" || /^(\+254|0)7\d{8}$/.test(normalized);
      },
      {
        message: "Enter a valid Kenyan phone number, e.g. +254712345678",
      },
    ),
});

export type SettingsFormValues = z.input<typeof settingsSchema>;
