"use client";

import Link from "@/i18n/Link";
import { useState, type ReactNode } from "react";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { useI18n } from "@/i18n/client";
import { format, plural } from "@/i18n/config";
import { cn } from "@/lib/cn";
import type { Article } from "@/types/article";
import styles from "./home.module.css";
import { SectionHeader, sectionContainer } from "./SectionHeader";

export type ArticleFilter = {
  label: string;
  /** Topic slug to match, or null for "All". */
  value: string | null;
};

type LatestArticlesProps = {
  articles: Article[];
  filters: ArticleFilter[];
  /** Rendered beside the grid on desktop and below it on smaller screens. */
  sidebar?: ReactNode;
  viewAllHref?: string;
};

export function LatestArticles({
  articles,
  filters,
  sidebar,
  viewAllHref = "/blog",
}: LatestArticlesProps) {
  const { t } = useI18n();
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? articles.filter((article) => article.topic === active) : articles;
  const activeLabel = filters.find((filter) => filter.value === active)?.label ?? t.home.all;

  return (
    <section aria-labelledby="latest-articles-title" className="py-10 sm:py-14">
      <div className={sectionContainer}>
        <SectionHeader
          id="latest-articles-title"
          title={t.home.latestTitle}
          action={{ label: t.common.viewAll, href: viewAllHref }}
        />

        <div
          role="group"
          aria-label={t.home.filterLabel}
          className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {filters.map((filter) => {
            const selected = filter.value === active;
            return (
              <button
                key={filter.label}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(filter.value)}
                className={cn(
                  "h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-200",
                  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
                  selected
                    ? "border-transparent bg-primary text-surface-elevated shadow-md shadow-primary/25"
                    : "border-border bg-surface-elevated text-text-secondary hover:border-text-muted/40 hover:text-text-primary",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-12">
          <div>
            <p className="sr-only" aria-live="polite">
              {plural(t.home.showing, visible.length, { category: activeLabel })}
            </p>
            {visible.length > 0 ? (
              <ul key={active ?? "all"} className={cn("grid gap-5 sm:grid-cols-2 xl:grid-cols-3", styles.fadeIn)}>
                {visible.map((article) => (
                  <li key={article.href}>
                    <ArticleCard article={article} showExcerpt />
                  </li>
                ))}
              </ul>
            ) : (
              <div className={cn("rounded-2xl border border-dashed border-border px-6 py-14 text-center", styles.fadeIn)}>
                <p className="font-medium text-text-primary">{format(t.home.emptyTitle, { category: activeLabel })}</p>
                <p className="mt-1 text-sm text-text-muted">
                  {t.home.emptyNote}{" "}
                  <Link href={viewAllHref} className="font-medium text-primary hover:text-primary-hover">
                    {t.home.browseAll}
                  </Link>
                </p>
              </div>
            )}
          </div>

          {sidebar && <div className="lg:sticky lg:top-24 lg:self-start">{sidebar}</div>}
        </div>
      </div>
    </section>
  );
}
