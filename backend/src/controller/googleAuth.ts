import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { JwtPayload } from "../types/express.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const normalizeRole = (role?: string | null) => (role || "").toLowerCase();
const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

const isAdminEmail = (email: string) => adminEmails.has(email.toLowerCase());

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
          role: isAdminEmail(payload.email) ? "admin" : "user",
          picture: payload.picture,
        },
      });
    } else if (
      isAdminEmail(payload.email) &&
      normalizeRole(user.role) !== "admin"
    ) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "admin",
          picture: payload.picture ?? user.picture,
        },
      });
    } else if (payload.picture && payload.picture !== user.picture) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { picture: payload.picture },
      });
    }

    const jwtPayload = {
      id: user.id,
      email: user.email,
      picture: user.picture,
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

export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.json(req.user);
};

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      select: { id: true, email: true, role: true },
    });

    res.json(
      admins
        .filter((admin: any) => normalizeRole(admin.role) === "admin")
        .map((admin: any) => ({
          id: admin.id,
          email: admin.email,
          role: normalizeRole(admin.role),
        })),
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
};
