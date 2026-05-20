import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ProductsHero() {
  return (
    <section className="border-b border-border/50 bg-stone-100">
      <div className="mx-auto max-w-screen-2xl px-6 py-14 md:px-8">
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

        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-secondary">
            Corner Store
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
  );
}
