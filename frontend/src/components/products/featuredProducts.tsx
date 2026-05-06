import { ProductView } from "@/types/products";

export function FeaturedProduct({ product }: { product: ProductView | null }) {
  if (!product) return null;

  return (
    <div className="rounded-3xl overflow-hidden bg-white shadow-xl flex">
      <div className="w-1/2 bg-gray-100" />
      <div className="p-10 flex flex-col justify-between">
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
    </div>
  );
}
