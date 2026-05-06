import { ProductCard } from "./productCard";
import { ProductView } from "@/types/products";

export function ProductsGrid({ products }: { products: ProductView[] }) {
  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
