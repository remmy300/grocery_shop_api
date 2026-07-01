"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/features/Navbar";
import Footer from "@/features/Footer";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>
      <main className="flex-1">{children}</main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
