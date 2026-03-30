import jwt, { SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";

export const generateAccessToken = (payload: object) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN;

  if (!secret) throw new Error("JWT_ACCESS_SECRET is not defined");
  if (!expiresIn) throw new Error("JWT_ACCESS_EXPIRES_IN is not defined");

  const options: SignOptions = {
    expiresIn: expiresIn as StringValue,
  };

  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (payload: object) => {
  const secret = process.env.JWT_REFRESH_TOKEN;
  const expiresIn = process.env.JWT_REFRESH_TOKEN;
  if (!secret) throw new Error("jwt access token is not available");
  if (!expiresIn) throw new Error("JWT_REFRESH_TOKEN is not set");

  const options: SignOptions = {
    expiresIn: expiresIn as StringValue,
  };

  return jwt.sign(payload, secret, options);
};
