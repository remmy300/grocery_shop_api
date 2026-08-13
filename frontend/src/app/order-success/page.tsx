"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, ShoppingBag, Package, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";

function OrderSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { settings } = useSettings();
  const currency = settings.defaultCurrency || "KES";

  const orderId = params.get("orderId");
  const receipt = params.get("receipt");
  const amount = params.get("amount");
  const isCod = params.get("payment") === "cod";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {isCod ? "Order Confirmed!" : "Payment Successful!"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isCod
              ? "Your order has been placed. Pay with cash when your order arrives."
              : "Your order has been confirmed and is being processed."}
          </p>
        </div>

        {/* Receipt card */}
        <div className="rounded-xl border bg-card p-6 text-left space-y-4">
          {orderId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Order ID
              </span>
              <span className="text-sm font-semibold">#{orderId}</span>
            </div>
          )}
          {receipt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                M-Pesa Receipt
              </span>
              <span className="text-sm font-semibold font-mono">{receipt}</span>
            </div>
          )}
          {isCod && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Payment
              </span>
              <span className="text-sm font-semibold text-amber-700">
                Cash on Delivery
              </span>
            </div>
          )}
          {amount && (
            <div className="flex items-center justify-between border-t pt-4 mt-2">
              <span className="text-sm text-muted-foreground">
                {isCod ? "Amount Due" : "Amount Paid"}
              </span>
              <span className="text-base font-bold text-green-700">
                {currency} {parseFloat(amount).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {isCod
            ? "Have the exact amount ready when the delivery arrives. The rider will confirm your order."
            : "You will receive an SMS confirmation from M-Pesa. Keep your receipt number for reference."}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {orderId && (
            <Button
              className="flex-1 h-11"
              onClick={() => router.push(`/account/orders/${orderId}`)}
            >
              <Package className="h-4 w-4 mr-2" />
              Track Order
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={() => router.push("/products")}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessContent />
    </Suspense>
  );
}
