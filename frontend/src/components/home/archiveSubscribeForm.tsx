"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ArchiveSubscribeForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setSubmitted(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 flex flex-col gap-4 md:flex-row md:justify-center"
    >
      <Input
        type="email"
        name="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setSubmitted(false);
        }}
        placeholder="Your email address"
        required
        aria-label="Email address"
        className="h-12 rounded-full border-primary-foreground/20 bg-primary-foreground/10 px-5 text-primary-foreground placeholder:text-primary-foreground/60 md:w-96"
      />
      <Button
        type="submit"
        className="h-12 rounded-full bg-secondary-fixed px-8 text-secondary-foreground hover:bg-secondary-fixed/90"
      >
        {submitted ? "Joined" : "Subscribe Now"}
      </Button>
    </form>
  );
}
