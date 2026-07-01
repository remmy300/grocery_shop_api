"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Menu, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed top-0 z-100 w-full border-b border-surface-variant/30 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 py-5 md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary"
        >
          <Leaf className="h-6 w-6" />
          Corner Shop
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative pb-1 text-[15px] font-semibold tracking-tight transition-colors duration-200 ${
                isActive(link.href)
                  ? "text-primary"
                  : "text-on-surface-variant/70 hover:text-primary"
              }`}
            >
              {link.label}
              <span
                className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                  isActive(link.href) ? "w-full" : "w-0"
                }`}
              />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative rounded-full"
          >
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>

          {/* Account — desktop only */}
          <Button asChild size="icon" className="hidden rounded-full md:flex">
            <Link href="/login" aria-label="Sign in">
              <UserRound className="h-5 w-5" />
            </Link>
          </Button>

          {/* Hamburger — mobile only */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="border-b border-border px-6 py-5">
                <SheetTitle className="flex items-center gap-2 text-lg font-extrabold text-primary">
                  <Leaf className="h-5 w-5" />
                  Corner Shop
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive(link.href)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}

                <div className="my-3 h-px bg-border" />

                <SheetClose asChild>
                  <Link
                    href="/cart"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Cart
                    {totalItems > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link
                    href="/login"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    <UserRound className="h-4 w-4" />
                    Account
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
