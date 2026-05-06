import { ProductView } from "@/types/products";

export function sortProducts(products: ProductView[], sort: string) {
  const sorted = [...products];

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.priceValue - b.priceValue);
    case "price-desc":
      return sorted.sort((a, b) => b.priceValue - a.priceValue);
    case "stock-desc":
      return sorted.sort((a, b) => b.stock - a.stock);
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}
