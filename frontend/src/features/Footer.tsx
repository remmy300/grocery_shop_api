"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const currentYear = new Date().getFullYear();

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Enter a valid email");
      return;
    }

    toast.success("Subscribed successfully");
    setEmail("");
  };

  return (
    <footer className="mt-12 bg-stone-900 py-20 text-stone-300">
      <div className="mx-auto grid max-w-screen-2xl gap-16 px-6 md:grid-cols-2 lg:grid-cols-4 md:px-8">
        {/* Brand */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-2xl font-extrabold text-white">
            <Leaf className="h-6 w-6 text-primary" />
            Corner Shop
          </div>
          <p className="text-sm text-stone-400">
            Dedicated to preserving heritage flavors and supporting regenerative
            ecosystems.
          </p>
        </div>

        {/* Links */}
        <div className="space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white">
            Our Story
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="#">The Philosophy</Link>
            </li>
            <li>
              <Link href="#">Meet the Farmers</Link>
            </li>
            <li>
              <Link href="#">Standards</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white">
            Help
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="#">Shipping</Link>
            </li>
            <li>
              <Link href="#">Returns</Link>
            </li>
            <li>
              <Link href="#">Subscriptions</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white">
            Newsletter
          </h4>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="bg-stone-800 text-white border-none"
            />
            <Button type="submit">Join</Button>
          </form>
        </div>
      </div>

      <div className="mt-16 text-center text-xs text-stone-500">
        © {currentYear} Corner Shop
      </div>
    </footer>
  );
}
