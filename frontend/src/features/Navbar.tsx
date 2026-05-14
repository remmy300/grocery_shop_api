"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, ShoppingBag, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Shop",
    href: "/products",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-[100] w-full border-b border-surface-variant/30 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 py-5 md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary"
        >
          <Leaf className="h-6 w-6" />
          Coner Shop
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative pb-1 text-[15px] font-semibold tracking-tight transition-colors duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-on-surface-variant/70 hover:text-primary"
                }`}
              >
                {link.label}

                {/* Active underline */}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                    isActive ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
            </Link>
          </Button>

          <Button asChild size="icon" className="rounded-full">
            <Link href="/login" aria-label="Admin sign in">
              <UserRound className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
