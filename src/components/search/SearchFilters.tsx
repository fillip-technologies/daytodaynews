import { BlogFilters } from "@/components/blog/BlogFilters";
import type { Topic } from "@/data/topics";
import { searchUrl } from "@/lib/search";

type SearchFiltersProps = {
  topics: Topic[];
  query: string;
  active: string | null;
};

/** Category chips that keep the current query; each chip is a /search link. */
export function SearchFilters({ topics, query, active }: SearchFiltersProps) {
  return (
    <BlogFilters
      topics={topics}
      active={active}
      hrefFor={(category) => searchUrl({ query, category })}
    />
  );
}
