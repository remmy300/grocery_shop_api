import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, Leaf, ShieldCheck, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "About Us — Corner Shop" };

const VALUES = [
  { icon: Leaf, title: "Fresh First", body: "Every product on our shelf is checked for freshness before it reaches you. We restock daily from local suppliers." },
  { icon: ShieldCheck, title: "Quality Guaranteed", body: "Not satisfied? We'll replace or refund — no questions asked. Your trust is more important than any single sale." },
  { icon: Handshake, title: "Local Partnerships", body: "We work directly with farmers and producers around Nairobi, cutting out unnecessary middlemen." },
  { icon: Sprout, title: "Sustainability", body: "We use biodegradable packaging and plan our routes to minimise our carbon footprint on every delivery." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">

      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
          About Corner Shop
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          We're a Nairobi-based online grocery store on a mission to make fresh,
          quality food accessible to every household — delivered fast, at fair prices.
        </p>
      </div>

      {/* Story */}
      <section className="mb-16 rounded-3xl bg-primary/5 px-8 py-10">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Our Story</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Corner Shop started with a simple observation: buying fresh groceries in Nairobi
            meant navigating traffic, crowded markets, and unreliable stock. We believed there
            was a better way.
          </p>
          <p>
            We built a platform that connects households directly to vetted local suppliers —
            from fresh produce farmers in the outskirts of Nairobi to artisan bakers in Westlands.
            Every product you see on our site has been tasted, tested, and approved by our team.
          </p>
          <p>
            Today we serve hundreds of households across Nairobi, and we're growing. But our
            commitment stays the same: <strong className="text-foreground">fresh food, honest prices, reliable delivery.</strong>
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-bold text-foreground">What We Stand For</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-3xl bg-primary px-8 py-10 text-center text-primary-foreground">
        <h2 className="text-2xl font-extrabold">Ready to shop fresh?</h2>
        <p className="mt-2 text-primary-foreground/80">
          Browse our full range of groceries and get them delivered today.
        </p>
        <Button asChild className="mt-6 rounded-full bg-white text-primary hover:bg-white/90">
          <Link href="/products">Shop Now</Link>
        </Button>
      </section>
    </div>
  );
}
