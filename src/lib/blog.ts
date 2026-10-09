import { getTopic } from "@/data/topics";
import type { Article } from "@/types/article";

// Listing query contract shared by the blog UI. Today it runs over the static
// dataset in the browser; a future `GET /api/blogs?q=&category=&offset=&limit=`
// can return the same `ArticlePage` shape without UI changes.

export const BLOG_PAGE_SIZE = 9;

export type ArticleQuery = {
  query?: string;
  /** Topic slug, or null for all categories. */
  category?: string | null;
  offset?: number;
  limit?: number;
  /** Ids to leave out, e.g. the featured article shown separately. */
  excludeIds?: string[];
};

export type ArticlePage = {
  items: Article[];
  /** Matches before pagination. */
  total: number;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every term must start a word (so "ai" matches "AI-driven" but not "explained"). */
function matchesQuery(article: Article, query: string) {
  const haystack = [article.title, article.description, article.category, article.author]
    .filter(Boolean)
    .join(" ");
  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(term)}`, "iu").test(haystack));
}

export function queryArticles(articles: Article[], params: ArticleQuery): ArticlePage {
  const { query = "", category = null, offset = 0, limit = BLOG_PAGE_SIZE, excludeIds = [] } = params;
  const matches = articles.filter(
    (article) =>
      !(article.id && excludeIds.includes(article.id)) &&
      (!category || article.topic === category) &&
      (!query.trim() || matchesQuery(article, query)),
  );
  return { items: matches.slice(offset, offset + limit), total: matches.length };
}

export type BlogParams = { query: string; category: string | null };

type RawParams = Record<string, string | string[] | undefined>;

/** Reads `?q=` and `?category=` (unknown categories are ignored). */
export function parseBlogParams(params: RawParams | URLSearchParams): BlogParams {
  const read = (key: string) => {
    const value = params instanceof URLSearchParams ? params.get(key) : params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const category = read("category");
  return { query: read("q"), category: getTopic(category) ? category : null };
}

/** Serializes listing state back into a `/blog` URL. */
export function blogUrl({ query, category }: BlogParams) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (query.trim()) params.set("q", query.trim());
  const search = params.toString();
  return search ? `/blog?${search}` : "/blog";
}
