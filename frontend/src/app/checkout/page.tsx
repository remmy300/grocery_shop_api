"use client";

import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import {
  CreditCard,
  Lock,
  LocalShipping,
  MyLocation,
} from "@mui/icons-material";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/components/checkout/checkoutContext";

export default function CheckoutPage() {
  const { items } = useCart();

  const {
    state,
    setDelivery,
    setPayment,
    setAddress,
    setLocation,
    subtotal,
    shipping,
    taxes,
    total,
    canCheckout,
  } = useCheckout();

  const [paymentTab, setPaymentTab] = useState<"card" | "wallet">("card");

  /* ---------------- LOCATION HANDLER ---------------- */

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Location error:", err);
        alert("Unable to get your location");
      },
    );
  };

  /* ---------------- CHECKOUT MUTATION ---------------- */

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: Number(i.id),
            quantity: i.quantity,
          })),

          deliveryMethod: state.deliveryMethod,
          paymentMethod: state.paymentMethod,
          address: state.address,
          location: state.location,

          subtotal,
          shipping,
          taxes,
          total,
        }),
      });

      if (!res.ok) throw new Error("Checkout failed");

      return res.json();
    },
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-screen-2xl px-6 pb-20 pt-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT SIDE */}
        <div className="lg:col-span-8 space-y-12">
          {/* HEADER */}
          <div>
            <h1 className="text-4xl font-bold">Secure Checkout</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
              Complete your grocery order
            </p>
          </div>

          {/* ADDRESS */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold">Delivery Details</h2>

            <Card>
              <CardContent className="p-6 grid gap-4">
                <Input
                  placeholder="Full Name"
                  onChange={(e) =>
                    setAddress({
                      ...state.address!,
                      fullName: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Street Address"
                  onChange={(e) =>
                    setAddress({
                      ...state.address!,
                      street: e.target.value,
                    })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="City"
                    onChange={(e) =>
                      setAddress({
                        ...state.address!,
                        city: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="Postal Code"
                    onChange={(e) =>
                      setAddress({
                        ...state.address!,
                        postalCode: e.target.value,
                      })
                    }
                  />
                </div>

                <Input
                  placeholder="Phone Number"
                  onChange={(e) =>
                    setAddress({
                      ...state.address!,
                      phone: e.target.value,
                    })
                  }
                />

                <Button
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  className="gap-2"
                >
                  <MyLocation />
                  Use Current Location
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* DELIVERY */}
          <section>
            <h2 className="text-xl font-bold mb-4">Delivery Method</h2>

            <RadioGroup
              value={state.deliveryMethod ?? "standard"}
              onValueChange={(v) => setDelivery(v as any)}
              className="grid md:grid-cols-2 gap-4"
            >
              <label className="cursor-pointer">
                <RadioGroupItem value="standard" className="sr-only" />
                <Card className="p-4 border">
                  <LocalShipping />
                  <p className="font-bold">Standard</p>
                  <p className="text-sm text-muted-foreground">3–5 days</p>
                </Card>
              </label>

              <label className="cursor-pointer">
                <RadioGroupItem value="express" className="sr-only" />
                <Card className="p-4 border">
                  <p className="font-bold">Express</p>
                  <p className="text-sm text-muted-foreground">Next day</p>
                </Card>
              </label>
            </RadioGroup>
          </section>

          {/* PAYMENT */}
          <section>
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>

            <RadioGroup
              value={state.paymentMethod ?? "mpesa"}
              onValueChange={(v) => setPayment(v as any)}
              className="grid gap-4"
            >
              <label>
                <RadioGroupItem value="mpesa" className="sr-only" />
                <Card className="p-4 border">
                  <p className="font-bold">M-Pesa</p>
                </Card>
              </label>

              <label>
                <RadioGroupItem value="card" className="sr-only" />
                <Card className="p-4 border">
                  <CreditCard />
                  <p className="font-bold">Card</p>
                </Card>
              </label>

              <label>
                <RadioGroupItem value="cod" className="sr-only" />
                <Card className="p-4 border">
                  <p className="font-bold">Cash on Delivery</p>
                </Card>
              </label>
            </RadioGroup>
          </section>

          {/* PAY BUTTON */}
          <Button
            disabled={!canCheckout || checkoutMutation.isPending}
            onClick={() => checkoutMutation.mutate()}
            className="w-full h-14 text-lg font-bold"
          >
            {checkoutMutation.isPending
              ? "Processing..."
              : `Place Order • KES ${total.toFixed(2)}`}
          </Button>

          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            Secure checkout
          </p>
        </div>

        {/* RIGHT SIDE */}
        <aside className="lg:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold">Order Summary</h3>

              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <hr />

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
