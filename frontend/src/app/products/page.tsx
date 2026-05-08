import type { Metadata } from "next";

import ProductsCatalogue from "@/components/products/ProductsCatalogue";
import ProductsHero from "@/components/products/ProductsHero";
import { fetchProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products | Botanical Archivist",
  description:
    "Browse the Botanical Archivist collection, filter by category, and open any product for full details.",
};

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <main className="min-h-screen bg-background">
      <ProductsHero />

      {/* Products */}
      <section className="mx-auto max-w-screen-2xl px-6 py-10 md:px-8">
        <ProductsCatalogue products={products} />
      </section>
    </main>
  );
}
