"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

import { ProductView } from "@/types/products";
import { useCart } from "@/hooks/useCart";

export function FeaturedProduct({ product }: { product: ProductView | null }) {
  const { addToCart, isAdding } = useCart();

  if (!product) return null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex overflow-hidden rounded-3xl bg-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-4"
    >
      <div className="relative min-h-72 w-1/2 bg-gray-100">
        <Image
          src={product.imageUrl || "/placeholder.webp"}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 40vw, 100vw"
        />

        {/* Floating Add Button */}
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

      <div className="flex flex-1 flex-col justify-between p-10">
        <div>
          <h2 className="text-3xl font-extrabold">{product.name}</h2>

          <p className="mt-4 text-gray-500">{product.summary}</p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-2xl font-bold">
            ${product.priceValue.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
