"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  /** "light" — for dark backgrounds (home page banner).
   *  "dark"  — for light/dark footer backgrounds. */
  variant?: "light" | "dark";
  placeholder?: string;
  buttonLabel?: string;
};

export default function NewsletterForm({
  variant = "dark",
  placeholder = "Your email address",
  buttonLabel = "Subscribe",
}: Props) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    toast.success("Subscribed! We'll be in touch.");
    setEmail("");
  };

  const isLight = variant === "light";

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1",
          isLight
            ? "border-white/30 bg-white/20 text-white placeholder:text-white/60 focus-visible:ring-white"
            : "border-stone-700 bg-stone-800 text-white placeholder:text-stone-400",
        )}
      />
      <Button
        type="submit"
        className={cn(
          isLight
            ? "bg-white text-primary hover:bg-white/90"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        {buttonLabel}
      </Button>
    </form>
  );
}
