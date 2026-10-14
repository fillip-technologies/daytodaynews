"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/components/home/home.module.css";
import type { Topic } from "@/data/topics";
import { useI18n } from "@/i18n/client";
import { localizePath, plural } from "@/i18n/config";
import {
  BLOG_PAGE_SIZE,
  blogUrl,
  parseBlogParams,
  queryArticles,
  type BlogParams,
} from "@/lib/blog";
import type { Article } from "@/types/article";
import { BlogFilters } from "./BlogFilters";
import { BlogGrid } from "./BlogGrid";
import { BlogSearch } from "./BlogSearch";
import { EmptyState } from "./EmptyState";
import { FeaturedArticle } from "./FeaturedArticle";

type BlogExplorerProps = {
  articles: Article[];
  topics: Topic[];
  /** Search/category state parsed from the request URL. */
  initial: BlogParams;
};

/** Search, category filters, featured story, results grid and Load More. */
export function BlogExplorer({ articles, topics, initial }: BlogExplorerProps) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState(initial.query);
  const [category, setCategory] = useState(initial.category);
  const [limit, setLimit] = useState(BLOG_PAGE_SIZE);
  const listRef = useRef<HTMLUListElement>(null);

  // Keep state in step with browser back/forward.
  useEffect(() => {
    function onPopState() {
      const params = parseBlogParams(new URLSearchParams(window.location.search));
      setQuery(params.query);
      setCategory(params.category);
      setLimit(BLOG_PAGE_SIZE);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function update(next: Partial<BlogParams>, history: "push" | "replace") {
    const state = { query, category, ...next };
    setQuery(state.query);
    setCategory(state.category);
    setLimit(BLOG_PAGE_SIZE);
    const url = localizePath(blogUrl(state), locale);
    if (history === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }

  const featured = articles.find((article) => article.featured);
  const showFeatured = Boolean(featured) && !query.trim() && !category;
  const { items, total } = queryArticles(articles, {
    query,
    category,
    limit,
    excludeIds: showFeatured && featured?.id ? [featured.id] : [],
  });

  const activeTopic = topics.find((topic) => topic.slug === category);
  const heading = query.trim() ? t.blog.searchResults : activeTopic ? activeTopic.label : t.blog.allArticles;

  function loadMore() {
    const firstNew = items.length;
    setLimit((current) => current + BLOG_PAGE_SIZE);
    // Move focus to the first newly revealed article for keyboard users.
    requestAnimationFrame(() => {
      listRef.current?.querySelectorAll<HTMLAnchorElement>("li h3 a")[firstNew]?.focus();
    });
  }

  return (
    <div>
      <div className="space-y-5">
        <div className="max-w-2xl">
          <BlogSearch value={query} onChange={(value) => update({ query: value }, "replace")} />
        </div>
        <BlogFilters
          topics={topics}
          active={category}
          onSelect={(value) => update({ category: value }, "push")}
          hrefFor={(value) => blogUrl({ query, category: value })}
          labels={{ all: t.blog.all, nav: t.blog.categoriesNav }}
        />
      </div>

      {showFeatured && featured && (
        <section aria-label={t.common.featuredArticle} className="mt-10 sm:mt-12">
          <FeaturedArticle article={featured} />
        </section>
      )}

      <section aria-labelledby="all-articles-title" className="mt-14 sm:mt-16">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <span aria-hidden="true" className="mb-3 block h-1 w-8 rounded-full bg-gradient-primary" />
            <h2
              id="all-articles-title"
              className="text-2xl font-semibold tracking-[-0.02em] text-text-primary sm:text-[1.875rem]"
            >
              {heading}
            </h2>
          </div>
          <p aria-live="polite" className="text-sm text-text-muted">
            {total > items.length
              ? plural(t.blog.showingOf, total, { shown: items.length, total })
              : plural(t.blog.showing, total, { shown: items.length })}
          </p>
        </header>

        <div className="mt-8">
          {items.length > 0 ? (
            <BlogGrid
              key={category ?? "all"}
              articles={items}
              total={total}
              onLoadMore={loadMore}
              listRef={listRef}
              className={styles.fadeIn}
            />
          ) : (
            <div className={styles.fadeIn}>
              <EmptyState onAction={() => update({ query: "", category: null }, "push")} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
