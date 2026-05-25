import type { Metadata } from "next";
import type { ProductView } from "@/types/products";

import ProductsCatalogue from "@/components/products/ProductsCatalogue";
import ProductsHero from "@/components/products/ProductsHero";
import { fetchProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products | Coner Store",
  description:
    "Browse the Corner Store collection, filter by category, and open any product for full details.",
};

export default async function ProductsPage() {
  let products: ProductView[] = [];
  let errorMessage = "";

  try {
    products = await fetchProducts();
  } catch (error) {
    console.error("Failed to fetch products on products page:", error);
    errorMessage =
      error instanceof Error ? error.message : "Unable to load products.";
  }

  return (
    <main className="min-h-screen bg-background">
      <ProductsHero />

      <section className="mx-auto max-w-screen-2xl px-6 py-10 md:px-8">
        {errorMessage ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-900 shadow-sm">
            <h1 className="text-3xl font-semibold">Unable to load products</h1>
            <p className="mt-4 text-sm leading-6 text-red-800">
              {errorMessage}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Check that NEXT_PUBLIC_API_BASE_URL is configured and that your
              backend is reachable.
            </p>
          </div>
        ) : (
          <ProductsCatalogue products={products} />
        )}
      </section>
    </main>
  );
}
