"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/layout/GoogleLoginBtn";
import { useApp } from "@/contexts/AppContext";

const Login = () => {
  const router = useRouter();
  const { state } = useApp();

  useEffect(() => {
    if (!state.loading && state.isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [router, state.isAuthenticated, state.loading]);

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-secondary-foreground">Preparing sign-in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GoogleLoginButton />
    </div>
  );
};

export default Login;
