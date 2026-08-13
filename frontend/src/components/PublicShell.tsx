"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/features/Navbar";
import Footer from "@/features/Footer";
import { useSettings } from "@/contexts/SettingsContext";
import { Megaphone, Store } from "lucide-react";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const isAdminRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {settings.announcementBanner ? (
        <div className="flex items-center justify-center gap-2 bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">
          <Megaphone className="h-4 w-4 shrink-0" />
          <span>{settings.announcementBanner}</span>
        </div>
      ) : null}

      {!settings.storeOpen ? (
        <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900">
          <Store className="h-4 w-4 shrink-0" />
          <span>
            {settings.workspaceName || "The store"} is currently closed. You can
            still browse, but orders are paused.
          </span>
        </div>
      ) : null}

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
