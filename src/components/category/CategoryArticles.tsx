import Link from "next/link";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { SectionHeader } from "@/components/home/SectionHeader";
import { TrendingPosts } from "@/components/home/TrendingPosts";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/cn";
import type { Article } from "@/types/article";

type CategoryArticlesProps = {
  categoryName: string;
  articles: Article[];
  popular: Article[];
  page: number;
  pageCount: number;
  hrefForPage: (page: number) => string;
};

/** "Latest in …" grid with a "Most Read" sidebar and pagination. */
export function CategoryArticles({
  categoryName,
  articles,
  popular,
  page,
  pageCount,
  hrefForPage,
}: CategoryArticlesProps) {
  // A ranked list needs a few entries to be meaningful.
  const showPopular = popular.length >= 3;

  return (
    <section aria-labelledby="category-latest-title" className="mt-14 sm:mt-16">
      <SectionHeader id="category-latest-title" title={`Latest in ${categoryName}`} />

      <div
        className={cn(
          "mt-8 grid gap-10",
          showPopular && "lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-12",
        )}
      >
        <div>
          {articles.length > 0 ? (
            <ul className={cn("grid gap-5 sm:grid-cols-2", showPopular ? "xl:grid-cols-3" : "lg:grid-cols-3 lg:gap-6")}>
              {articles.map((article) => (
                <li key={article.id ?? article.href}>
                  <ArticleCard article={article} showExcerpt />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface-elevated px-6 py-10 text-center">
              <p className="font-medium text-text-primary">More {categoryName} articles are on the way.</p>
              <p className="mt-1 text-sm text-text-muted">
                In the meantime,{" "}
                <Link href="/blog" className="font-medium text-primary hover:text-primary-hover">
                  browse all articles
                </Link>
                .
              </p>
            </div>
          )}

          <Pagination page={page} pageCount={pageCount} hrefFor={hrefForPage} className="mt-12" />
        </div>

        {showPopular && (
          <div className="lg:sticky lg:top-24 lg:self-start">
            <TrendingPosts posts={popular} title={`Most Read in ${categoryName}`} viewAllHref="" />
          </div>
        )}
      </div>
    </section>
  );
}
