import { Request, Response, NextFunction } from "express";

// Safaricom production callback IPs
const SAFARICOM_IPS = new Set([
  "196.201.214.200",
  "196.201.214.206",
  "196.201.213.100",
  "196.201.214.207",
  "196.201.214.208",
  "196.201.213.109",
  "196.201.214.191",
  "196.201.214.214",
  "196.201.214.219",
  "196.201.214.220",
  "196.201.214.221",
  "196.201.214.222",
]);

export const mpesaIpWhitelist = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Skip IP check in sandbox/development — Safaricom sandbox uses different IPs
  if (process.env.MPESA_ENVIRONMENT !== "production") {
    return next();
  }

  const ip = (req.ip ?? "").replace("::ffff:", ""); // strip IPv4-mapped IPv6 prefix

  if (!SAFARICOM_IPS.has(ip)) {
    console.warn(`[mpesa] callback blocked — unexpected IP: ${ip}`);
    return res.status(403).json({ ResultCode: 1, ResultDesc: "Forbidden" });
  }

  next();
};
