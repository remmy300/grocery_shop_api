import type { Metadata } from "next";
import ProductsCatalogue from "@/components/products/ProductsCatalogue";
import { fetchProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products | Botanical Archivist",
  description:
    "Browse the Botanical Archivist collection, filter by category, and open any product for full details.",
};

export default async function ProductsPage() {
  const products = await fetchProducts();

  return <ProductsCatalogue products={products} />;
}
