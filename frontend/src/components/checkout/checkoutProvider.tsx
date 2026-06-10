"use client";

import { CheckoutProvider } from "./checkoutContext";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CheckoutProvider>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </CheckoutProvider>
  );
}
