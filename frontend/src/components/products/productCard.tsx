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
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product.id);
            }}
            disabled={isAdding}
            className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-white shadow-lg transition hover:scale-105 hover:bg-green-800 disabled:opacity-60"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-zinc-900">{product.name}</h3>

              <p className="text-sm text-zinc-500">{product.category}</p>
            </div>

            <span className="font-bold text-green-700">
              ${product.priceValue.toFixed(2)}
            </span>
          </div>

          <p className="line-clamp-2 text-sm text-zinc-600">
            {product.description}
          </p>
        </div>
      </Link>

      <div className="mt-5">
        <Button asChild variant="outline" className="w-full rounded-full">
          <Link href={`/products/${product.id}`}>View Details</Link>
        </Button>
      </div>
    </article>
  );
}
