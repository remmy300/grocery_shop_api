import { Request, Response } from "express";
import crypto from "crypto";

export const generateCloudinarySignature = (req: Request, res: Response) => {
  try {
    const { paramsToSign } = req.body;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;

    // Only allow 'timestamp' and 'folder' to be signed
    const allowedParams: Record<string, any> = {};
    if (paramsToSign.timestamp)
      allowedParams.timestamp = paramsToSign.timestamp;
    if (paramsToSign.folder) allowedParams.folder = paramsToSign.folder;

    const filtered = Object.entries(allowedParams).filter(
      ([_, value]) => value !== undefined && value !== null,
    );

    const stringToSign = filtered
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    console.log("STRING TO SIGN:", stringToSign);

    // Append secret
    const signature = crypto
      .createHash("sha1")
      .update(stringToSign + apiSecret)
      .digest("hex");

    res.json({ signature });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate signature" });
  }
};

export const getCloudinaryConfig = (req: Request, res: Response) => {
  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
};
