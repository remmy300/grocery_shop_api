"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { useProducts } from "@/hooks/useProducts";
import { usePagination } from "@/hooks/usePagination";
import { useFilters } from "@/hooks/useFilters";
import { ProductsGrid } from "./productGrid";
import { ProductFilters } from "./filterSide";
import { FeaturedProduct } from "./featuredProducts";
import { ProductView } from "@/types/products";

const ITEMS_PER_PAGE = 10;

export default function ProductsCatalogue({
  products,
}: {
  products: ProductView[];
}) {
  const maxPrice = Math.max(...products.map((p) => p.priceValue), 100);

  const filters = useFilters(maxPrice);
  const debouncedQuery = useDebounce(filters.query);

  const filtered = useProducts({
    products,
    query: debouncedQuery,
    category: filters.category,
    origin: filters.origin,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
  });

  const featured = filtered[0] || null;
  const rest = filtered.slice(1);

  const { paginated } = usePagination(rest, 1, ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-12 max-w-7xl mx-auto px-4 py-6 md:px-6 lg:py-12">
      <ProductFilters filters={filters} />

      <div className="flex-1 space-y-12">
        <FeaturedProduct product={featured} />

        <ProductsGrid products={paginated} />
        <div className="text-center text-sm text-gray-500">
          Showing {paginated.length} of {rest.length} products
        </div>
      </div>
    </div>
  );
}
