import { Request, Response } from "express";
import { JwtPayload } from "../types/express.js";
import { findUserProfile, findOrCreateCart } from "../services/userServices.js";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await findUserProfile(Number(req.user!.id));

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const cart = await findOrCreateCart(Number(req.user!.id));

    return res.json(cart);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch cart",
    });
  }
};

export function getUser(req: Request): JwtPayload {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  return req.user;
}
