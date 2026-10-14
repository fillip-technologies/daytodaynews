import { BlogFilters } from "@/components/blog/BlogFilters";
import type { Topic } from "@/data/topics";
import { getI18n } from "@/i18n/server";
import { searchUrl } from "@/lib/search";

type SearchFiltersProps = {
  topics: Topic[];
  query: string;
  active: string | null;
};

/** Category chips that keep the current query; each chip is a /search link. */
export async function SearchFilters({ topics, query, active }: SearchFiltersProps) {
  const { t } = await getI18n();
  return (
    <BlogFilters
      topics={topics}
      active={active}
      hrefFor={(category) => searchUrl({ query, category })}
      labels={{ all: t.blog.all, nav: t.blog.categoriesNav }}
    />
  );
}
