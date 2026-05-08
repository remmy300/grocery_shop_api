import { SearchInput } from "./SearchInput";
import { ProductFiltersState } from "@/types/products";

type Props = {
  filters: ProductFiltersState;
};

export function ProductFilters({ filters }: Props) {
  return (
    <aside className="w-full lg:w-64 space-y-8">
      <div>
        <h3 className="text-xs font-bold uppercase mb-4">Categories</h3>

        <div className="space-y-2">
          {["Produce", "Bakery", "Dairy", "Meat"].map((cat) => (
            <label key={cat} className="flex items-center gap-2">
              <input type="checkbox" />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide">
          Search
        </h3>

        <SearchInput
          value={filters.query}
          onChange={filters.setQuery}
          onClear={() => filters.setQuery("")}
        />
      </div>
    </aside>
  );
}
