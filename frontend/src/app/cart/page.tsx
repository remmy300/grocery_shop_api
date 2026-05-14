"use client";

import { Lock } from "lucide-react";
import EmptyCart from "@/components/cart/emptyCart";
import CartItemCard from "@/components/cart/cartItemCard";
import SummaryRow from "@/components/cart/cartSummary";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useCart, type CartItem } from "@/contexts/cartContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CartPage() {
  const queryClient = useQueryClient();

  const { items, subtotal, carbonOffset, total, updateQuantity, removeItem } =
    useCart();

  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      // API EXAMPLE
      // return api.patch(`/cart/${productId}`, { quantity });

      return { productId, quantity };
    },

    onSuccess: (_, variables) => {
      updateQuantity(variables.productId, variables.quantity);

      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      // API EXAMPLE
      // return api.delete(`/cart/${productId}`);

      return productId;
    },

    onSuccess: (productId) => {
      removeItem(productId);

      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });

  return (
    <main className="min-h-screen bg-background pt-28 pb-14">
      <div className="mx-auto max-w-screen-2xl px-6">
        {/* HEADER */}
        <div className="mb-12">
          <span className="mb-2 block text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Your Archive
          </span>

          <h1 className="font-display text-5xl font-extrabold tracking-tight md:text-6xl">
            Curated Basket
          </h1>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* ITEMS */}
          <section className="space-y-6 lg:col-span-8">
            {items.length === 0 ? (
              <EmptyCart />
            ) : (
              items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onIncrease={() =>
                    updateQuantityMutation.mutate({
                      productId: item.id,
                      quantity: item.quantity + 1,
                    })
                  }
                  onDecrease={() =>
                    item.quantity > 1 &&
                    updateQuantityMutation.mutate({
                      productId: item.id,
                      quantity: item.quantity - 1,
                    })
                  }
                  onRemove={() => removeItemMutation.mutate(item.id)}
                />
              ))
            )}
          </section>

          {/* SUMMARY */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Card className="rounded-[28px] border-none bg-muted/40 shadow-sm">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold tracking-tight">Summary</h2>

                  <div className="mt-8 space-y-5">
                    <SummaryRow
                      label="Subtotal"
                      value={`$${subtotal.toFixed(2)}`}
                    />

                    <SummaryRow
                      label="Archivist Shipping"
                      value="Calculated at Checkout"
                      valueClassName="text-primary"
                    />

                    <SummaryRow
                      label="Carbon Neutral Offset"
                      value={`$${carbonOffset.toFixed(2)}`}
                    />
                  </div>

                  <Separator className="my-8" />

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">Total Estimate</span>

                    <span className="text-3xl font-extrabold tracking-tight">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    asChild
                    className="mt-10 h-14 w-full rounded-full text-base font-bold"
                    size="lg"
                  >
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>

                  <div className="mt-8 rounded-2xl border-l-4 border-primary bg-background/80 p-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                      <span className="font-semibold text-primary">
                        Member Perk:
                      </span>{" "}
                      You&apos;re eligible for complimentary chilled packaging
                      on this harvest order.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />

                <span className="text-xs uppercase tracking-[0.2em]">
                  Encrypted Checkout & Secure Payment
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
