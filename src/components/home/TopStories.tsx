import Link from "@/i18n/Link";
import type { Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { Article } from "@/types/article";
import { CardMedia } from "./ArticleCardParts";
import { FeaturedArticleCard } from "./FeaturedArticleCard";
import { sectionContainer } from "./SectionHeader";

type TopStoriesProps = {
  title?: string;
  /** The lead story first, then the stories beside it. */
  articles: Article[];
  headlinesTitle?: string;
  headlines: Article[];
};

/**
 * Front-page opener: the lead story, a column of further top stories, and a
 * list of headlines, newspaper-style with column rules on desktop.
 */
export async function TopStories({ title, articles, headlinesTitle, headlines }: TopStoriesProps) {
  const [lead, ...stories] = articles;
  if (!lead && headlines.length === 0) return null;
  const { locale, t } = await getI18n();

  // Columns that are present share the 12-column grid.
  const leadSpan = stories.length > 0 && headlines.length > 0 ? "lg:col-span-5" : "lg:col-span-8";

  return (
    <section aria-labelledby="top-stories-title" className="pt-6 pb-10 sm:pt-8 sm:pb-14">
      <div className={sectionContainer}>
        <h2
          id="top-stories-title"
          className="mb-5 flex items-center gap-2.5 text-xs font-bold tracking-[0.16em] text-text-primary uppercase"
        >
          <span aria-hidden="true" className="h-4 w-1 rounded-full bg-accent" />
          {title || t.home.topStories}
        </h2>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-0">
          {lead && <FeaturedArticleCard article={lead} className={cn(leadSpan, "lg:pr-8")} />}

          {stories.length > 0 && (
            <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1 lg:content-start lg:gap-0 lg:divide-y lg:divide-border lg:border-l lg:border-border lg:px-8">
              {stories.map((article) => (
                <li key={article.href} className="lg:py-5 lg:first:pt-0 lg:last:pb-0">
                  <StoryRow article={article} locale={locale} />
                </li>
              ))}
            </ul>
          )}

          {headlines.length > 0 && (
            <aside
              aria-labelledby="top-headlines-title"
              className={cn(
                "rounded-2xl border border-border bg-surface-elevated p-5 lg:rounded-none lg:border-0 lg:border-l lg:bg-transparent lg:p-0 lg:pl-8",
                stories.length > 0 ? "lg:col-span-3" : "lg:col-span-4",
              )}
            >
              <h3 id="top-headlines-title" className="text-sm font-bold tracking-[0.12em] text-text-primary uppercase">
                {headlinesTitle || t.home.topHeadlines}
              </h3>
              <ol className="mt-3 divide-y divide-border">
                {headlines.map((article) => (
                  <li key={article.href} className="group relative py-3 last:pb-0">
                    <p className="text-[0.6875rem] font-semibold tracking-[0.1em] text-text-muted uppercase">
                      <time dateTime={article.date}>{formatDate(article.date, locale)}</time>
                      <span aria-hidden="true"> · </span>
                      {article.category}
                    </p>
                    <h4
                      lang={article.locale && article.locale !== locale ? article.locale : undefined}
                      className="mt-1 line-clamp-3 text-[0.9375rem] leading-snug font-semibold text-text-primary transition-colors group-hover:text-primary"
                    >
                      <Link
                        href={article.href}
                        className="outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-primary"
                      >
                        {article.title}
                      </Link>
                    </h4>
                  </li>
                ))}
              </ol>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}

/** A top story beside the lead: thumbnail, category, headline and date. */
function StoryRow({ article, locale }: { article: Article; locale: Locale }) {
  return (
    <article className="group relative flex items-start gap-4">
      <CardMedia
        article={article}
        sizes="(min-width: 1024px) 128px, 40vw"
        compactCover
        className="aspect-[4/3] w-28 shrink-0 rounded-lg sm:w-32"
      />
      <div className="min-w-0">
        <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-primary uppercase">{article.category}</p>
        <h3
          lang={article.locale && article.locale !== locale ? article.locale : undefined}
          className="mt-1 line-clamp-3 text-base leading-snug font-semibold tracking-[-0.01em] text-text-primary transition-colors group-hover:text-primary"
        >
          <Link
            href={article.href}
            className="outline-none after:absolute after:-inset-1.5 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-primary"
          >
            {article.title}
          </Link>
        </h3>
        <p className="mt-1.5 text-xs text-text-muted">
          <time dateTime={article.date}>{formatDate(article.date, locale)}</time>
        </p>
      </div>
    </article>
  );
}
