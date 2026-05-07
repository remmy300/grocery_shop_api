import type { Metadata } from "next";
import Link from "next/link";

import ProductsCatalogue from "@/components/products/ProductsCatalogue";
import { fetchProducts } from "@/lib/products";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
      {/* Page Header */}
      <section className="border-b border-border/50 bg-stone-100">
        <div className="mx-auto max-w-screen-2xl px-6 py-14 md:px-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Heading */}
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-secondary">
              Botanical Archivist
            </p>

            <h1 className="text-5xl font-extrabold tracking-tight text-foreground md:text-6xl">
              Seasonal Collection
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Explore our curated archive of regenerative harvests, premium
              produce, and ethically sourced botanical selections.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-screen-2xl px-6 py-10 md:px-8">
        <ProductsCatalogue products={products} />
      </section>
    </main>
  );
}
