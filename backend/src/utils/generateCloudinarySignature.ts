import { Request, Response } from "express";
import crypto from "crypto";

export const generateCloudinarySignature = (req: Request, res: Response) => {
  try {
    const { paramsToSign } = req.body;

    const apiSecret = process.env.CLOUDINARY_API_SECRET!;

    // STEP 1: sort params
    const sorted = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join("&");

    // STEP 2: DO NOT append with "&"
    const stringToSign = sorted + apiSecret;

    // STEP 3: hash
    const signature = crypto
      .createHash("sha1")
      .update(stringToSign)
      .digest("hex");

    res.json({ signature });
  } catch (error) {
    res.status(500).json({ error: "Signature failed" });
  }
};
