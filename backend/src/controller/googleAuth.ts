import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { JwtPayload } from "../types/express";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({ message: "No email from Google" });
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          password: "",
          role: "user",
        },
      });
    }

    const jwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid Google token" });
  }
};

export const refreshToken = (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  const refreshSecret = process.env.JWT_REFRESH_TOKEN;
  if (!refreshSecret) {
    return res
      .status(500)
      .json({ message: "Refresh token secret is not configured" });
  }

  try {
    const decoded = jwt.verify(token, refreshSecret) as JwtPayload;
    const accessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
