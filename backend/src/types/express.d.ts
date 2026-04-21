export interface JwtPayload {
  id: string;
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
