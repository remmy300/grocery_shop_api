"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "../ui/button";
import { ProductView } from "@/types/products";
import { useCart } from "@/hooks/useCart";

export type Props = {
  product: ProductView;
};

export function ProductCard({ product }: Props) {
  const { addToCart, isAdding } = useCart();

  const isOutOfStock = product.stockStatus === "Out of Stock";
  const isLowStock = product.stockStatus === "Low Stock";

  return (
    <article className="group relative rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/products/${product.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-4"
      >
        <div className="relative aspect-4/5 overflow-hidden rounded-2xl">
          <Image
            src={product.imageUrl || "/placeholder.webp"}
            alt={product.name}
            fill
            className={`object-cover transition duration-500 group-hover:scale-105 ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Stock status badge */}
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

          {/* Add to cart button — hidden when out of stock */}
          {!isOutOfStock && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product.id);
              }}
              disabled={isAdding}
              aria-label={`Add ${product.name} to cart`}
              className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-white shadow-lg transition hover:scale-105 hover:bg-green-800 disabled:opacity-60"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-zinc-900">{product.name}</h3>
              <p className="text-sm text-zinc-500">{product.category}</p>
            </div>

            <div
              className={`text-right ${isOutOfStock ? "text-zinc-400" : "text-green-700"}`}
            >
              <span className="font-bold">
                KES {product.priceValue.toFixed(2)}
              </span>
              {product.unit && product.unit !== "per piece" && (
                <p className="text-xs font-normal text-zinc-500">
                  {product.unit}
                </p>
              )}
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-zinc-600">
            {product.description}
          </p>
        </div>
      </Link>

      <div className="mt-5">
        <Button
          asChild={!isOutOfStock}
          variant="outline"
          disabled={isOutOfStock}
          className="w-full rounded-full"
        >
          {isOutOfStock ? (
            <span>Unavailable</span>
          ) : (
            <Link href={`/products/${product.id}`}>View Details</Link>
          )}
        </Button>
      </div>
    </article>
  );
}
