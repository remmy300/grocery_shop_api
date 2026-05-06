import { useState } from "react";

export function useFilters(maxPriceDefault: number) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [origin, setOrigin] = useState("All");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(maxPriceDefault);

  const reset = () => {
    setQuery("");
    setCategory("All");
    setOrigin("All");
    setSort("featured");
    setMaxPrice(maxPriceDefault);
  };

  return {
    query,
    setQuery,
    category,
    setCategory,
    origin,
    setOrigin,
    sort,
    setSort,
    maxPrice,
    setMaxPrice,
    reset,
  };
}
