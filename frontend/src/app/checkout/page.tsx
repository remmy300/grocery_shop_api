"use client";

import Image from "next/image";
import { CreditCard, Lock, LocalShipping, Rocket } from "@mui/icons-material";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { useCart } from "@/hooks/useCart";

import { useMutation } from "@tanstack/react-query";

import { useState } from "react";

type DeliveryMethod = "standard" | "express";

export default function CheckoutPage() {
  const { items, subtotal, total } = useCart();

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("standard");

  const shippingFee = deliveryMethod === "express" ? 12.5 : 0;

  const taxes = 21.2;

  const grandTotal = subtotal + shippingFee + taxes;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          deliveryMethod,
          total: grandTotal,
        }),
      });

      if (!response.ok) {
        throw new Error("Checkout failed");
      }

      return response.json();
    },
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-screen-2xl px-6 pb-20 pt-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* LEFT SIDE */}

          <div className="space-y-12 lg:col-span-8">
            {/* HEADER */}

            <header>
              <h1 className="mb-2 text-4xl font-bold tracking-tight">
                Secure Checkout
              </h1>

              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Finalizing your botanical selection
              </p>
            </header>

            {/* SHIPPING */}

            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Shipping Information</h2>
              </div>

              <Card className="rounded-3xl border-none shadow-none">
                <CardContent className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Full Name
                    </Label>

                    <Input
                      placeholder="Julian Vane"
                      className="h-14 rounded-2xl border-0 bg-muted"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Street Address
                    </Label>

                    <Input
                      placeholder="245 Archivist Lane"
                      className="h-14 rounded-2xl border-0 bg-muted"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      City
                    </Label>

                    <Input
                      placeholder="Nairobi"
                      className="h-14 rounded-2xl border-0 bg-muted"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Postal Code
                    </Label>

                    <Input
                      placeholder="00100"
                      className="h-14 rounded-2xl border-0 bg-muted"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Phone Number
                    </Label>

                    <Input
                      placeholder="+254 700 000 000"
                      className="h-14 rounded-2xl border-0 bg-muted"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* DELIVERY */}

            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Delivery Method</h2>
              </div>

              <RadioGroup
                value={deliveryMethod}
                onValueChange={(value) =>
                  setDeliveryMethod(value as DeliveryMethod)
                }
                className="grid gap-4 md:grid-cols-2"
              >
                {/* STANDARD */}

                <label>
                  <RadioGroupItem value="standard" className="sr-only" />

                  <Card
                    className={`cursor-pointer rounded-3xl border-2 transition-all ${
                      deliveryMethod === "standard"
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <LocalShipping className="text-primary" />

                        <div
                          className={`h-5 w-5 rounded-full border-2 ${
                            deliveryMethod === "standard"
                              ? "border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {deliveryMethod === "standard" && (
                            <div className="m-1 h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>

                      <p className="mb-1 font-bold">Standard Harvest</p>

                      <p className="text-sm text-muted-foreground">
                        3–5 business days. Eco-conscious packaging included.
                      </p>

                      <p className="mt-4 font-bold text-primary">Free</p>
                    </CardContent>
                  </Card>
                </label>

                {/* EXPRESS */}

                <label>
                  <RadioGroupItem value="express" className="sr-only" />

                  <Card
                    className={`cursor-pointer rounded-3xl border-2 transition-all ${
                      deliveryMethod === "express"
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <Rocket className="text-muted-foreground" />

                        <div
                          className={`h-5 w-5 rounded-full border-2 ${
                            deliveryMethod === "express"
                              ? "border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {deliveryMethod === "express" && (
                            <div className="m-1 h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>

                      <p className="mb-1 font-bold">Prime Ripeness</p>

                      <p className="text-sm text-muted-foreground">
                        Next-day delivery. Temperature-controlled transport.
                      </p>

                      <p className="mt-4 font-bold">$12.50</p>
                    </CardContent>
                  </Card>
                </label>
              </RadioGroup>
            </section>

            {/* PAYMENT */}

            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Payment</h2>
              </div>

              <Card className="rounded-3xl border-none">
                <CardContent className="space-y-8 p-8">
                  {/* PAYMENT TABS */}

                  <div className="flex w-fit rounded-full bg-muted p-1">
                    <button className="rounded-full bg-background px-8 py-2 text-sm font-bold shadow-sm">
                      Credit Card
                    </button>

                    <button className="px-8 py-2 text-sm font-bold text-muted-foreground">
                      Digital Wallet
                    </button>
                  </div>

                  {/* CARD FORM */}

                  <div className="space-y-6">
                    <div>
                      <Label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Card Number
                      </Label>

                      <div className="relative">
                        <Input
                          placeholder="0000 0000 0000 0000"
                          className="h-14 rounded-2xl border-0 bg-muted pr-12"
                        />

                        <CreditCard className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Expiry Date
                        </Label>

                        <Input
                          placeholder="MM / YY"
                          className="h-14 rounded-2xl border-0 bg-muted"
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          CVC
                        </Label>

                        <Input
                          placeholder="123"
                          className="h-14 rounded-2xl border-0 bg-muted"
                        />
                      </div>
                    </div>
                  </div>

                  {/* COMPLETE PURCHASE */}

                  <div className="border-t pt-6">
                    <Button
                      onClick={() => checkoutMutation.mutate()}
                      disabled={checkoutMutation.isPending}
                      className="h-16 w-full rounded-full text-lg font-bold"
                    >
                      {checkoutMutation.isPending
                        ? "Processing..."
                        : `Complete Purchase — $${grandTotal.toFixed(2)}`}
                    </Button>

                    <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      Your transaction is secured by end-to-end botanical
                      encryption.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              {/* ORDER SUMMARY */}

              <Card className="rounded-3xl border-none">
                <CardContent className="p-8">
                  <h3 className="mb-8 text-xl font-bold">Order Summary</h3>

                  <div className="mb-8 space-y-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-bold">{item.name}</p>

                          <p className="text-xs text-muted-foreground">
                            {item.subtitle}
                          </p>
                        </div>

                        <p className="text-sm font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* TOTALS */}

                  <div className="space-y-4 border-t pt-6">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>

                      <span>${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Shipping</span>

                      <span className="font-medium text-primary">
                        ${shippingFee.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Estimated Taxes</span>

                      <span>${taxes.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between pt-4 text-lg font-bold">
                      <span>Total</span>

                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
