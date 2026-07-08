import { ProductView } from "@/types/products";
import { PRODUCE_SUBCATEGORIES } from "@/components/products/filterSide";

export function filterProducts(
  products: ProductView[],
  query: string,
  category: string,
  origin: string,
  maxPrice: number,
) {
  const q = query.trim().toLowerCase();

  return products.filter((p) => {
    // "Fruits & Vegetables" parent matches itself + all sub-categories (Fruits, Vegetables, Herbs)
    const categoryMatch =
      category === "All" ||
      p.category === category ||
      (category === "Fruits & Vegetables" && PRODUCE_SUBCATEGORIES.includes(p.category));

    return (
      (!q ||
        p.name.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)) &&
      categoryMatch &&
      (origin === "All" || p.origin === origin) &&
      p.priceValue <= maxPrice
    );
  });
}
