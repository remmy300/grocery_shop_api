import { z } from "zod";

export const profileInfoSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export type ProfileInfoFormValues = z.input<typeof profileInfoSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type PasswordFormValues = z.input<typeof passwordSchema>;
