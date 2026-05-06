import { ProductView } from "@/types/products";

export function filterProducts(
  products: ProductView[],
  query: string,
  category: string,
  origin: string,
  maxPrice: number,
) {
  const q = query.trim().toLowerCase();

  return products.filter((p) => {
    return (
      (!q ||
        p.name.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)) &&
      (category === "All" || p.category === category) &&
      (origin === "All" || p.origin === origin) &&
      p.priceValue <= maxPrice
    );
  });
}
