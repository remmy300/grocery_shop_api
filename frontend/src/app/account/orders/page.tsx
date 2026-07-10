"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ShoppingBag, ChevronRight, Clock, CheckCircle2, XCircle, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/api";

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customer: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

const getAccessToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("accessToken") || localStorage.getItem("token") || ""
    : "";

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Pending",   color: "text-amber-600 bg-amber-50",   icon: <Clock className="h-4 w-4" /> },
  confirmed: { label: "Confirmed", color: "text-blue-600 bg-blue-50",     icon: <CheckCircle2 className="h-4 w-4" /> },
  shipped:   { label: "Shipped",   color: "text-purple-600 bg-purple-50", icon: <Truck className="h-4 w-4" /> },
  delivered: { label: "Delivered", color: "text-green-600 bg-green-50",   icon: <CheckCircle2 className="h-4 w-4" /> },
  cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50",       icon: <XCircle className="h-4 w-4" /> },
};

function statusMeta(status: string) {
  return STATUS_META[status.toLowerCase()] ?? STATUS_META.pending;
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${getApiBaseUrl()}/api/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load orders");
        return r.json();
      })
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-32 px-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {orders.length} order{orders.length !== 1 ? "s" : ""} placed
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/products")}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Shop Again
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Package className="h-16 w-16 text-muted-foreground mx-auto" />
            <p className="font-medium text-lg">No orders yet</p>
            <p className="text-sm text-muted-foreground">
              When you place an order it will appear here.
            </p>
            <Button onClick={() => router.push("/products")}>Start Shopping</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const meta = statusMeta(order.orderStatus);
              return (
                <Card key={order.id} className="rounded-2xl border-none shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Order #{order.id}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
                            {meta.icon}
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {" · "}
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-green-700">
                          KES {Number(order.total).toFixed(2)}
                        </p>
                        <p className={`text-xs mt-0.5 ${order.paymentStatus === "completed" ? "text-green-600" : "text-amber-600"}`}>
                          {order.paymentStatus === "completed" ? "Paid" : "Payment pending"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Delivered to {order.customer}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => router.push(`/account/orders/${order.id}`)}
                      >
                        Track Order
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
