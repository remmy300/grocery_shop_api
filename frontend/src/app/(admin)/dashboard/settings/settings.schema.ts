import { z } from "zod";

export const settingsSchema = z.object({
  workspaceName: z.string().trim().min(3),

  defaultCurrency: z.string().trim().toUpperCase().length(3),

  notificationsEnabled: z.boolean(),

  timezone: z.string(),

  language: z.enum(["en", "sw"]),

  lowStockThreshold: z
    .number({ error: "Enter a valid number" })
    .int()
    .min(0),

  orderAutoCancelHours: z
    .number({ error: "Enter a valid number" })
    .int()
    .min(1),

  deliveryFee: z.number({ error: "Enter a valid number" }).min(0),

  supportEmail: z.string().email().or(z.literal("")),

  supportPhone: z.string().or(z.literal("")),

  taxRate: z.number({ error: "Enter a valid number" }).min(0).max(100),
});

export type SettingsFormValues = z.input<typeof settingsSchema>;
