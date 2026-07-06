import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
};

export const generateCloudinarySignature = (req: Request, res: Response) => {
  try {
    const { paramsToSign } = req.body as { paramsToSign: Record<string, string | number> };

    if (!paramsToSign || typeof paramsToSign !== "object") {
      return res.status(400).json({ error: "paramsToSign is required" });
    }

    const cl = getCloudinary();
    const signature = cl.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

    return res.json({ signature });
  } catch (error) {
    console.error("Cloudinary signature error:", error);
    return res.status(500).json({ error: "Failed to generate signature" });
  }
};

export const getCloudinaryConfig = (_req: Request, res: Response) => {
  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
};
