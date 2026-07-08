"use client";

import { cn } from "@/lib/utils";
import { SearchInput } from "./SearchInput";
import { ProductFiltersState } from "@/types/products";

type Category = { label: string; value: string };

const CATEGORIES: Category[] = [
  { label: "All", value: "All" },
  { label: "Fruits & Vegetables", value: "Fruits & Vegetables" },
  { label: "Dairy & Eggs", value: "Dairy & Eggs" },
  { label: "Meat & Poultry", value: "Meat & Poultry" },
  { label: "Bakery & Bread", value: "Bakery & Bread" },
  { label: "Beverages", value: "Beverages" },
];

export const PRODUCE_SUBCATEGORIES = ["Fruits", "Vegetables", "Herbs"];

export function isProduceCategory(cat: string) {
  return cat === "Fruits & Vegetables" || PRODUCE_SUBCATEGORIES.includes(cat);
}

type Props = { filters: ProductFiltersState };

export function ProductFilters({ filters }: Props) {
  const { category, setCategory, query, setQuery } = filters;

  const produceActive = isProduceCategory(category);

  const isCatActive = (cat: Category) => {
    if (cat.value === "Fruits & Vegetables") return produceActive;
    return category === cat.value;
  };

  return (
    <aside className="w-full lg:w-56 shrink-0">
      {/* ── MOBILE: horizontal scrollable chips ───────────── */}
      <div className="lg:hidden space-y-2">
        {/* Search */}
        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
        />

        {/* Category chips row */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                isCatActive(cat)
                  ? "border-green-700 bg-green-700 text-white"
                  : "border-border bg-background text-foreground hover:border-green-600 hover:text-green-700",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sub-category chips — only when Fruits & Vegetables is active */}
        {produceActive && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pl-1">
            <button
              type="button"
              onClick={() => setCategory("Fruits & Vegetables")}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap",
                category === "Fruits & Vegetables"
                  ? "border-green-600 bg-green-100 text-green-800"
                  : "border-border bg-muted text-muted-foreground hover:border-green-500 hover:text-green-700",
              )}
            >
              All Produce
            </button>
            {PRODUCE_SUBCATEGORIES.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setCategory(sub)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap",
                  category === sub
                    ? "border-green-600 bg-green-100 text-green-800"
                    : "border-border bg-muted text-muted-foreground hover:border-green-500 hover:text-green-700",
                )}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── DESKTOP: sidebar ──────────────────────────────── */}
      <div className="hidden lg:block space-y-8">
        {/* Categories */}
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Categories
          </h3>
          <ul className="space-y-0.5">
            {CATEGORIES.map((cat) => (
              <li key={cat.value}>
                <button
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                    isCatActive(cat)
                      ? "bg-green-50 text-green-800 font-semibold"
                      : "text-foreground hover:bg-muted hover:text-green-700",
                  )}
                >
                  {cat.label}
                </button>

                {/* Sub-categories indented under Fruits & Vegetables */}
                {cat.value === "Fruits & Vegetables" && produceActive && (
                  <ul className="mt-1 ml-3 space-y-0.5 border-l-2 border-green-200 pl-3">
                    <li>
                      <button
                        type="button"
                        onClick={() => setCategory("Fruits & Vegetables")}
                        className={cn(
                          "w-full rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors",
                          category === "Fruits & Vegetables"
                            ? "text-green-800 font-semibold"
                            : "text-muted-foreground hover:text-green-700",
                        )}
                      >
                        All Produce
                      </button>
                    </li>
                    {PRODUCE_SUBCATEGORIES.map((sub) => (
                      <li key={sub}>
                        <button
                          type="button"
                          onClick={() => setCategory(sub)}
                          className={cn(
                            "w-full rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors",
                            category === sub
                              ? "text-green-800 font-semibold"
                              : "text-muted-foreground hover:text-green-700",
                          )}
                        >
                          {sub}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {category !== "All" && (
            <button
              type="button"
              onClick={() => setCategory("All")}
              className="mt-4 text-xs font-semibold text-green-700 hover:text-green-800"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Search */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Search
          </h3>
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
          />
        </div>
      </div>
    </aside>
  );
}
