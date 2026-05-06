"use client";

import Link from "next/link";
import { Leaf, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-[100] w-full border-b border-surface-variant/30 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 py-5 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary"
        >
          <Leaf className="h-6 w-6" />
          Botanical Archivist
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-10 font-semibold text-[15px] tracking-tight md:flex">
          <Link href="/products" className="relative text-primary">
            Shop
            <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-primary" />
          </Link>
          <Link
            href="#collection"
            className="text-on-surface-variant/70 hover:text-primary transition"
          >
            Harvests
          </Link>
          <Link
            href="#sidebar"
            className="text-on-surface-variant/70 hover:text-primary transition"
          >
            Stories
          </Link>
          <Link
            href="#journal"
            className="text-on-surface-variant/70 hover:text-primary transition"
          >
            Journal
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/products">
              <ShoppingBag className="h-5 w-5" />
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard">
              <UserRound className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
