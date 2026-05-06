import { useState, useCallback } from "react";

interface UseImageUploadOptions {
  onSuccess?: (imageUrl: string, publicId: string) => void;
  onError?: (error: string) => void;
  maxFileSize?: number;
}

export const useImageUpload = ({
  onSuccess,
  onError,
  maxFileSize = 5,
}: UseImageUploadOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{
    url: string;
    publicId: string;
  } | null>(null);

  const handleUploadSuccess = useCallback(
    (imageUrl: string, publicId: string) => {
      setUploadedImage({ url: imageUrl, publicId });
      setError(null);
      onSuccess?.(imageUrl, publicId);
    },
    [onSuccess],
  );

  const handleUploadError = useCallback(
    (errorMessage: string) => {
      setError(errorMessage);
      onError?.(errorMessage);
    },
    [onError],
  );

  const resetUpload = useCallback(() => {
    setUploadedImage(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    uploadedImage,
    handleUploadSuccess,
    handleUploadError,
    resetUpload,
  };
};
