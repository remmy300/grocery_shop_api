import prisma from "../lib/prisma.js";
import { Request, Response } from "express";

const normalizeRole = (role?: string | null) => (role || "").toLowerCase();

const titleCase = (v: string) =>
  v
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
const getInitials = (email: string) =>
  email
    .split("@")[0]
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
const getDisplayName = (email: string) =>
  titleCase(email.split("@")[0].replace(/[._-]+/g, " "));
const fmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const formatProfile = (user: {
  id: number;
  email: string;
  role: string;
  createdAt: Date;
}) => ({
  id: user.id,
  email: user.email,
  role: titleCase(user.role || "user"),
  displayName: getDisplayName(user.email),
  initials: getInitials(user.email),
  joinedOn: fmt.format(user.createdAt),
});

/**
 * Called by the frontend right after a Clerk sign-in/sign-up completes.
 * The `auth` middleware has already resolved (and provisioned, if new)
 * `req.user` from the verified Clerk session, so this just returns the
 * current profile — optionally refreshing the avatar the client sends along.
 */
export const syncUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const picture = req.body?.picture as string | undefined;
    let user = await prisma.user.findUniqueOrThrow({
      where: { id: Number(req.user.id) },
    });

    if (picture && picture !== user.picture) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { picture },
      });
    }

    return res.json(formatProfile(user));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to sync user" });
  }
};

export const logout = (_req: Request, res: Response) => {
  // Clerk owns session invalidation client-side; nothing to clear server-side.
  return res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(formatProfile(user));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "admin",
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return res.json(
      admins.map(
        (admin: { id: number; email: string; role: string | null }) => ({
          id: admin.id,
          email: admin.email,
          role: normalizeRole(admin.role),
        }),
      ),
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch admins",
    });
  }
};
