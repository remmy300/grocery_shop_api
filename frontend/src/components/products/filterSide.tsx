export function FiltersSidebar({ filters }: any) {
  return (
    <aside className="w-80 space-y-8 sticky top-24">
      <input
        value={filters.query}
        onChange={(e) => filters.setQuery(e.target.value)}
        placeholder="Search..."
        className="w-full p-3 rounded-xl border"
      />

      <button onClick={filters.reset} className="w-full border p-2 rounded-xl">
        Reset Filters
      </button>
    </aside>
  );
}
