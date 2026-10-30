import { cleanLine } from "@/lib/validation";

// The homepage layout, as edited under Admin → Homepage. Every section and
// every story on it is chosen there; the page never fills itself in. Pure
// module: shared by the admin editor, the server action and the public page.

/** SiteSetting key holding the layout as JSON. */
export const HOMEPAGE_SETTING = "homepage";

export type HomeText = { en: string; hi: string };

export type HomeSectionType = "ticker" | "top" | "topics" | "category" | "editorsPicks" | "latest" | "newsletter";

export type HomeSection = {
  /** Stable key, unique on the page. */
  id: string;
  type: HomeSectionType;
  enabled: boolean;
  /** Empty uses the default title (a category block: the category's name). */
  title: HomeText;
  description: HomeText;
  /** Article slugs in display order. In "top" the first is the lead story. */
  articles: string[];
  /** Second list: the headlines beside the top stories, or the trending sidebar. */
  sideArticles: string[];
  sideTitle: HomeText;
  /** The category of a category block, or the categories in the topics strip. */
  categories: string[];
};

type SectionRules = {
  /** Name in the admin. */
  label: string;
  /** What the section shows, for the admin. */
  hint: string;
  /** Most articles in the main list (0: the section has none). */
  articles: number;
  /** Most articles in the second list (0: none). */
  side: number;
  /** Most categories (0: none). */
  categories: number;
  /** Category blocks can be added more than once; other sections exist once. */
  repeatable: boolean;
  hasDescription: boolean;
};

export const SECTION_RULES: Record<HomeSectionType, SectionRules> = {
  ticker: {
    label: "Breaking news ticker",
    hint: "A strip of scrolling headlines just below the menu.",
    articles: 10,
    side: 0,
    categories: 0,
    repeatable: false,
    hasDescription: false,
  },
  top: {
    label: "Top stories",
    hint: "The lead story (first in the list) with up to 4 more beside it, and a headlines list on the right.",
    articles: 5,
    side: 10,
    categories: 0,
    repeatable: false,
    hasDescription: false,
  },
  topics: {
    label: "Topics strip",
    hint: "A row of category links.",
    articles: 0,
    side: 0,
    categories: 16,
    repeatable: false,
    hasDescription: false,
  },
  category: {
    label: "Category block",
    hint: "One big story and up to 4 smaller ones, with a link to the category page.",
    articles: 5,
    side: 0,
    categories: 1,
    repeatable: true,
    hasDescription: false,
  },
  editorsPicks: {
    label: "Editors' Picks",
    hint: "A row of hand-picked stories.",
    articles: 8,
    side: 0,
    categories: 0,
    repeatable: false,
    hasDescription: true,
  },
  latest: {
    label: "Latest news + Trending",
    hint: "A grid of stories with a numbered Trending list beside it.",
    articles: 12,
    side: 8,
    categories: 0,
    repeatable: false,
    hasDescription: false,
  },
  newsletter: {
    label: "Newsletter sign-up",
    hint: "The email sign-up box.",
    articles: 0,
    side: 0,
    categories: 0,
    repeatable: false,
    hasDescription: true,
  },
};

export const MAX_CATEGORY_BLOCKS = 16;
const SECTION_TYPES = Object.keys(SECTION_RULES) as HomeSectionType[];
const SINGLE_TYPES = SECTION_TYPES.filter((type) => !SECTION_RULES[type].repeatable);

const emptyText = (): HomeText => ({ en: "", hi: "" });

/** A new, empty section of `type`. */
export function newSection(type: HomeSectionType, id: string, categories: string[] = []): HomeSection {
  return {
    id,
    type,
    enabled: true,
    title: emptyText(),
    description: emptyText(),
    articles: [],
    sideArticles: [],
    sideTitle: emptyText(),
    categories,
  };
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const asRecord = (value: unknown) => (value && typeof value === "object" ? value : {}) as Record<string, unknown>;

const cleanText = (value: unknown, max: number): HomeText => {
  const raw = asRecord(value);
  return { en: cleanLine(raw.en, max), hi: cleanLine(raw.hi, max) };
};

/** Known, unique strings from `value`, at most `max`. */
const cleanList = (value: unknown, known: ReadonlySet<string>, max: number) =>
  [...new Set(Array.isArray(value) ? value : [])]
    .filter((item): item is string => typeof item === "string" && known.has(item))
    .slice(0, max);

/**
 * Validates a full layout. Stories that are no longer published are dropped
 * (they can't be shown); a category block needs a category that exists.
 */
export function cleanHomepage(
  input: unknown,
  articleSlugs: ReadonlySet<string>,
  categorySlugs: ReadonlySet<string>,
): Result<HomeSection[]> {
  if (!Array.isArray(input)) return { ok: false, error: "Invalid homepage layout." };

  const sections: HomeSection[] = [];
  const ids = new Set<string>();
  for (const [index, item] of input.entries()) {
    const raw = asRecord(item);
    const type = raw.type as HomeSectionType;
    const rules = SECTION_RULES[type];
    if (!rules) return { ok: false, error: `Section ${index + 1}: unknown section type.` };
    if (!rules.repeatable && sections.some((s) => s.type === type)) {
      return { ok: false, error: `"${rules.label}" can appear only once.` };
    }

    let id = typeof raw.id === "string" ? raw.id.replace(/[^a-z0-9-]/gi, "").slice(0, 40) : "";
    if (!id || ids.has(id)) id = `${type}-${index + 1}`;
    ids.add(id);

    const categories = cleanList(raw.categories, categorySlugs, rules.categories);
    if (type === "category" && categories.length === 0) {
      return { ok: false, error: `Section ${index + 1} (category block): pick a category.` };
    }

    sections.push({
      id,
      type,
      enabled: raw.enabled !== false,
      title: cleanText(raw.title, 120),
      description: rules.hasDescription ? cleanText(raw.description, 300) : emptyText(),
      articles: cleanList(raw.articles, articleSlugs, rules.articles),
      sideArticles: cleanList(raw.sideArticles, articleSlugs, rules.side),
      sideTitle: rules.side > 0 ? cleanText(raw.sideTitle, 120) : emptyText(),
      categories,
    });
  }

  if (sections.filter((s) => s.type === "category").length > MAX_CATEGORY_BLOCKS) {
    return { ok: false, error: `The homepage can have at most ${MAX_CATEGORY_BLOCKS} category blocks.` };
  }
  return { ok: true, value: withAllSections(sections) };
}

/** Adds any single-use section missing from `sections`, switched off, at the end. */
export function withAllSections(sections: HomeSection[]): HomeSection[] {
  const missing = SINGLE_TYPES.filter((type) => !sections.some((s) => s.type === type));
  return [...sections, ...missing.map((type) => ({ ...newSection(type, type), enabled: false }))];
}

/** Reads the stored layout, or null when there is none or it can't be read. */
export function parseHomepage(json: string): HomeSection[] | null {
  try {
    const value: unknown = JSON.parse(json);
    if (!Array.isArray(value)) return null;
    const sections = value.flatMap((item): HomeSection[] => {
      const raw = asRecord(item);
      const type = raw.type as HomeSectionType;
      if (!SECTION_RULES[type] || typeof raw.id !== "string") return [];
      const text = (v: unknown): HomeText => {
        const t = asRecord(v);
        return { en: typeof t.en === "string" ? t.en : "", hi: typeof t.hi === "string" ? t.hi : "" };
      };
      const list = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);
      return [
        {
          id: raw.id,
          type,
          enabled: raw.enabled !== false,
          title: text(raw.title),
          description: text(raw.description),
          articles: list(raw.articles),
          sideArticles: list(raw.sideArticles),
          sideTitle: text(raw.sideTitle),
          categories: list(raw.categories),
        },
      ];
    });
    return sections.length > 0 ? withAllSections(sections) : null;
  } catch {
    return null;
  }
}

/** What the starting layout is built from. */
export type HomepageSeed = {
  /** Published articles, newest first, with their category. */
  articles: Array<{ slug: string; topic: string }>;
  /** The stories the old hero showed. */
  heroSlugs: string[];
  /** Articles flagged Editor's Pick, newest first. */
  editorsPickSlugs: string[];
  /** Articles flagged Trending, in rank order. */
  trendingSlugs: string[];
  /** Categories in menu order, then the rest. */
  categoryOrder: string[];
};

/**
 * The starting layout: what the homepage showed before, laid out as a news
 * front page. Used until the layout is first saved in admin.
 */
export function buildStartingHomepage(seed: HomepageSeed): HomeSection[] {
  const newest = seed.articles.map((a) => a.slug);
  const published = new Set(newest);
  const take = (preferred: string[], max: number, exclude: string[] = []) =>
    [...new Set([...preferred.filter((s) => published.has(s)), ...newest])]
      .filter((slug) => !exclude.includes(slug))
      .slice(0, max);

  const top = take(seed.heroSlugs, 5);
  const withArticles = seed.categoryOrder.filter((slug) => seed.articles.some((a) => a.topic === slug));

  const section = (type: HomeSectionType, patch: Partial<HomeSection> = {}): HomeSection => ({
    ...newSection(type, type),
    ...patch,
  });
  const categoryBlocks = withArticles.map((slug) =>
    section("category", {
      id: `category-${slug}`,
      categories: [slug],
      articles: seed.articles.filter((a) => a.topic === slug).map((a) => a.slug).slice(0, 5),
    }),
  );

  return [
    section("ticker", { articles: newest.slice(0, 6) }),
    section("top", { articles: top, sideArticles: take([], 8, top) }),
    section("topics", { categories: seed.categoryOrder.slice(0, 12) }),
    ...categoryBlocks.slice(0, 2),
    section("editorsPicks", { articles: take(seed.editorsPickSlugs, 4) }),
    ...categoryBlocks.slice(2),
    section("latest", { articles: newest.slice(0, 9), sideArticles: take(seed.trendingSlugs, 5) }),
    section("newsletter"),
  ];
}
