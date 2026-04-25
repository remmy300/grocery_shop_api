"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { AppProvider } from "@/contexts/AppContext";
import { Toaster } from "@/components/ui/sonner";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

if (!googleClientId) {
  throw new Error(
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing. Add it to frontend/.env and restart the app.",
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AppProvider>{children}</AppProvider>
        <Toaster />
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
