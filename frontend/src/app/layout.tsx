import type { Metadata } from "next";
import "./globals.css";

import Providers from "@/components/Providers";
import PublicShell from "@/components/PublicShell";

export const metadata: Metadata = {
  title: "Corner Store",
  description: "Fresh groceries delivered to your door",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <PublicShell>{children}</PublicShell>
        </Providers>
      </body>
    </html>
  );
}
