"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { updateHomepage } from "@/actions/homepage";
import { Switch } from "@/components/admin/Switch";
import { Icon } from "@/components/ui/Icon";
import { dictionaries } from "@/i18n/dictionaries";
import { cn } from "@/lib/cn";
import {
  MAX_CATEGORY_BLOCKS,
  newSection,
  SECTION_RULES,
  type HomeSection,
  type HomeSectionType,
  type HomeText,
} from "@/lib/homepage";
import { toneStyle, type Tone } from "@/lib/tones";

export type AdminArticle = {
  slug: string;
  title: string;
  /** Category slug. */
  category: string;
  categoryLabel: string;
  /** ISO date. */
  date: string;
  image: string | null;
  editorsPick: boolean;
  trending: boolean;
  trendingRank: number | null;
};

type AdminCategory = { slug: string; label: string; icon: string; tone: string };

type HomepageManagerProps = {
  initialSections: HomeSection[];
  /** False while the starting layout is shown and nothing is saved yet. */
  saved: boolean;
  /** Published articles, newest first. */
  articles: AdminArticle[];
  categories: AdminCategory[];
};

type Notice = { kind: "success" | "error"; text: string } | null;

const inputClass =
  "mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-text-primary focus:border-primary focus:outline-none";
const labelClass = "text-[11px] font-semibold text-text-secondary";
const iconButtonClass =
  "grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30";
const smallIconButtonClass =
  "grid size-7 shrink-0 place-items-center rounded-md text-[11px] text-text-muted transition-colors hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30";
const removeButtonClass =
  "grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-error transition-colors hover:border-error/40 hover:bg-error/10";
const primaryButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-surface-elevated transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-elevated px-4 text-xs font-semibold text-text-secondary transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50";

const { en, hi } = dictionaries;

/** What the website shows when a title is left empty. */
const defaultTitles: Record<HomeSectionType, HomeText> = {
  ticker: { en: en.home.breaking, hi: hi.home.breaking },
  top: { en: en.home.topStories, hi: hi.home.topStories },
  topics: { en: en.home.exploreTitle, hi: hi.home.exploreTitle },
  category: { en: "The category's name", hi: "कैटेगरी का हिंदी नाम" },
  editorsPicks: { en: en.home.editorsPicksTitle, hi: hi.home.editorsPicksTitle },
  latest: { en: en.home.latestTitle, hi: hi.home.latestTitle },
  newsletter: { en: en.newsletter.title, hi: hi.newsletter.title },
};
const defaultDescriptions: Partial<Record<HomeSectionType, HomeText>> = {
  editorsPicks: { en: en.home.editorsPicksDescription, hi: hi.home.editorsPicksDescription },
  newsletter: { en: en.newsletter.description, hi: hi.newsletter.description },
};
const defaultSideTitles: Partial<Record<HomeSectionType, HomeText>> = {
  top: { en: en.home.topHeadlines, hi: hi.home.topHeadlines },
  latest: { en: en.home.trendingTitle, hi: hi.home.trendingTitle },
};
/** Names of each section's article lists. */
const listLabels: Partial<Record<HomeSectionType, { main: string; side?: string }>> = {
  ticker: { main: "Headlines in the ticker" },
  top: { main: "Lead story and top stories (the first one is the big lead)", side: "Headlines list (right column)" },
  category: { main: "Stories (the first one is shown big)" },
  editorsPicks: { main: "Stories" },
  latest: { main: "Stories in the grid", side: "Trending list (beside the grid)" },
};

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function NoticeBox({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <p
      role={notice.kind === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border p-3.5 text-xs font-medium",
        notice.kind === "error"
          ? "border-error/30 bg-error/10 text-error"
          : "border-success/30 bg-success/10 text-success",
      )}
    >
      {notice.text}
    </p>
  );
}

function CategoryIcon({ category }: { category: AdminCategory }) {
  return (
    <span
      aria-hidden="true"
      style={toneStyle(category.tone as Tone)}
      className="grid size-7 shrink-0 place-items-center rounded-lg bg-(color:--tone)/10 text-(color:--tone)"
    >
      <Icon name={category.icon} className="size-3.5" />
    </span>
  );
}

export function HomepageManager({ initialSections, saved, articles, categories }: HomepageManagerProps) {
  const [sections, setSections] = useState(initialSections);
  const [savedJson, setSavedJson] = useState(() => (saved ? JSON.stringify(initialSections) : ""));
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [blockToAdd, setBlockToAdd] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const newIds = useRef(0);

  const articleBySlug = useMemo(() => new Map(articles.map((a) => [a.slug, a])), [articles]);
  const categoryBySlug = useMemo(() => new Map(categories.map((c) => [c.slug, c])), [categories]);
  const trendingFirst = useMemo(
    () => [
      ...articles
        .filter((a) => a.trending)
        .sort((a, b) => (a.trendingRank ?? Number.MAX_SAFE_INTEGER) - (b.trendingRank ?? Number.MAX_SAFE_INTEGER)),
      ...articles.filter((a) => !a.trending),
    ],
    [articles],
  );
  const picksFirst = useMemo(
    () => [...articles.filter((a) => a.editorsPick), ...articles.filter((a) => !a.editorsPick)],
    [articles],
  );

  // Unsaved until the first save, even when nothing was edited.
  const dirty = JSON.stringify(sections) !== savedJson;
  const blockCount = sections.filter((s) => s.type === "category").length;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function edit(next: HomeSection[]) {
    setSections(next);
    setNotice(null);
  }

  function update(id: string, patch: Partial<HomeSection>) {
    edit(sections.map((section) => (section.id === id ? { ...section, ...patch } : section)));
  }

  function toggleOpen(id: string) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addCategoryBlock() {
    if (!blockToAdd || blockCount >= MAX_CATEGORY_BLOCKS) return;
    const id = `category-${blockToAdd}-new${++newIds.current}`;
    edit([...sections, newSection("category", id, [blockToAdd])]);
    setOpen((current) => new Set(current).add(id));
    setBlockToAdd("");
  }

  async function save() {
    setSaving(true);
    setNotice(null);
    try {
      const res = await updateHomepage(sections);
      if (res.success && res.sections) {
        setSections(res.sections);
        setSavedJson(JSON.stringify(res.sections));
        setNotice({ kind: "success", text: "Homepage saved. The website now shows exactly this layout." });
      } else {
        setNotice({ kind: "error", text: res.error ?? "Could not save the homepage." });
      }
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not save the homepage." });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!savedJson) return;
    edit(JSON.parse(savedJson) as HomeSection[]);
  }

  /** Candidates for a list, in the order Fill adds them. */
  function poolFor(section: HomeSection, side: boolean): { pool: AdminArticle[]; fillLabel: string } {
    if (section.type === "category") {
      const category = categoryBySlug.get(section.categories[0]);
      return {
        pool: articles.filter((a) => a.category === section.categories[0]),
        fillLabel: `Fill with newest from ${category?.label ?? "this category"}`,
      };
    }
    if (section.type === "editorsPicks") return { pool: picksFirst, fillLabel: "Fill (★ Editor's Picks first)" };
    if (section.type === "latest" && side) return { pool: trendingFirst, fillLabel: "Fill (🔥 Trending first)" };
    return { pool: articles, fillLabel: "Fill with newest" };
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Homepage</h1>
          <p className="mt-1 max-w-3xl text-xs text-text-muted">
            Everything on the homepage is set here: which sections show, their order, their titles in English and
            Hindi, and every story in them. Nothing changes on its own: a new article appears on the homepage only
            once you add it here.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/" target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
            View website ↗
          </Link>
          <button type="button" onClick={save} disabled={!dirty || saving} className={primaryButtonClass}>
            {saving ? "Saving…" : "Save homepage"}
          </button>
        </div>
      </div>

      {!saved && !savedJson && (
        <p className="rounded-xl border border-accent/30 bg-accent/10 p-3.5 text-xs font-medium text-accent">
          This starting layout is built from what the homepage showed before. Check it, change what you like, then
          press Save homepage.
        </p>
      )}
      <NoticeBox notice={notice} />

      <ol className="space-y-3">
        {sections.map((section, index) => {
          const rules = SECTION_RULES[section.type];
          const isOpen = open.has(section.id);
          const category = section.type === "category" ? categoryBySlug.get(section.categories[0]) : undefined;
          const name =
            section.title.en ||
            (section.type === "category" ? (category?.label ?? "Category block") : defaultTitles[section.type].en);
          const counts = [
            rules.articles > 0 && `${section.articles.length}/${rules.articles} stories`,
            rules.side > 0 && `${section.sideArticles.length}/${rules.side} in the ${section.type === "top" ? "headlines" : "trending"} list`,
            section.type === "topics" && `${section.categories.length} categories`,
          ].filter(Boolean);

          return (
            <li
              key={section.id}
              className={cn(
                "rounded-2xl border bg-surface-elevated shadow-2xs transition-colors",
                section.enabled ? "border-border" : "border-dashed border-border opacity-70",
              )}
            >
              <div className="flex flex-wrap items-center gap-3 p-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-background font-mono text-xs font-bold text-text-muted ring-1 ring-border">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
                      {rules.label}
                    </span>
                    <span className="truncate text-sm font-bold text-text-primary">{name}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-text-muted">
                    {section.enabled ? "Shown" : "Hidden"}
                    {counts.length > 0 && ` · ${counts.join(" · ")}`}
                  </p>
                </div>
                <Switch
                  checked={section.enabled}
                  onChange={(enabled) => update(section.id, { enabled })}
                  label={section.enabled ? "On" : "Off"}
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => edit(move(sections, index, index - 1))}
                    disabled={index === 0}
                    aria-label={`Move ${name} up`}
                    className={iconButtonClass}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => edit(move(sections, index, index + 1))}
                    disabled={index === sections.length - 1}
                    aria-label={`Move ${name} down`}
                    className={iconButtonClass}
                  >
                    ▼
                  </button>
                  {rules.repeatable && (
                    <button
                      type="button"
                      onClick={() => edit(sections.filter((s) => s.id !== section.id))}
                      aria-label={`Delete ${name}`}
                      className={removeButtonClass}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggleOpen(section.id)}
                  aria-expanded={isOpen}
                  className={cn(secondaryButtonClass, "h-8 px-3")}
                >
                  {isOpen ? "Close" : "Edit"}
                </button>
              </div>

              {isOpen && (
                <div className="space-y-4 border-t border-border p-4 sm:pl-14">
                  <p className="text-xs text-text-muted">{rules.hint}</p>

                  {section.type === "category" && (
                    <label className="block max-w-sm">
                      <span className={labelClass}>Category</span>
                      <select
                        value={section.categories[0] ?? ""}
                        onChange={(e) => update(section.id, { categories: [e.target.value] })}
                        className={inputClass}
                      >
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <TextPair
                    label="Title"
                    value={section.title}
                    placeholder={
                      section.type === "category" && category
                        ? { en: category.label, hi: defaultTitles.category.hi }
                        : defaultTitles[section.type]
                    }
                    onChange={(title) => update(section.id, { title })}
                  />
                  {rules.hasDescription && (
                    <TextPair
                      label="Description"
                      value={section.description}
                      placeholder={defaultDescriptions[section.type] ?? { en: "", hi: "" }}
                      maxLength={300}
                      onChange={(description) => update(section.id, { description })}
                    />
                  )}

                  {section.type === "topics" && (
                    <CategoryPicker
                      slugs={section.categories}
                      max={rules.categories}
                      categories={categories}
                      onChange={(slugs) => update(section.id, { categories: slugs })}
                    />
                  )}

                  {rules.articles > 0 && (
                    <ArticleList
                      label={listLabels[section.type]?.main ?? "Stories"}
                      slugs={section.articles}
                      max={rules.articles}
                      articles={articles}
                      bySlug={articleBySlug}
                      {...poolFor(section, false)}
                      onChange={(slugs) => update(section.id, { articles: slugs })}
                    />
                  )}

                  {rules.side > 0 && (
                    <>
                      <TextPair
                        label={section.type === "top" ? "Headlines list title" : "Trending list title"}
                        value={section.sideTitle}
                        placeholder={defaultSideTitles[section.type] ?? { en: "", hi: "" }}
                        onChange={(sideTitle) => update(section.id, { sideTitle })}
                      />
                      <ArticleList
                        label={listLabels[section.type]?.side ?? "Second list"}
                        slugs={section.sideArticles}
                        max={rules.side}
                        articles={articles}
                        bySlug={articleBySlug}
                        {...poolFor(section, true)}
                        onChange={(slugs) => update(section.id, { sideArticles: slugs })}
                      />
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-border p-4">
        <select
          value={blockToAdd}
          onChange={(e) => setBlockToAdd(e.target.value)}
          disabled={blockCount >= MAX_CATEGORY_BLOCKS}
          aria-label="Category for a new block"
          className={cn(inputClass, "mt-0 h-9 w-full sm:w-72")}
        >
          <option value="">
            {blockCount >= MAX_CATEGORY_BLOCKS
              ? `Maximum ${MAX_CATEGORY_BLOCKS} category blocks`
              : "New category block for…"}
          </option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={addCategoryBlock} disabled={!blockToAdd} className={secondaryButtonClass}>
          + Add category block
        </button>
        <p className="w-full text-[11px] text-text-muted">
          It is added at the bottom: move it with ▲ ▼, then add its stories.
        </p>
      </div>

      {/* Save bar, while there are unsaved changes. */}
      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-elevated/95 px-4 py-3 shadow-[0_-8px_24px_-12px] shadow-text-primary/15 backdrop-blur-sm md:left-64">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-text-primary">
              {savedJson ? "You have unsaved homepage changes." : "This layout isn't saved yet."}
            </p>
            <div className="flex items-center gap-2">
              {savedJson && (
                <button type="button" onClick={discard} disabled={saving} className={secondaryButtonClass}>
                  Discard
                </button>
              )}
              <button type="button" onClick={save} disabled={saving} className={primaryButtonClass}>
                {saving ? "Saving…" : "Save homepage"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Parts

function TextPair({
  label,
  value,
  placeholder,
  maxLength = 120,
  onChange,
}: {
  label: string;
  value: HomeText;
  placeholder: HomeText;
  maxLength?: number;
  onChange: (value: HomeText) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className={labelClass}>{label} (English)</span>
        <input
          value={value.en}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          maxLength={maxLength}
          placeholder={placeholder.en ? `Default: ${placeholder.en}` : "Optional"}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className={labelClass}>{label} (हिंदी)</span>
        <input
          lang="hi"
          value={value.hi}
          onChange={(e) => onChange({ ...value, hi: e.target.value })}
          maxLength={maxLength}
          placeholder={placeholder.hi ? `Default: ${placeholder.hi}` : "Optional"}
          className={inputClass}
        />
      </label>
    </div>
  );
}

function CategoryPicker({
  slugs,
  max,
  categories,
  onChange,
}: {
  slugs: string[];
  max: number;
  categories: AdminCategory[];
  onChange: (slugs: string[]) => void;
}) {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const available = categories.filter((c) => !slugs.includes(c.slug));
  return (
    <div className="rounded-xl border border-border bg-background p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className={labelClass}>Categories in the strip, in order</p>
        <span className="text-[11px] font-bold text-text-muted">
          {slugs.length} / {max}
        </span>
      </div>
      <ul className="mt-2 flex flex-wrap items-center gap-2">
        {slugs.map((slug, index) => {
          const category = bySlug.get(slug);
          if (!category) return null;
          return (
            <li
              key={slug}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-elevated py-1 pr-1 pl-1.5"
            >
              <CategoryIcon category={category} />
              <span className="px-1 text-xs font-semibold text-text-primary">{category.label}</span>
              <button
                type="button"
                onClick={() => onChange(move(slugs, index, index - 1))}
                disabled={index === 0}
                aria-label={`Move ${category.label} earlier`}
                className={smallIconButtonClass}
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() => onChange(slugs.filter((s) => s !== slug))}
                aria-label={`Remove ${category.label}`}
                className={cn(smallIconButtonClass, "text-error hover:bg-error/10 hover:text-error")}
              >
                ✕
              </button>
            </li>
          );
        })}
        {slugs.length < max && available.length > 0 && (
          <li>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) onChange([...slugs, e.target.value]);
              }}
              aria-label="Add a category to the strip"
              className={cn(inputClass, "mt-0 h-9 w-56")}
            >
              <option value="">+ Add a category…</option>
              {available.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </li>
        )}
      </ul>
    </div>
  );
}

function ArticleList({
  label,
  slugs,
  max,
  articles,
  bySlug,
  pool,
  fillLabel,
  onChange,
}: {
  label: string;
  slugs: string[];
  max: number;
  /** Every published article, for search. */
  articles: AdminArticle[];
  bySlug: Map<string, AdminArticle>;
  /** What Fill adds, in order. */
  pool: AdminArticle[];
  fillLabel: string;
  onChange: (slugs: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const listed = new Set(slugs);
  const q = query.trim().toLowerCase();
  const results = q
    ? articles
        .filter((a) => !listed.has(a.slug))
        .filter((a) => a.title.toLowerCase().includes(q) || a.categoryLabel.toLowerCase().includes(q))
        .slice(0, 8)
    : [];
  const room = max - slugs.length;
  const fillable = pool.filter((a) => !listed.has(a.slug)).slice(0, Math.max(0, room));

  return (
    <div className="rounded-xl border border-border bg-background p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={labelClass}>{label}</p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-bold",
            room === 0 ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary",
          )}
        >
          {slugs.length} / {max}
        </span>
      </div>

      {slugs.length === 0 ? (
        <p className="mt-2 rounded-lg border border-dashed border-border p-4 text-center text-[11px] text-text-muted">
          No stories yet, so this part stays hidden on the website. Search below, or use Fill.
        </p>
      ) : (
        <ol className="mt-2 space-y-1.5">
          {slugs.map((slug, index) => {
            const article = bySlug.get(slug);
            return (
              <li
                key={slug}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border bg-surface-elevated p-1.5 pr-2",
                  article ? "border-border" : "border-error/30",
                )}
              >
                <span className="w-5 shrink-0 text-center font-mono text-[11px] font-bold text-text-muted">
                  {index + 1}
                </span>
                <Thumb src={article?.image ?? null} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-text-primary">
                    {article ? article.title : "Unpublished or deleted article (removed when you save)"}
                  </span>
                  <span className="block truncate text-[11px] text-text-muted">
                    {article ? <ArticleMeta article={article} /> : slug}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onChange(move(slugs, index, index - 1))}
                  disabled={index === 0}
                  aria-label="Move up"
                  className={smallIconButtonClass}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => onChange(move(slugs, index, index + 1))}
                  disabled={index === slugs.length - 1}
                  aria-label="Move down"
                  className={smallIconButtonClass}
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => onChange(slugs.filter((s) => s !== slug))}
                  aria-label="Remove"
                  className={cn(smallIconButtonClass, "text-error hover:bg-error/10 hover:text-error")}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {room > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search published articles by title or category to add…"
              aria-label={`Search articles to add to: ${label}`}
              className={cn(inputClass, "mt-0 h-9 min-w-56 flex-1")}
            />
            <button
              type="button"
              onClick={() => onChange([...slugs, ...fillable.map((a) => a.slug)])}
              disabled={fillable.length === 0}
              title="Adds stories to the empty places now; nothing is added later on its own"
              className={secondaryButtonClass}
            >
              {fillLabel}
            </button>
          </div>
          {q &&
            (results.length > 0 ? (
              <ul className="mt-2 max-h-72 divide-y divide-border overflow-y-auto rounded-lg border border-border bg-surface-elevated">
                {results.map((article) => (
                  <li key={article.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange([...slugs, article.slug]);
                        setQuery("");
                      }}
                      className="flex w-full items-center gap-2.5 p-2 text-left transition-colors hover:bg-primary/5"
                    >
                      <Thumb src={article.image} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-text-primary">{article.title}</span>
                        <span className="block truncate text-[11px] text-text-muted">
                          <ArticleMeta article={article} />
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] font-bold text-primary">+ Add</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[11px] text-text-muted">No published article matches “{query.trim()}”.</p>
            ))}
        </div>
      )}
    </div>
  );
}

function ArticleMeta({ article }: { article: AdminArticle }) {
  return (
    <>
      {article.categoryLabel} · {article.date}
      {article.editorsPick && " · ★ Editor's Pick"}
      {article.trending && " · 🔥 Trending"}
    </>
  );
}

function Thumb({ src }: { src: string | null }) {
  if (!src) return <span aria-hidden="true" className="h-9 w-14 shrink-0 rounded-md bg-primary/10" />;
  // A tiny preview from any image host; next/image would need every host configured.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className="h-9 w-14 shrink-0 rounded-md object-cover" />;
}
