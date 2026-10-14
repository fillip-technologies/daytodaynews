import Link from "@/i18n/Link";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { SectionHeader } from "@/components/home/SectionHeader";
import { TrendingPosts } from "@/components/home/TrendingPosts";
import { Pagination } from "@/components/ui/Pagination";
import { format } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
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
export async function CategoryArticles({
  categoryName,
  articles,
  popular,
  page,
  pageCount,
  hrefForPage,
}: CategoryArticlesProps) {
  const { t } = await getI18n();
  // A ranked list needs a few entries to be meaningful.
  const showPopular = popular.length >= 2;

  return (
    <section aria-labelledby="category-latest-title" className="mt-14 sm:mt-16">
      <SectionHeader id="category-latest-title" title={format(t.category.latestIn, { category: categoryName })} />

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
              <p className="font-medium text-text-primary">{format(t.category.empty, { category: categoryName })}</p>
              <p className="mt-1 text-sm text-text-muted">
                {t.category.emptyLead}{" "}
                <Link href="/blog" className="font-medium text-primary hover:text-primary-hover">
                  {t.category.emptyLink}
                </Link>
                .
              </p>
            </div>
          )}

          <Pagination page={page} pageCount={pageCount} hrefFor={hrefForPage} className="mt-12" />
        </div>

        {showPopular && (
          <div className="lg:sticky lg:top-24 lg:self-start">
            <TrendingPosts posts={popular} title={format(t.category.mostReadIn, { category: categoryName })} viewAllHref="" />
          </div>
        )}
      </div>
    </section>
  );
}
