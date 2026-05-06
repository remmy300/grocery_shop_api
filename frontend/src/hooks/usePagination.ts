export function usePagination<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const start = (page - 1) * perPage;

  return {
    totalPages,
    paginated: items.slice(start, start + perPage),
  };
}
