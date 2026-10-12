"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { updateHeaderCategories, updateHeroArticles } from "@/actions/settings";
import { Icon } from "@/components/ui/Icon";
import { toneStyle, type Tone } from "@/lib/tones";

type TopicItem = {
  id: string;
  slug: string;
  label: string;
  description: string;
  icon: string;
  tone: string;
  _count: { articles: number };
};

type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
  topicSlug: string;
  authorName: string;
  publishedAt: Date;
};

type SiteSettingsManagerProps = {
  topics: TopicItem[];
  initialSelectedSlugs: string[];
  articles?: ArticleItem[];
  initialHeroSlugs?: string[];
};

const MAX_HEADER_CATEGORIES = 5;
const HERO_STORIES_COUNT = 3;
const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";

export function SiteSettingsManager({
  topics,
  initialSelectedSlugs,
  articles = [],
  initialHeroSlugs = [],
}: SiteSettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<"hero" | "header">("hero");

  // --- Header Categories State ---
  const [selectedHeaderSlugs, setSelectedHeaderSlugs] = useState<string[]>(
    initialSelectedSlugs.slice(0, MAX_HEADER_CATEGORIES)
  );
  const [headerLoading, setHeaderLoading] = useState(false);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [headerSuccess, setHeaderSuccess] = useState(false);

  // --- Hero Featured Articles State ---
  const [selectedHeroSlugs, setSelectedHeroSlugs] = useState<string[]>(
    initialHeroSlugs.slice(0, HERO_STORIES_COUNT)
  );
  const [heroSearch, setHeroSearch] = useState("");
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [heroSuccess, setHeroSuccess] = useState(false);

  // Mappings
  const topicMap = new Map(topics.map((t) => [t.slug, t]));
  const articleMap = new Map(articles.map((a) => [a.slug, a]));

  // Active items
  const activeTopics = selectedHeaderSlugs
    .map((slug) => topicMap.get(slug))
    .filter((t): t is TopicItem => Boolean(t));

  const availableTopics = topics.filter(
    (t) => !selectedHeaderSlugs.includes(t.slug)
  );

  const activeHeroArticles = selectedHeroSlugs
    .map((slug) => articleMap.get(slug))
    .filter((a): a is ArticleItem => Boolean(a));

  const availableHeroArticles = articles.filter((a) => {
    if (selectedHeroSlugs.includes(a.slug)) return false;
    if (!heroSearch.trim()) return true;
    const query = heroSearch.toLowerCase();
    const topic = topicMap.get(a.topicSlug)?.label.toLowerCase() || "";
    return a.title.toLowerCase().includes(query) || topic.includes(query);
  });

  // --- Header Categories Handlers ---
  function handleHeaderMoveUp(index: number) {
    if (index === 0) return;
    const next = [...selectedHeaderSlugs];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setSelectedHeaderSlugs(next);
    setHeaderSuccess(false);
  }

  function handleHeaderMoveDown(index: number) {
    if (index === selectedHeaderSlugs.length - 1) return;
    const next = [...selectedHeaderSlugs];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setSelectedHeaderSlugs(next);
    setHeaderSuccess(false);
  }

  function handleHeaderRemove(slug: string) {
    if (selectedHeaderSlugs.length <= 1) {
      setHeaderError("At least 1 category must remain in the header navigation.");
      return;
    }
    setHeaderError(null);
    setSelectedHeaderSlugs((prev) => prev.filter((s) => s !== slug));
    setHeaderSuccess(false);
  }

  function handleHeaderAdd(slug: string) {
    if (selectedHeaderSlugs.length >= MAX_HEADER_CATEGORIES) {
      setHeaderError(`Maximum ${MAX_HEADER_CATEGORIES} categories can be shown in the header.`);
      return;
    }
    setHeaderError(null);
    setSelectedHeaderSlugs((prev) => [...prev, slug]);
    setHeaderSuccess(false);
  }

  async function handleHeaderSave() {
    if (selectedHeaderSlugs.length === 0) {
      setHeaderError("Please select at least 1 category.");
      return;
    }
    if (selectedHeaderSlugs.length > MAX_HEADER_CATEGORIES) {
      setHeaderError(`You can select at most ${MAX_HEADER_CATEGORIES} categories for the header.`);
      return;
    }

    setHeaderLoading(true);
    setHeaderError(null);
    setHeaderSuccess(false);

    try {
      const res = await updateHeaderCategories(selectedHeaderSlugs);
      if (res.success) {
        setHeaderSuccess(true);
      } else {
        setHeaderError(res.error || "Failed to update settings.");
      }
    } catch (err) {
      setHeaderError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setHeaderLoading(false);
    }
  }

  // --- Hero Articles Handlers ---
  function handleHeroMoveUp(index: number) {
    if (index === 0) return;
    const next = [...selectedHeroSlugs];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setSelectedHeroSlugs(next);
    setHeroSuccess(false);
  }

  function handleHeroMoveDown(index: number) {
    if (index === selectedHeroSlugs.length - 1) return;
    const next = [...selectedHeroSlugs];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setSelectedHeroSlugs(next);
    setHeroSuccess(false);
  }

  function handleHeroRemove(slug: string) {
    setHeroError(null);
    setSelectedHeroSlugs((prev) => prev.filter((s) => s !== slug));
    setHeroSuccess(false);
  }

  function handleHeroAdd(slug: string) {
    if (selectedHeroSlugs.length >= HERO_STORIES_COUNT) {
      setHeroError(`Maximum ${HERO_STORIES_COUNT} articles can be featured in the homepage hero.`);
      return;
    }
    setHeroError(null);
    setSelectedHeroSlugs((prev) => [...prev, slug]);
    setHeroSuccess(false);
  }

  async function handleHeroSave() {
    if (selectedHeroSlugs.length !== HERO_STORIES_COUNT) {
      setHeroError(`Please select exactly ${HERO_STORIES_COUNT} articles for the homepage hero section.`);
      return;
    }

    setHeroLoading(true);
    setHeroError(null);
    setHeroSuccess(false);

    try {
      const res = await updateHeroArticles(selectedHeroSlugs);
      if (res.success) {
        setHeroSuccess(true);
      } else {
        setHeroError(res.error || "Failed to update homepage hero articles.");
      }
    } catch (err) {
      setHeroError(err instanceof Error ? err.message : "Failed to save hero articles.");
    } finally {
      setHeroLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Site Configuration
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Configure homepage hero featured stories, navigation categories, and public display settings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs font-semibold text-text-primary shadow-xs transition-colors hover:border-primary/40 hover:text-primary"
          >
             View Public Homepage ↗
          </Link>
          <button
            type="button"
            onClick={activeTab === "hero" ? handleHeroSave : handleHeaderSave}
            disabled={activeTab === "hero" ? heroLoading : headerLoading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-semibold text-surface-elevated shadow-xs transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {activeTab === "hero"
              ? heroLoading
                ? "Saving..."
                : "Save Hero Stories"
              : headerLoading
              ? "Saving..."
              : "Save Header Categories"}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === "hero"
              ? "bg-primary text-surface-elevated shadow-xs"
              : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"
          }`}
        >
          <span>Homepage Hero Stories (Top 3)</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "hero"
                ? "bg-surface-elevated/20 text-surface-elevated"
                : "bg-surface-elevated text-text-muted"
            }`}
          >
            {selectedHeroSlugs.length}/3
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("header")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === "header"
              ? "bg-primary text-surface-elevated shadow-xs"
              : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"
          }`}
        >
          <span>Header Navigation (Max 5)</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              activeTab === "header"
                ? "bg-surface-elevated/20 text-surface-elevated"
                : "bg-surface-elevated text-text-muted"
            }`}
          >
            {selectedHeaderSlugs.length}/5
          </span>
        </button>
      </div>

      {/* TAB 1: HERO TOP 3 ARTICLES */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          {heroError && (
            <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-xs font-medium text-error">
              {heroError}
            </div>
          )}

          {heroSuccess && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-xs font-medium text-success">
              <span className="flex items-center gap-2">
                ✓ Homepage hero stories updated live! The public website hero cards now display these 3 articles with their main images.
              </span>
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:opacity-80"
              >
                View Live Homepage ↗
              </Link>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left 2 Columns: Selected 3 Hero Stories */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs">
                <div className="border-b border-border pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-base font-bold text-text-primary">
                        Homepage Hero Layout (3 Stories)
                      </h2>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${
                          selectedHeroSlugs.length === HERO_STORIES_COUNT
                            ? "bg-accent/15 text-accent"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {selectedHeroSlugs.length} / {HERO_STORIES_COUNT} Selected
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    Select which 3 articles to showcase at the very top of the landing page. Their high-res cover photos will be displayed directly.
                  </p>
                </div>

                {/* Selected Slots */}
                <div className="mt-6 space-y-4">
                  {selectedHeroSlugs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-text-muted">
                      No hero articles selected yet. Choose 3 published articles from the right column.
                    </div>
                  ) : (
                    activeHeroArticles.map((article, index) => {
                      const topic = topicMap.get(article.topicSlug);
                      const isLead = index === 0;

                      return (
                        <div
                          key={article.slug}
                          className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all shadow-xs ${
                            isLead
                              ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                              : "border-border bg-background hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                            {/* Slot Badge */}
                            <div className="flex flex-col items-center shrink-0">
                              <span
                                className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-mono font-bold ${
                                  isLead
                                    ? "bg-primary text-surface-elevated shadow-xs"
                                    : "bg-surface-elevated text-text-muted ring-1 ring-border"
                                }`}
                              >
                                #{index + 1}
                              </span>
                            </div>

                            {/* Cover Image Thumbnail */}
                            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-elevated ring-1 ring-border">
                              <Image
                                src={article.imageUrl || FALLBACK_THUMB}
                                alt={article.title}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>

                            {/* Title & Info */}
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    isLead
                                      ? "bg-primary text-surface-elevated"
                                      : "bg-surface-elevated text-text-muted ring-1 ring-border"
                                  }`}
                                >
                                  {isLead ? "Lead Story (Main Feature)" : `Side Card #${index}`}
                                </span>
                                {topic && (
                                  <span
                                    style={toneStyle(topic.tone as Tone)}
                                    className="text-[10px] font-bold text-(color:--tone)"
                                  >
                                    • {topic.label}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-text-primary line-clamp-2">
                                {article.title}
                              </p>
                              <p className="text-[11px] text-text-muted">
                                By {article.authorName} • /articles/{article.slug}
                              </p>
                            </div>
                          </div>

                          {/* Actions: Reorder & Remove */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleHeroMoveUp(index)}
                              disabled={index === 0}
                              title="Move up (make Lead story)"
                              className="grid size-8 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => handleHeroMoveDown(index)}
                              disabled={index === activeHeroArticles.length - 1}
                              title="Move down"
                              className="grid size-8 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => handleHeroRemove(article.slug)}
                              title="Remove from hero"
                              className="grid size-8 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-error transition-colors hover:bg-error/10 hover:border-error/40"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Available Published Articles to Pick */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs space-y-4">
                <div>
                  <h2 className="text-base font-bold text-text-primary">
                    Available Articles
                  </h2>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Click &quot;+ Add to Hero&quot; to place an article in the hero grid.
                  </p>
                </div>

                {selectedHeroSlugs.length >= HERO_STORIES_COUNT ? (
                  <div className="rounded-xl border border-accent/20 bg-accent/10 p-3.5 text-xs font-medium text-accent">
                    Maximum limit reached ({HERO_STORIES_COUNT} of {HERO_STORIES_COUNT}). Remove a card on the left to swap.
                  </div>
                ) : null}

                {/* Search Bar */}
                <div>
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search articles by title or topic..."
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Available Articles List */}
                <div className="max-h-[520px] space-y-2.5 overflow-y-auto pr-1">
                  {availableHeroArticles.length === 0 ? (
                    <p className="text-xs text-text-muted py-4 text-center">
                      No matching articles found.
                    </p>
                  ) : (
                    availableHeroArticles.map((article) => {
                      const topic = topicMap.get(article.topicSlug);

                      return (
                        <div
                          key={article.slug}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-2.5 transition-colors hover:border-primary/40"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-surface-elevated ring-1 ring-border">
                              <Image
                                src={article.imageUrl || FALLBACK_THUMB}
                                alt={article.title}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-text-primary line-clamp-1">
                                {article.title}
                              </p>
                              <p className="text-[10px] text-text-muted truncate">
                                {topic?.label || article.topicSlug}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleHeroAdd(article.slug)}
                            disabled={selectedHeroSlugs.length >= HERO_STORIES_COUNT}
                            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface-elevated px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            + Add
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <Link
                    href="/admin/articles/new"
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    + Create new article →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HEADER CATEGORIES */}
      {activeTab === "header" && (
        <div className="space-y-6">
          {headerError && (
            <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-xs font-medium text-error">
              {headerError}
            </div>
          )}

          {headerSuccess && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-xs font-medium text-success">
              <span className="flex items-center gap-2">
                ✓ Header categories updated live! The public website header now reflects your changes.
              </span>
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:opacity-80"
              >
                Check Home Page ↗
              </Link>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column (2 Cols): Active Header Categories */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs">
                <div className="border-b border-border pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-base font-bold text-text-primary">
                        Header Navigation Categories
                      </h2>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${
                          selectedHeaderSlugs.length === MAX_HEADER_CATEGORIES
                            ? "bg-accent/15 text-accent"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {selectedHeaderSlugs.length} / {MAX_HEADER_CATEGORIES} Selected
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    Choose up to <strong>{MAX_HEADER_CATEGORIES} categories</strong> to display in the main website header. Reorder from left to right.
                  </p>
                </div>

                {/* List of Selected Categories */}
                <div className="mt-6 space-y-3">
                  {activeTopics.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-text-muted">
                      No categories selected. Click &quot;Add to Header&quot; below to add categories.
                    </div>
                  ) : (
                    activeTopics.map((topic, index) => (
                      <div
                        key={topic.slug}
                        className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-3.5 transition-colors hover:border-primary/40 shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Position Badge */}
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-xs font-mono font-bold text-text-muted ring-1 ring-border">
                            #{index + 1}
                          </span>

                          {/* Icon & Label */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              style={toneStyle(topic.tone as Tone)}
                              className="grid size-8 shrink-0 place-items-center rounded-lg bg-(color:--tone)/10 text-(color:--tone)"
                            >
                              <Icon name={topic.icon as any} className="size-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-text-primary truncate">
                                {topic.label}
                              </p>
                              <p className="text-[11px] font-mono text-text-muted truncate">
                                /category/{topic.slug} • {topic._count.articles} stories
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions: Reorder & Remove */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleHeaderMoveUp(index)}
                            disabled={index === 0}
                            title="Move left/earlier in navbar"
                            className="grid size-8 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleHeaderMoveDown(index)}
                            disabled={index === activeTopics.length - 1}
                            title="Move right/later in navbar"
                            className="grid size-8 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => handleHeaderRemove(topic.slug)}
                            title="Remove from header"
                            className="grid size-8 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-error transition-colors hover:bg-error/10 hover:border-error/40"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Available Categories to Add */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs space-y-4">
                <div>
                  <h2 className="text-base font-bold text-text-primary">
                    Available Categories
                  </h2>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Add other published categories to the header bar.
                  </p>
                </div>

                {selectedHeaderSlugs.length >= MAX_HEADER_CATEGORIES ? (
                  <div className="rounded-xl border border-accent/20 bg-accent/10 p-3.5 text-xs font-medium text-accent">
                    Maximum limit reached ({MAX_HEADER_CATEGORIES} of {MAX_HEADER_CATEGORIES}). Remove a category on the left to add a different one.
                  </div>
                ) : availableTopics.length === 0 ? (
                  <p className="text-xs text-text-muted">
                    All available categories are already in the header navigation.
                  </p>
                ) : null}

                <div className="space-y-2.5">
                  {availableTopics.map((topic) => (
                    <div
                      key={topic.slug}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          style={toneStyle(topic.tone as Tone)}
                          className="grid size-7 shrink-0 place-items-center rounded-lg bg-(color:--tone)/10 text-(color:--tone)"
                        >
                          <Icon name={topic.icon as any} className="size-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">
                            {topic.label}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            {topic._count.articles} articles
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleHeaderAdd(topic.slug)}
                        disabled={selectedHeaderSlugs.length >= MAX_HEADER_CATEGORIES}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface-elevated px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <Link
                    href="/admin/categories"
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Manage all categories &amp; add new topics →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
