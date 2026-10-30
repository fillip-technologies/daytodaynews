import type { ReactNode } from "react";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { getI18n } from "@/i18n/server";
import type { Article } from "@/types/article";
import { SectionHeader, sectionContainer } from "./SectionHeader";

type LatestArticlesProps = {
  articles: Article[];
  /** Admin override; empty uses the default wording. */
  title?: string;
  /** Rendered beside the grid on desktop and below it on smaller screens. */
  sidebar?: ReactNode;
};

/** Grid of the stories chosen in admin, with the trending list beside it. */
export async function LatestArticles({ articles, title, sidebar }: LatestArticlesProps) {
  if (articles.length === 0 && !sidebar) return null;
  const { t } = await getI18n();

  return (
    <section aria-labelledby="latest-articles-title" className="py-10 sm:py-14">
      <div className={sectionContainer}>
        <SectionHeader
          id="latest-articles-title"
          title={title || t.home.latestTitle}
          action={{ label: t.common.viewAll, href: "/blog" }}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-12">
          <ul className="grid content-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <li key={article.href}>
                <ArticleCard article={article} showExcerpt />
              </li>
            ))}
          </ul>

          {sidebar && <div className="lg:sticky lg:top-24 lg:self-start">{sidebar}</div>}
        </div>
      </div>
    </section>
  );
}
