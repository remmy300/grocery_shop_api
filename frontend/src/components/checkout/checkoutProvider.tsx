// app/checkout/layout.tsx
"use client";

import { CheckoutProvider } from "./checkoutContext";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CheckoutProvider>{children}</CheckoutProvider>;
}
