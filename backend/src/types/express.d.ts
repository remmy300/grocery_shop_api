import { JwtPayload } from "./payload";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

declare global {
  namespace Express {
    interface Request {
      id: string;
      role: string;
    }
  }
}
