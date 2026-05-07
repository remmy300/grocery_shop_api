import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Providers from "@/components/Providers";
import Navbar from "@/features/Navbar";
import Footer from "@/features/Footer";

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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            {/* Header */}
            <header className="sticky top-0 mb-6 z-50">
              <Navbar />
            </header>

            {/* Page content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer>
              <Footer />
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
