"use client";

import { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useApp } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/api";

const GoogleLoginButton = () => {
  const { applySessionTokens } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    try {
      const { credential } = credentialResponse;

      if (!credential) {
        setError("Google did not return a credential.");
        return;
      }

      setLoading(true);
      setError(null);

      const response = await apiRequest<{
        accessToken: string;
        refreshToken?: string;
      }>("/api/auth/google", {
        method: "POST",
        json: { token: credential },
      });

      await applySessionTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    setError("Google sign-in failed. Please try again.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-low px-6">
      <div className="w-full max-w-md rounded-3xl bg-surface-container-lowest p-8 shadow-lg">
        <div className="mb-8 text-center">
          <p className="text-xs font-label uppercase tracking-widest text-secondary-foreground">
            Corner Store
          </p>
          <h2 className="mt-2 text-3xl font-heading font-extrabold tracking-tighter text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-secondary-foreground">
            Sign in with your Google account to continue.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            theme="outline"
            size="large"
            text="signin_with"
            shape="pill"
            width="300"
          />

          {loading ? (
            <p className="text-sm text-secondary-foreground">
              Signing you in...
            </p>
          ) : null}

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
