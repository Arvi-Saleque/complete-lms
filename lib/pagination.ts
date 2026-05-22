export const pageSize = 20;

export function pageFromSearch(value: string | undefined) {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export function rangeForPage(page: number) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

export function totalPages(count: number | null | undefined) {
  return Math.max(Math.ceil((count ?? 0) / pageSize), 1);
}

export function pageHref(
  pathname: string,
  searchParams: Record<string, string | undefined>,
  page: number
) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  params.set("page", String(page));
  return `${pathname}?${params.toString()}`;
}
