import type { Metadata } from "next";
import Link from "next/link";
import { ExploreTopics } from "@/components/home/ExploreTopics";
import { Newsletter } from "@/components/home/Newsletter";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResults } from "@/components/search/SearchResults";
import { categories } from "@/data/categories";
import { getTopic } from "@/data/topics";
import { getTopics, searchArticles } from "@/lib/articles";
import { parseSearchParams, searchUrl } from "@/lib/search";

type Props = PageProps<"/search">;

const suggestions = ["AI automation", "n8n", "Next.js", "Outsourcing", "Cost"];

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { query, category } = parseSearchParams(await searchParams);
  return {
    title: "Search DayTodayNews — Technology Insights",
    description:
      "Search DayTodayNews for insights on AI, automation, software development, business technology and more.",
    alternates: { canonical: "/search" },
    // Result pages are thin, near-duplicate variations: keep them out of the index.
    robots: query || category ? { index: false, follow: true } : undefined,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { query, category, page } = parseSearchParams(await searchParams);
  const hasSearch = Boolean(query || category);
  const [topics, results] = await Promise.all([
    getTopics(),
    hasSearch ? searchArticles({ query, category, page }) : null,
  ]);
  const categoryLabel = category ? getTopic(category)?.label : undefined;

  return (
    <main className="flex-1">
      <div className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] overflow-hidden">
          <div className="absolute -top-40 left-[10%] h-80 w-[34rem] rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -top-28 right-[6%] h-80 w-[30rem] rounded-full bg-accent-secondary/12 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14 lg:px-8">
          <header className="mx-auto max-w-3xl text-center">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                <li>
                  <Link href="/" className="text-text-muted transition-colors hover:text-primary">
                    DayTodayNews
                  </Link>
                </li>
                <li aria-hidden="true" className="text-text-muted/60">
                  /
                </li>
                <li aria-current="page" className="text-primary">
                  Search
                </li>
              </ol>
            </nav>
            <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-text-primary sm:text-5xl">
              Search <span className="bg-gradient-primary bg-clip-text text-transparent">DayTodayNews</span>
            </h1>
            <p className="mt-4 text-lg leading-8 text-text-secondary">
              Find articles, insights and practical guides across AI, software, business and
              technology.
            </p>
          </header>

          <div className="mx-auto mt-8 max-w-3xl">
            <SearchInput key={query} defaultValue={query} category={category} />
            {!hasSearch && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="text-text-muted">Try:</span>
                {suggestions.map((term) => (
                  <Link
                    key={term}
                    href={searchUrl({ query: term })}
                    className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 font-medium text-text-secondary transition-colors hover:border-primary/30 hover:text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {hasSearch && (
            <>
              <div className="mt-8">
                <SearchFilters topics={topics} query={query} active={category} />
              </div>
              <div className="mt-10">
                {results && results.total > 0 ? (
                  <SearchResults
                    query={query}
                    categoryLabel={categoryLabel}
                    results={results}
                    hrefForPage={(target) => searchUrl({ query, category, page: target })}
                  />
                ) : (
                  <SearchEmptyState categories={categories} />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {!hasSearch && <ExploreTopics topics={topics} />}
      <Newsletter />
    </main>
  );
}
