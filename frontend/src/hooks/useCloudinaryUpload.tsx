"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { CloudinarySignatureResponse } from "@/types";

type UploadResult = {
  secure_url: string;
  public_id: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
};

const CLOUDINARY_FOLDER = "grocery_shop";

const uploadFile = async (file: File): Promise<UploadResult> => {
  const timestamp = Math.floor(Date.now() / 1000);

  const { apiKey, cloudName } = await apiRequest<
    Pick<CloudinarySignatureResponse, "apiKey" | "cloudName">
  >("/api/admin/cloudinary/config");

  // Only sign timestamp and folder, do NOT include resource_type
  const { signature } = await apiRequest<CloudinarySignatureResponse>(
    "/api/admin/cloudinary/signature",
    {
      method: "POST",
      json: {
        paramsToSign: {
          timestamp,
          folder: CLOUDINARY_FOLDER,
        },
      },
    },
  );

  if (!signature) {
    throw new Error("Failed to generate Cloudinary signature.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", CLOUDINARY_FOLDER);
  // Do NOT append resource_type to formData, let Cloudinary default to auto

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Failed to upload image to Cloudinary",
    );
  }

  if (!data.secure_url || !data.public_id) {
    throw new Error("Cloudinary upload completed without an image URL.");
  }

  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
  };
};

export const useCloudinaryUpload = () => {
  const [ready, setReady] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);
  const openUpload = async (onSuccess: (result: UploadResult) => void) => {
    if (!ready) {
      toast.error("Uploader not ready");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.className = "hidden";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        input.remove();
        return;
      }

      try {
        setUploading(true);
        const result = await uploadFile(file);
        onSuccess(result);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        toast.error(message);
      } finally {
        setUploading(false);
        input.remove();
      }
    };

    document.body.appendChild(input);
    input.click();
  };

  return {
    openUpload,
    uploading,
    ready,
  };
};
