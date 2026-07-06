"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductView } from "@/types/products";
import { useCart } from "@/hooks/useCart";

type Props = {
  product: ProductView | null;
  open: boolean;
  onClose: () => void;
};

export function QuickAddSheet({ product, open, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const { addToCart, isAdding } = useCart();

  if (!product) return null;

  const isOutOfStock = product.stockStatus === "Out of Stock";
  const isLowStock = product.stockStatus === "Low Stock";

  const handleAdd = async () => {
    for (let i = 0; i < qty; i++) {
      await addToCart(product.id);
    }
    onClose();
    setQty(1);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { onClose(); setQty(1); } }}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[90vh]">
        <div className="flex flex-col h-full">
          {/* Image */}
          <div className="relative h-56 w-full shrink-0 overflow-hidden rounded-t-3xl bg-zinc-100">
            <Image
              src={product.imageUrl || "/placeholder.webp"}
              alt={product.name}
              fill
              className={`object-cover ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
              sizes="100vw"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-zinc-900/80 px-4 py-1.5 text-sm font-semibold text-white">
                  Out of Stock
                </span>
              </div>
            )}
            {isLowStock && !isOutOfStock && (
              <div className="absolute left-4 top-4">
                <Badge className="bg-amber-500 text-white">Only {product.stock} left</Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4 overflow-y-auto p-6">
            <SheetHeader className="text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {product.category}
              </p>
              <SheetTitle className="text-2xl font-extrabold text-foreground">
                {product.name}
              </SheetTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-700">
                  KES {product.priceValue.toFixed(2)}
                </span>
                {product.unit && product.unit !== "per piece" && (
                  <span className="text-sm text-muted-foreground">{product.unit}</span>
                )}
              </div>
            </SheetHeader>

            {product.description && (
              <p className="text-sm leading-6 text-muted-foreground">{product.description}</p>
            )}

            {/* Quantity selector */}
            {!isOutOfStock && (
              <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition hover:bg-muted"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-base font-bold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition hover:bg-muted"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart */}
            <Button
              onClick={handleAdd}
              disabled={isOutOfStock || isAdding}
              className="w-full rounded-full py-6 text-base font-semibold"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {isOutOfStock
                ? "Unavailable"
                : isAdding
                  ? "Adding…"
                  : `Add ${qty > 1 ? `${qty} ` : ""}to Cart — KES ${(product.priceValue * qty).toFixed(2)}`}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
