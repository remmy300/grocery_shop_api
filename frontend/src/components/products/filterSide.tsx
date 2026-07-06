import { SearchInput } from "./SearchInput";
import { ProductFiltersState } from "@/types/products";

const categories = [
  "Fruits ang Vegetable",
  "Bakery & Deli",
  "Dairy",
  "Organic Meat",
  "General Grocery",
];

type Props = {
  filters: ProductFiltersState;
};

export function ProductFilters({ filters }: Props) {
  const handleCategoryChange = (category: string, checked: boolean) => {
    filters.setCategory(checked ? category : "All");
  };

  return (
    <aside className="w-full lg:w-64 space-y-8">
      <div>
        <h3 className="text-xs font-bold uppercase mb-4">Categories</h3>

        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.category === cat}
                onChange={(event) =>
                  handleCategoryChange(cat, event.target.checked)
                }
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>

        {filters.category !== "All" && (
          <button
            type="button"
            onClick={() => filters.setCategory("All")}
            className="mt-4 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            Clear category
          </button>
        )}
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
