import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/express.js";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const SECRET_KEY =
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET_KEY;

  if (!SECRET_KEY) {
    console.error(" JWT secret not configured");
    return res.status(500).json({
      message: "Server configuration error: JWT secret missing",
      error: "AUTH_CONFIG_ERROR",
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
      error: "NO_TOKEN",
    });
  }

  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Invalid auth format. Expected: Bearer <token>",
      error: "INVALID_AUTH_FORMAT",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "Token expired",
        error: "TOKEN_EXPIRED",
      });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: "Invalid token",
        error: "INVALID_TOKEN",
      });
    }
    return res.status(401).json({
      message: "Authentication failed",
      error: "AUTH_ERROR",
    });
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const SECRET_KEY =
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET_KEY;

  const token = req.headers.authorization?.split(" ")[1];

  if (SECRET_KEY && token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
      req.user = decoded;
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
