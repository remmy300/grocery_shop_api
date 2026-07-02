import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);

      return res.status(400).json({
        message: "Validation error",
        errors: fieldErrors,
      });
    }

    req.body = result.data;
    next();
  };
