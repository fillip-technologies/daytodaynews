export type Paginated<T> = {
  items: T[];
  /** Matches before pagination. */
  total: number;
  /** 1-based, clamped to the valid range. */
  page: number;
  pageCount: number;
};

/** Reads a 1-based `?page=` value, defaulting to 1. */
export function parsePage(value: string | string[] | undefined) {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page: current,
    pageCount,
  };
}
