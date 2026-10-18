export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export function pageCount(p: Pick<Paginated<unknown>, "limit" | "total">): number {
  return Math.max(1, Math.ceil(p.total / Math.max(p.limit, 1)));
}
