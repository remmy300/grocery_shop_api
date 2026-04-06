export interface JwtPayload {
  id: string;
  email: string;
  role: "admin" | "user";
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
