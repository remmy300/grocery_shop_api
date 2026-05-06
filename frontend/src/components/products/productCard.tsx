import Link from "next/link";
import { ProductView } from "@/types/products";

export function ProductCard({ product }: { product: ProductView }) {
  return (
    <article className="group rounded-2xl bg-white shadow-sm hover:shadow-xl transition">
      <div className="aspect-square bg-gray-100" />

      <div className="p-5">
        <h3 className="font-bold">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{product.summary}</p>

        <div className="flex justify-between mt-4">
          <span className="font-bold">${product.priceValue}</span>

          <Link
            href={`/products/${product.id}`}
            className="text-primary font-semibold"
          >
            View →
          </Link>
        </div>
      </div>
    </article>
  );
}
