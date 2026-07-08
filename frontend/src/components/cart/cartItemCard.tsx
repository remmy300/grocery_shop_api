import React from "react";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { Plus, Minus, Trash2, AlertTriangle } from "lucide-react";

import QuantityButton from "./quantityButton";
import type { CartItem } from "@/hooks/useCart";

type CartItemCardProps = {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  disabled?: boolean;
};

export default function CartItemCard({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  disabled = false,
}: CartItemCardProps) {
  const isOutOfStock = item.stock <= 0;
  const exceedsStock = !isOutOfStock && item.quantity > item.stock;

  return (
    <Card
      className={`overflow-hidden rounded-[28px] border-none bg-card shadow-sm transition hover:-translate-y-0.5 ${isOutOfStock ? "opacity-60" : ""}`}
    >
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row">
          {/* IMAGE */}
          <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-muted md:w-48">
            <Image
              src={item.imageUrl || "/placeholder.webp"}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>

          {/* CONTENT */}
          <div className="mt-6 flex flex-1 flex-col justify-between md:ml-8 md:mt-0">
            {/* TOP */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {item.subtitle}
                </p>
              </div>

              <button
                onClick={onRemove}
                disabled={disabled}
                className="text-muted-foreground transition hover:text-destructive disabled:opacity-40"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {/* BOTTOM */}
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              {/* QUANTITY */}
              <div className="space-y-2">
                {isOutOfStock && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Out of stock — remove before checkout
                  </p>
                )}
                {exceedsStock && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Only {item.stock} available
                  </p>
                )}
                <div className="flex items-center rounded-full bg-muted p-1">
                  <QuantityButton
                    onClick={onDecrease}
                    disabled={disabled || isOutOfStock}
                  >
                    <Minus className="h-4 w-4" />
                  </QuantityButton>

                  <span className="w-12 text-center text-lg font-bold">
                    {item.quantity.toString().padStart(2, "0")}
                  </span>

                  <QuantityButton
                    onClick={onIncrease}
                    disabled={disabled || isOutOfStock || exceedsStock}
                  >
                    <Plus className="h-4 w-4" />
                  </QuantityButton>
                </div>
              </div>

              {/* PRICE */}
              <div className="text-right">
                <span className="text-2xl font-extrabold tracking-tight">
                  KES{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
