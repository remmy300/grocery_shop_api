import Image from "next/image";
import Link from "next/link";

import { ProductView } from "@/types/products";

export function FeaturedProduct({ product }: { product: ProductView | null }) {
  if (!product) return null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex overflow-hidden rounded-3xl bg-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-4"
    >
      <div className="relative min-h-72 w-1/2 bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between p-10">
        <div>
          <h2 className="text-3xl font-extrabold">{product.name}</h2>
          <p className="text-gray-500 mt-4">{product.summary}</p>
        </div>

        <div className="flex justify-between mt-6">
          <span className="text-2xl font-bold">
            ${product.priceValue.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
