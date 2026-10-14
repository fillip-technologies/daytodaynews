import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { topics as staticTopics, type Topic } from "@/data/topics";
import {
  blogArticles as staticBlogArticles,
  editorsPicks as staticEditorsPicks,
  latestArticles as staticLatestArticles,
  trendingArticles as staticTrendingArticles,
} from "@/data/articles";
import type { Article, CategoryTone, CoverPattern, CoverSpec } from "@/types/article";
import type { IconName } from "@/components/ui/Icon";
import { defaultLocale, type Locale } from "@/i18n/config";
import type { Tone } from "@/lib/tones";
import { queryArticles } from "./blog";
import { paginate } from "./pagination";

export const LISTING_PAGE_SIZE = 9;

// Content access layer. Queries MariaDB through Prisma ORM,
// with automatic fallback to static seed data if needed.
//
// Every getter takes the reader's locale. English text lives on the Article and
// Topic rows; other languages come from the translation tables and fall back to
// English where none exists yet. The database is remote, so each round trip is
// costly: translations are loaded once per request and independent queries run
// in parallel.

/** Listings never show the article body, and fetching it is the slowest part of a query. */
const listOmit = { content: true } as const;

type ArticleText = { title: string; description: string | null };

/** Article titles and summaries translated into `locale`, keyed by article id. */
const getArticleTranslations = cache(async (locale: Locale): Promise<Map<string, ArticleText>> => {
  if (locale === defaultLocale) return new Map();
  try {
    const rows = await prisma.articleTranslation.findMany({
      where: { locale },
      select: { articleId: true, title: true, description: true },
    });
    return new Map(rows.map(({ articleId, ...text }) => [articleId, text]));
  } catch (error) {
    console.error(`Failed to load "${locale}" article translations:`, error);
    return new Map();
  }
});

// Memoized per request: the root layout (navigation) and pages both need topics.
export const getTopics = cache(async (locale: Locale = "en"): Promise<Topic[]> => {
  try {
    const [dbTopics, translations] = await Promise.all([
      prisma.topic.findMany({ orderBy: { id: "asc" } }),
      locale === defaultLocale ? [] : prisma.topicTranslation.findMany({ where: { locale } }),
    ]);
    if (dbTopics.length > 0) {
      const byTopic = new Map(translations.map((t) => [t.topicId, t]));
      return dbTopics.map((t) => {
        const translation = byTopic.get(t.id);
        return {
          slug: t.slug,
          label: translation?.label || t.label,
          description: translation?.description || t.description,
          href: t.href,
          icon: t.icon as IconName,
          tone: t.tone as Tone,
        };
      });
    }
  } catch (error) {
    console.error("Failed to load topics from database, using fallback:", error);
  }
  return staticTopics;
});

/** What turning database rows into Articles in `locale` needs (both parts are per-request cached). */
async function getArticleContext(locale: Locale) {
  const [topics, translations] = await Promise.all([getTopics(locale), getArticleTranslations(locale)]);
  return { locale, topicMap: new Map(topics.map((t) => [t.slug, t])), translations };
}

type ArticleContext = Awaited<ReturnType<typeof getArticleContext>>;

function mapDbArticleToArticle(dbArticle: any, { locale, topicMap, translations }: ArticleContext): Article {
  const topic = topicMap.get(dbArticle.topicSlug);
  const translation = translations.get(dbArticle.id);
  let cover: CoverSpec | undefined;

  if (dbArticle.coverPattern && dbArticle.coverTones) {
    try {
      cover = {
        pattern: dbArticle.coverPattern as CoverPattern,
        tones: JSON.parse(dbArticle.coverTones) as [Tone, Tone],
        icon: (dbArticle.coverIcon || "sparkles") as IconName,
      };
    } catch {
      // ignore json parse error
    }
  }

  const dateStr = dbArticle.publishedAt
    ? dbArticle.publishedAt.toISOString().split("T")[0]
    : "2026-11-01";

  return {
    id: dbArticle.id,
    slug: dbArticle.slug,
    featured: dbArticle.featured,
    title: translation?.title || dbArticle.title,
    href: `/articles/${dbArticle.slug}`,
    description: (translation ? translation.description : dbArticle.description) || undefined,
    locale: translation ? locale : "en",
    // Translated articles stay findable by their English wording too.
    searchText: translation ? [dbArticle.title, dbArticle.description].filter(Boolean).join(" ") : undefined,
    category: topic?.label || dbArticle.topicSlug,
    categoryHref: topic?.href || `/category/${dbArticle.topicSlug}`,
    categoryTone: ((topic?.tone === "pink" ? "accent-secondary" : topic?.tone) || "primary") as CategoryTone,
    author: dbArticle.authorName || "Shruti Singh",
    date: dateStr,
    readTime: dbArticle.readTime,
    topic: dbArticle.topicSlug,
    cover,
    image: dbArticle.imageUrl
      ? { src: dbArticle.imageUrl, alt: dbArticle.imageAlt || dbArticle.title }
      : undefined,
  };
}

export async function getHeroArticles(locale: Locale = "en"): Promise<Article[]> {
  try {
    const { getHeroArticleSlugs } = await import("./settings");
    const [slugs, ctx] = await Promise.all([getHeroArticleSlugs(), getArticleContext(locale)]);

    const records = await prisma.article.findMany({
      where: { slug: { in: slugs }, status: "PUBLISHED" },
      omit: listOmit,
    });

    const recordMap = new Map(records.map((r) => [r.slug, r]));
    const orderedArticles: Article[] = [];

    for (const slug of slugs) {
      const record = recordMap.get(slug);
      if (record) {
        orderedArticles.push(mapDbArticleToArticle(record, ctx));
      }
    }

    // Pad with other published articles if fewer than 3 were found
    if (orderedArticles.length < 3) {
      const existingSlugs = orderedArticles
        .map((a) => a.slug)
        .filter((s): s is string => Boolean(s));
      const fillers = await prisma.article.findMany({
        where: {
          slug: { notIn: existingSlugs },
          status: "PUBLISHED",
        },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take: 3 - orderedArticles.length,
        omit: listOmit,
      });
      for (const filler of fillers) {
        orderedArticles.push(mapDbArticleToArticle(filler, ctx));
      }
    }

    if (orderedArticles.length > 0) {
      return orderedArticles.slice(0, 3);
    }
  } catch (error) {
    console.error("Failed to load hero articles from database:", error);
  }

  const { featuredArticles } = await import("@/data/featuredArticles");
  return featuredArticles;
}

export async function getEditorsPicks(limit = 4, locale: Locale = "en"): Promise<Article[]> {
  try {
    const [ctx, records] = await Promise.all([
      getArticleContext(locale),
      prisma.article.findMany({
        where: { editorsPick: true, status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: limit,
        omit: listOmit,
      }),
    ]);
    if (records.length > 0) {
      return records.map((a) => mapDbArticleToArticle(a, ctx));
    }
  } catch (error) {
    console.error("Failed to load editors picks from database:", error);
  }
  return staticEditorsPicks.slice(0, limit);
}

export async function getLatestArticles(limit = 9, locale: Locale = "en"): Promise<Article[]> {
  try {
    const [ctx, records] = await Promise.all([
      getArticleContext(locale),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: limit,
        omit: listOmit,
      }),
    ]);
    if (records.length > 0) {
      return records.map((a) => mapDbArticleToArticle(a, ctx));
    }
  } catch (error) {
    console.error("Failed to load latest articles from database:", error);
  }
  return [...staticLatestArticles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

export async function getTrendingArticles(limit = 5, locale: Locale = "en"): Promise<Article[]> {
  try {
    const [ctx, records] = await Promise.all([
      getArticleContext(locale),
      prisma.article.findMany({
        where: { trending: true, status: "PUBLISHED" },
        orderBy: [{ trendingRank: "asc" }, { publishedAt: "desc" }],
        take: limit,
        omit: listOmit,
      }),
    ]);
    if (records.length > 0) {
      return records.map((a) => mapDbArticleToArticle(a, ctx));
    }
  } catch (error) {
    console.error("Failed to load trending articles from database:", error);
  }
  return staticTrendingArticles.slice(0, limit);
}

/** All blog articles, newest first. */
export async function getBlogArticles(locale: Locale = "en"): Promise<Article[]> {
  try {
    const [ctx, records] = await Promise.all([
      getArticleContext(locale),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        omit: listOmit,
      }),
    ]);
    if (records.length > 0) {
      return records.map((a) => mapDbArticleToArticle(a, ctx));
    }
  } catch (error) {
    console.error("Failed to load blog articles from database:", error);
  }
  return [...staticBlogArticles].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * All published articles without their bodies, newest first. Light enough for
 * the site navigation, which needs every article's title and category.
 */
export const getArticleSummaries = cache(async (locale: Locale = "en"): Promise<Article[]> => {
  try {
    const [ctx, records] = await Promise.all([
      getArticleContext(locale),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          slug: true,
          featured: true,
          title: true,
          description: true,
          readTime: true,
          authorName: true,
          topicSlug: true,
          coverPattern: true,
          coverTones: true,
          coverIcon: true,
          imageUrl: true,
          imageAlt: true,
          publishedAt: true,
        },
      }),
    ]);
    if (records.length > 0) {
      return records.map((a) => mapDbArticleToArticle(a, ctx));
    }
  } catch (error) {
    console.error("Failed to load article summaries from database:", error);
  }
  return [...staticBlogArticles].sort((a, b) => b.date.localeCompare(a.date));
});

/** Lead story plus a paginated list of the rest, for /category/[slug]. */
export async function getCategoryListing(
  topic: string,
  page = 1,
  locale: Locale = "en",
  pageSize = LISTING_PAGE_SIZE,
) {
  try {
    const inTopic = { topicSlug: topic, status: "PUBLISHED" as const };
    const [ctx, count, flagged, newest] = await Promise.all([
      getArticleContext(locale),
      prisma.article.count({ where: inTopic }),
      prisma.article.findFirst({ where: { ...inTopic, featured: true }, orderBy: { publishedAt: "desc" }, omit: listOmit }),
      prisma.article.findFirst({ where: inTopic, orderBy: { publishedAt: "desc" }, omit: listOmit }),
    ]);

    if (count > 0) {
      // 1. Lead/Featured story (prefer featured: true, else newest)
      const featuredDb = flagged ?? newest;
      const featured = featuredDb ? mapDbArticleToArticle(featuredDb, ctx) : null;

      // 2. Latest publish date in this topic
      const latestDate = newest?.publishedAt ? newest.publishedAt.toISOString().split("T")[0] : null;

      // 3. Paginated remaining articles (everything in the topic except the lead)
      const restWhere = featuredDb ? { ...inTopic, id: { not: featuredDb.id } } : inTopic;
      const totalRest = featuredDb ? count - 1 : count;
      const pageCount = Math.max(1, Math.ceil(totalRest / pageSize));
      const safePage = Math.min(Math.max(1, page), pageCount);
      const skip = (safePage - 1) * pageSize;

      const restRecords = await prisma.article.findMany({
        where: restWhere,
        orderBy: { publishedAt: "desc" },
        skip,
        take: pageSize,
        omit: listOmit,
      });

      const items = restRecords.map((a) => mapDbArticleToArticle(a, ctx));

      return {
        featured,
        count,
        latestDate,
        items,
        page: safePage,
        pageCount,
        total: totalRest,
      };
    }
  } catch (error) {
    console.error(`Failed to load category listing for "${topic}" from database:`, error);
  }

  // Fallback to static articles
  const all = (await getBlogArticles(locale)).filter((article) => article.topic === topic);
  const featured = all.find((article) => article.featured) ?? all[0] ?? null;
  const rest = all.filter((article) => article !== featured);
  return { featured, count: all.length, latestDate: all[0]?.date ?? null, ...paginate(rest, page, pageSize) };
}

/** Most-read articles in a topic. */
export async function getPopularInCategory(topic: string, limit = 5, locale: Locale = "en"): Promise<Article[]> {
  try {
    const [ctx, records] = await Promise.all([
      getArticleContext(locale),
      prisma.article.findMany({
        where: { topicSlug: topic, status: "PUBLISHED" },
        orderBy: [
          { trending: "desc" },
          { viewsCount: "desc" },
          { publishedAt: "desc" },
        ],
        take: limit,
        omit: listOmit,
      }),
    ]);

    if (records.length > 0) {
      return records.map((a) => mapDbArticleToArticle(a, ctx));
    }
  } catch (error) {
    console.error(`Failed to load popular articles in topic "${topic}" from database:`, error);
  }

  const trending = await getTrendingArticles(10, locale);
  const trendingRank = new Map(trending.map((article, i) => [article.slug, i]));
  const rank = (slug?: string) => (slug ? trendingRank.get(slug) ?? Number.POSITIVE_INFINITY : Number.POSITIVE_INFINITY);

  return (await getBlogArticles(locale))
    .filter((article) => article.topic === topic)
    .sort((a, b) => rank(a.slug) - rank(b.slug) || b.date.localeCompare(a.date))
    .slice(0, limit);
}

export type SearchParams = {
  query: string;
  category: string | null;
  page?: number;
  pageSize?: number;
  locale?: Locale;
};

/** Case-insensitive search across title, excerpt, category and author. */
export async function searchArticles({
  query,
  category,
  page = 1,
  pageSize = LISTING_PAGE_SIZE,
  locale = "en",
}: SearchParams) {
  const { items } = queryArticles(await getBlogArticles(locale), { query, category, limit: Number.MAX_SAFE_INTEGER });
  return paginate(items, page, pageSize);
}

/**
 * Fetch a single article by slug from the database and increment view counter.
 * Returns drafts too (with their `status`) so staff can preview them; public
 * pages must only show `status === "PUBLISHED"` (see canViewArticle).
 * Title, description, content and category label come in `locale` when a
 * translation exists; `contentLocale` says which language they are in, and
 * `translatedLocales` lists every language the article has.
 *
 * Memoized per request, so the page and its metadata share one lookup and
 * count one view.
 */
export const getArticleBySlug = cache(async (slug: string, locale: Locale = "en") => {
  try {
    const [article, topics] = await Promise.all([
      prisma.article.findUnique({
        where: { slug },
        include: {
          topic: true,
          author: {
            select: {
              id: true,
              name: true,
              bio: true,
              avatar: true,
              role: true,
            },
          },
          translations: true,
          seo: { where: { locale } },
        },
      }),
      getTopics(locale),
    ]);

    if (article) {
      // Asynchronously increment views (staff previews of drafts don't count)
      if (article.status === "PUBLISHED") {
        prisma.article
          .update({
            where: { slug },
            data: { viewsCount: { increment: 1 } },
          })
          .catch(() => {});
      }

      const { translations, topic, seo, ...rest } = article;
      const translation = translations.find((t) => t.locale === locale);
      const topicLabel = topics.find((t) => t.slug === article.topicSlug)?.label || topic.label;
      return {
        ...rest,
        title: translation?.title || article.title,
        description: translation ? translation.description : article.description,
        content: translation ? translation.content : article.content,
        topic: { ...topic, label: topicLabel },
        contentLocale: (translation ? locale : "en") as Locale,
        translatedLocales: ["en", ...translations.map((t) => t.locale)] as Locale[],
        /** Admin SEO overrides for this language, if any. */
        seo: seo[0] ?? null,
      };
    }
  } catch (error) {
    console.error(`Failed to load article "${slug}" from database:`, error);
  }
  return null;
});
