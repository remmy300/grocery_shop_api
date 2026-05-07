import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ShoppingBag, ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Cart | Botanical Archivist",
  description: "Review the items in your cart before checkout.",
};

const suggestions = [
  "Heritage Apples",
  "Ancient Grain Sourdough",
  "Tuscan Kale",
];

export default function CartPage() {
  return (
    <main
      className={`min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(13,99,27,0.10),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(255,219,207,0.75),_transparent_22%),linear-gradient(180deg,_#faf9f6_0%,_#f7f5ef_100%)] text-foreground ${displayFont.className}`}
    >
      <div className="mx-auto max-w-screen-xl px-6 pb-20 pt-32 md:px-8">
        <div className="mb-10 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
          <Leaf className="h-4 w-4" />
          Cart
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-[2rem] border-border/60 bg-white shadow-[0_24px_70px_rgba(26,28,28,0.08)]">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tighter md:text-5xl">
                    Your Cart
                  </h1>
                  <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                    Add seasonal harvests from the product archive and review
                    them here before checkout.
                  </p>
                </div>
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>

              <div className="mt-10 rounded-[1.5rem] border border-dashed border-border/70 bg-surface-container-low p-8 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
                <h2 className="mt-4 text-2xl font-bold">Your cart is empty</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse the archive and add a few products to get started.
                </p>
                <Button asChild className="mt-6 rounded-full px-6">
                  <Link href="/products">
                    Browse products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-border/60 bg-white shadow-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-extrabold tracking-tight">Suggested for you</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Popular items to help you build a basket.
              </p>
              <div className="mt-6 space-y-3">
                {suggestions.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface-container-low px-4 py-4"
                  >
                    <span className="font-medium">{item}</span>
                    <span className="text-sm text-muted-foreground">$0.00</span>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="mt-6 w-full rounded-full">
                <Link href="/products">Continue shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
