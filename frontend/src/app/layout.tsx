import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Providers from "@/components/Providers";
import PublicShell from "@/components/PublicShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Corner Store Admin",
  description: "Admin panel for Corner Store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <PublicShell>{children}</PublicShell>
        </Providers>
      </body>
    </html>
  );
}
