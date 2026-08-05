import { z } from "zod";

const numberInput = (
  schema = z.coerce.number({ error: "Enter a valid number" }),
) =>
  z.preprocess(
    (value) => (value === "" || Number.isNaN(value) ? undefined : value),
    schema,
  );

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

  supportEmail: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      message: "Enter a valid support email",
    }),

  supportPhone: z
    .string()
    .trim()
    .refine((value) => value === "" || /^(\+254|0)[17]\d{8}$/.test(value), {
      message: "Enter a valid Kenyan phone number",
    }),

  taxRate: numberInput(
    z.coerce
      .number({ error: "Enter a valid number" })
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot be more than 100"),
  ),
});

export type SettingsFormValues = z.input<typeof settingsSchema>;
