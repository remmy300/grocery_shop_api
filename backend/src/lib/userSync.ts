import prisma from "./prisma.js";
import type { User } from "@prisma/client";

const normalizeRole = (role?: string | null) => (role || "").toLowerCase();

const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export const isAdminEmail = (email: string) =>
  adminEmails.has(email.toLowerCase());

/**
 * Resolves a Clerk-authenticated request to an internal Prisma User row,
 * creating or linking it on first sight. Mirrors the upsert-by-email logic
 * the old Google login flow used, keyed additionally by clerkId.
 */
export const syncClerkUser = async (
  clerkId: string,
  email: string,
  picture?: string | null,
): Promise<User> => {
  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: "",
        role: isAdminEmail(email) ? "admin" : "user",
        picture: picture ?? undefined,
        clerkId,
      },
    });
    return user;
  }

  const updates: Record<string, unknown> = {};
  if (user.clerkId !== clerkId) updates.clerkId = clerkId;
  if (isAdminEmail(email) && normalizeRole(user.role) !== "admin") {
    updates.role = "admin";
  }
  if (picture && picture !== user.picture) updates.picture = picture;

  if (Object.keys(updates).length > 0) {
    user = await prisma.user.update({ where: { id: user.id }, data: updates });
  }

  return user;
};
