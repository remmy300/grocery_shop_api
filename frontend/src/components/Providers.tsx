"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { CheckoutProvider } from "./checkout/checkoutContext";
import { AppProvider } from "@/contexts/AppContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ReactQueryProvider>
          <SettingsProvider>
            <AppProvider>
              <CheckoutProvider> {children}</CheckoutProvider>
            </AppProvider>
          </SettingsProvider>
        </ReactQueryProvider>
        <Toaster />
      </ThemeProvider>
    </ClerkProvider>
  );
}
