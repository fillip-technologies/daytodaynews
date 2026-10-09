import { blogArticles, editorsPicks, latestArticles, trendingArticles } from "@/data/articles";
import { topics } from "@/data/topics";
import { queryArticles } from "./blog";
import { paginate } from "./pagination";

// Content access layer. Components receive data as props from these calls, so
// replacing the static arrays with API/database queries only changes this file.

export async function getTopics() {
  return topics;
}

export async function getEditorsPicks(limit = 4) {
  return editorsPicks.slice(0, limit);
}

export async function getLatestArticles(limit = 9) {
  return [...latestArticles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

export async function getTrendingArticles(limit = 5) {
  return trendingArticles.slice(0, limit);
}

/** All blog articles, newest first. Swap for `GET /api/blogs` later. */
export async function getBlogArticles() {
  return [...blogArticles].sort((a, b) => b.date.localeCompare(a.date));
}

/* ------------------------------------------------------------------------ */
/* Category pages and search. Each returns the shape a future endpoint       */
/* (e.g. GET /api/blogs?category=&page= or /api/blogs/search?q=) would.     */
/* ------------------------------------------------------------------------ */

export const LISTING_PAGE_SIZE = 9;

/** Lead story plus a paginated list of the rest, for /category/[slug]. */
export async function getCategoryListing(topic: string, page = 1, pageSize = LISTING_PAGE_SIZE) {
  const all = (await getBlogArticles()).filter((article) => article.topic === topic);
  const featured = all.find((article) => article.featured) ?? all[0] ?? null;
  const rest = all.filter((article) => article !== featured);
  return { featured, count: all.length, latestDate: all[0]?.date ?? null, ...paginate(rest, page, pageSize) };
}

/**
 * Most-read articles in a topic. There are no analytics yet, so this ranks
 * by the editorial trending list first, then by recency.
 */
export async function getPopularInCategory(topic: string, limit = 5) {
  const slugOf = (href: string) => href.split("/").pop();
  const trendingRank = new Map(trendingArticles.map((article, i) => [slugOf(article.href), i]));
  const rank = (slug?: string) => trendingRank.get(slug) ?? Number.POSITIVE_INFINITY;
  return (await getBlogArticles())
    .filter((article) => article.topic === topic)
    .sort((a, b) => rank(a.slug) - rank(b.slug) || b.date.localeCompare(a.date))
    .slice(0, limit);
}

export type SearchParams = { query: string; category: string | null; page?: number; pageSize?: number };

/** Case-insensitive search across title, excerpt, category and author. */
export async function searchArticles({ query, category, page = 1, pageSize = LISTING_PAGE_SIZE }: SearchParams) {
  const { items } = queryArticles(await getBlogArticles(), { query, category, limit: Number.MAX_SAFE_INTEGER });
  return paginate(items, page, pageSize);
}
