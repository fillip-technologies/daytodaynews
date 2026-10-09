import { getTopic } from "@/data/topics";
import { parsePage } from "./pagination";

export type SearchState = { query: string; category: string | null; page: number };

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** Reads `?q=`, `?category=` (topic slug) and `?page=`. */
export function parseSearchParams(params: RawParams): SearchState {
  const category = first(params.category);
  return {
    query: first(params.q).trim().slice(0, 100),
    category: getTopic(category) ? category : null,
    page: parsePage(params.page),
  };
}

export function searchUrl({ query, category, page = 1 }: Partial<SearchState>) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/search?${search}` : "/search";
}
