"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  ArrowLeft,
  MapPin,
  Receipt,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/api";

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  product?: { name: string; imageUrl?: string | null };
}

interface Order {
  id: number;
  customer: string;
  phone: string;
  address: string;
  street?: string;
  city?: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  payment?: { mpesaReceiptNumber?: string | null };
}

const STEPS = [
  { key: "pending",           label: "Order Placed",     icon: Clock },
  { key: "confirmed",         label: "Confirmed",        icon: CheckCircle2 },
  { key: "out_for_delivery",  label: "Out for Delivery", icon: Truck },
  { key: "delivered",         label: "Delivered",        icon: Package },
];

const STATUS_ORDER = ["pending", "confirmed", "out_for_delivery", "delivered"];

function getStepIndex(status: string) {
  const idx = STATUS_ORDER.indexOf(status.toLowerCase());
  return idx === -1 ? 0 : idx;
}

const getAccessToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("accessToken") || localStorage.getItem("token") || ""
    : "";

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) { router.replace("/login"); return; }

    fetch(`${getApiBaseUrl()}/api/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => { if (!r.ok) throw new Error("Failed to load order"); return r.json(); })
      .then((orders: Order[]) => {
        const found = orders.find((o) => String(o.id) === String(id));
        if (!found) throw new Error("Order not found");
        setOrder(found);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-32 px-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
          <div className="h-48 bg-muted rounded-2xl animate-pulse" />
          <div className="h-32 bg-muted rounded-2xl animate-pulse" />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-muted-foreground">{error ?? "Order not found"}</p>
          <Button onClick={() => router.push("/account/orders")}>My Orders</Button>
        </div>
      </main>
    );
  }

  const isCancelled = order.orderStatus.toLowerCase() === "cancelled";
  const currentStep = isCancelled ? -1 : getStepIndex(order.orderStatus);
  const total = Number(order.total);
  const address = [order.street, order.city].filter(Boolean).join(", ") || order.address;

  return (
    <main className="min-h-screen bg-background pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() => router.push("/account/orders")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          My Orders
        </button>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-KE", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            order.paymentStatus === "completed"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {order.paymentStatus === "completed" ? "Paid" : "Payment pending"}
          </span>
        </div>

        {/* Progress tracker */}
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            {isCancelled ? (
              <div className="flex items-center gap-3 text-red-600">
                <XCircle className="h-6 w-6" />
                <span className="font-semibold">Order Cancelled</span>
              </div>
            ) : (
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted" />
                <div
                  className="absolute top-5 left-5 h-0.5 bg-green-500 transition-all duration-500"
                  style={{
                    width: currentStep === 0
                      ? "0%"
                      : `${(currentStep / (STEPS.length - 1)) * 100}%`,
                  }}
                />

                <div className="relative flex justify-between">
                  {STEPS.map((step, idx) => {
                    const done = idx <= currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2 w-1/4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 transition-colors ${
                          done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={`text-xs text-center font-medium leading-tight ${
                          done ? "text-green-700" : "text-muted-foreground"
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery info */}
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Delivery Details
            </h2>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-sm">{order.customer}</p>
                <p className="text-sm text-muted-foreground">{address}</p>
                <p className="text-sm text-muted-foreground">{order.phone}</p>
              </div>
            </div>
            {order.payment?.mpesaReceiptNumber && (
              <div className="flex items-center gap-3 pt-1 border-t">
                <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">M-Pesa Receipt</p>
                  <p className="text-sm font-mono font-semibold">{order.payment.mpesaReceiptNumber}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">
              Items ({order.items.length})
            </h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {item.product?.name ?? `Product #${item.productId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × KES {Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    KES {(item.quantity * Number(item.price)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <span className="font-bold">Total</span>
              <span className="font-bold text-green-700">KES {total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full h-11"
          onClick={() => router.push("/products")}
        >
          Continue Shopping
        </Button>
      </div>
    </main>
  );
}
