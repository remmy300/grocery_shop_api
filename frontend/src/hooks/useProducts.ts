import { useMemo } from "react";
import { filterProducts } from "@/lib/products/filter";
import { sortProducts } from "@/lib/products/sort";
import { ProductView } from "@/types/products";

type Params = {
  products: ProductView[];
  query: string;
  category: string;
  origin: string;
  maxPrice: number;
  sort: string;
};

export function useProducts(params: Params) {
  return useMemo(() => {
    const filtered = filterProducts(
      params.products,
      params.query,
      params.category,
      params.origin,
      params.maxPrice,
    );

    return sortProducts(filtered, params.sort);
  }, [params]);
}
