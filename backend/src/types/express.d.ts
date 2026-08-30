import { Request } from "express";
import { JwtPayload } from "./express.js";

export interface JwtPayload {
  id: number;
  email: string;
  role: "admin" | "user";
  picture?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export type AuthenticatedRequest = Request & {
  user: JwtPayload;
};
