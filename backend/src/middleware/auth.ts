import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/payload";
import { Request, Response, NextFunction } from "express";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const SECRET_KEY = process.env.JWT_SECRET_KEY;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid auth format" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeRoles =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "forbidden" });
    }

    next();
  };
