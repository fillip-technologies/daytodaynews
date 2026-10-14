import { ArticleCard } from "@/components/blog/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";
import { format, plural } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import type { Paginated } from "@/lib/pagination";
import type { Article } from "@/types/article";

type SearchResultsProps = {
  query: string;
  categoryLabel?: string;
  results: Paginated<Article>;
  hrefForPage: (page: number) => string;
};

export async function SearchResults({ query, categoryLabel, results, hrefForPage }: SearchResultsProps) {
  const { t } = await getI18n();
  const { items, total, page, pageCount } = results;

  return (
    <section aria-labelledby="search-results-title">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <span aria-hidden="true" className="mb-3 block h-1 w-8 rounded-full bg-gradient-primary" />
          <h2
            id="search-results-title"
            className="text-2xl font-semibold tracking-[-0.02em] text-balance text-text-primary sm:text-[1.875rem]"
          >
            {query ? (
              <>
                <span className="text-text-secondary">{t.search.resultsFor}</span>{" "}
                <span className="text-primary">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              <>{format(t.search.allIn, { category: categoryLabel ?? "" })}</>
            )}
          </h2>
        </div>
        <p role="status" className="text-sm text-text-muted">
          {plural(t.search.found, total)}
          {query && categoryLabel && <> {format(t.search.inCategory, { category: categoryLabel })}</>}
          {pageCount > 1 && <> · {format(t.search.pageOf, { page, count: pageCount })}</>}
        </p>
      </header>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {items.map((article) => (
          <li key={article.id ?? article.href}>
            <ArticleCard article={article} showExcerpt />
          </li>
        ))}
      </ul>

      <Pagination page={page} pageCount={pageCount} hrefFor={hrefForPage} className="mt-12" />
    </section>
  );
}
