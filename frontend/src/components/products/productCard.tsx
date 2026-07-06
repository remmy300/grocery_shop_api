"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

import { ProductView } from "@/types/products";
import { useCart } from "@/hooks/useCart";
import { QuickAddSheet } from "./QuickAddSheet";

export type Props = {
  product: ProductView;
};

export function ProductCard({ product }: Props) {
  const { addToCart, isAdding } = useCart();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isOutOfStock = product.stockStatus === "Out of Stock";
  const isLowStock = product.stockStatus === "Low Stock";

  return (
    <>
      <article
        onClick={() => setSheetOpen(true)}
        className="group relative cursor-pointer rounded-3xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      >
        {/* Image */}
        <div className="relative aspect-4/5 overflow-hidden rounded-2xl">
          <Image
            src={product.imageUrl || "/placeholder.webp"}
            alt={product.name}
            fill
            className={`object-cover transition duration-500 group-hover:scale-105 ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-zinc-900/80 px-4 py-1.5 text-sm font-semibold text-white">
                Out of Stock
              </span>
            </div>
          )}

          {isLowStock && !isOutOfStock && (
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
                Only {product.stock} left
              </span>
            </div>
          )}

          {/* Quick add button */}
          {!isOutOfStock && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product.id);
              }}
              disabled={isAdding}
              aria-label={`Add ${product.name} to cart`}
              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-700 text-white shadow-lg transition hover:scale-105 hover:bg-green-800 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{product.category}</p>
          <h3 className="line-clamp-1 font-semibold text-zinc-900">{product.name}</h3>
          <div className={`flex items-baseline gap-1 ${isOutOfStock ? "text-zinc-400" : "text-green-700"}`}>
            <span className="font-bold">KES {product.priceValue.toFixed(2)}</span>
            {product.unit && product.unit !== "per piece" && (
              <span className="text-xs font-normal text-zinc-500">{product.unit}</span>
            )}
          </div>
        </div>
      </article>

      <QuickAddSheet
        product={product}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
