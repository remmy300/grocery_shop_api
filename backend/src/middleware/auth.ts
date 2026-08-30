import { Request, Response, NextFunction } from "express";
import { createClerkClient, verifyToken } from "@clerk/backend";
import prisma from "../lib/prisma.js";
import { syncClerkUser } from "../lib/userSync.js";
import { JwtPayload } from "../types/express.js";

let clerkClient: ReturnType<typeof createClerkClient> | null = null;
const getClerkClient = () => {
  if (!clerkClient) {
    clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }
  return clerkClient;
};

const extractToken = (req: Request): string | null => {
  // Clerk's session cookie takes priority; fall back to Authorization header
  if (req.cookies?.__session) return req.cookies.__session as string;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
};

const resolveUser = async (token: string): Promise<JwtPayload | null> => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY is not configured");
  }

  const claims = await verifyToken(token, { secretKey });
  const clerkId = claims.sub;

  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    // Clerk's default session token only carries the user id (`sub`), not
    // email — fetch the full user record from Clerk's Backend API to
    // provision the local row on first sight.
    const clerkUser = await getClerkClient().users.getUser(clerkId);
    const email =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) return null;

    user = await syncClerkUser(clerkId, email, clerkUser.imageUrl);
  }

  return {
    id: user.id,
    email: user.email,
    role: (user.role as "admin" | "user") || "user",
    picture: user.picture ?? undefined,
  };
};

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.CLERK_SECRET_KEY) {
    console.error("Clerk secret key not configured");
    return res.status(500).json({
      message: "Server configuration error: Clerk secret key missing",
      error: "AUTH_CONFIG_ERROR",
    });
  }

  const token = extractToken(req);
  if (!token) {
    console.warn(
      `[auth] No token on ${req.method} ${req.path}   cookies:`,
      Object.keys(req.cookies || {}),
      "authHeader:",
      req.headers.authorization ? "present" : "absent",
    );
    return res.status(401).json({
      message: "No token provided",
      error: "NO_TOKEN",
    });
  }

  try {
    const user = await resolveUser(token);
    if (!user) {
      console.warn(
        `[auth] Token verified but no user resolved on ${req.method} ${req.path}`,
      );
      return res
        .status(401)
        .json({ message: "User not found", error: "NO_USER" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("[auth] Clerk token verification failed:", error);
    return res
      .status(401)
      .json({ message: "Authentication failed", error: "AUTH_ERROR" });
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = extractToken(req);

  if (process.env.CLERK_SECRET_KEY && token) {
    try {
      const user = await resolveUser(token);
      if (user) req.user = user;
    } catch {
      // expired / invalid — continue as guest
    }
  }

  next();
};

export const authorizeRoles =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role?.toLowerCase();

    if (!userRole) {
      return res.status(401).json({
        message: "Unauthorized",
        error: "NO_USER_CONTEXT",
      });
    }

    const allowedRoles = roles.map((r) => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
