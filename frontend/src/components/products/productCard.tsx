import Image from "next/image";
import Link from "next/link";

import { ProductView } from "@/types/products";

type Props = {
  product: ProductView;
};

export function ProductCard({ product }: Props) {
  return (
    <article className="group rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/products/${product.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-4"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src={product.imageUrl || "/placeholder.webp"}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
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

      <button className="mt-5 w-full rounded-full bg-green-700 py-3 text-sm font-semibold text-white transition hover:bg-green-800">
        Add to Cart
      </button>
    </article>
  );
}
