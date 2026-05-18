"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import EmptyCart from "@/components/cart/emptyCart";
import CartItemCard from "@/components/cart/cartItemCard";
import SummaryRow from "@/components/cart/cartSummary";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const {
    items,
    subtotal,
    isLoading,
    isClearPending,
    isItemPending,

    updateItem,
    removeItem,
    clearCart,
  } = useCart();

  if (isLoading) {
    return (
      <main className="min-h-screen pt-28">
        <div className="mx-auto max-w-screen-2xl px-6">
          <p className="text-muted-foreground">Loading cart…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-14">
      <div className="mx-auto max-w-screen-2xl px-6">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">Your Cart</h1>

          {items.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => clearCart()}
              disabled={isClearPending}
            >
              {isClearPending ? "Clearing..." : "Clear Cart"}
            </Button>
          )}
        </div>

        <section className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {items.length === 0 ? (
              <EmptyCart />
            ) : (
              items.map((item) => {
                const pending = isItemPending(Number(item.id));

                return (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    disabled={pending}
                    onIncrease={() =>
                      updateItem({
                        productId: Number(item.id),
                        quantity: item.quantity + 1,
                      })
                    }
                    onDecrease={() => {
                      if (item.quantity <= 1) {
                        removeItem(Number(item.id));
                        return;
                      }

                      updateItem({
                        productId: Number(item.id),
                        quantity: item.quantity - 1,
                      });
                    }}
                    onRemove={() => removeItem(Number(item.id))}
                  />
                );
              })
            )}
          </div>

          {/* SUMMARY */}
          <aside className="lg:col-span-4">
            <Card className="sticky top-28">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold tracking-tight">Summary</h2>

                <div className="mt-6 space-y-4">
                  <SummaryRow
                    label="Subtotal"
                    value={`$${subtotal.toFixed(2)}`}
                  />

                  <SummaryRow label="Carbon Offset" value="$1.50" />
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${(subtotal + 1.5).toFixed(2)}</span>
                </div>

                <Button
                  asChild
                  className="mt-6 w-full"
                  disabled={items.length === 0}
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardContent>
            </Card>

            {/* SECURITY */}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Secure checkout</span>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
