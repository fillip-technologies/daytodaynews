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
import type { Tone } from "@/lib/tones";
import { queryArticles } from "./blog";
import { paginate } from "./pagination";

export const LISTING_PAGE_SIZE = 9;

// Content access layer. Queries MariaDB through Prisma ORM,
// with automatic fallback to static seed data if needed.

export async function getTopics(): Promise<Topic[]> {
  try {
    const dbTopics = await prisma.topic.findMany({
      orderBy: { id: "asc" },
    });
    if (dbTopics.length > 0) {
      return dbTopics.map((t) => ({
        slug: t.slug,
        label: t.label,
        description: t.description,
        href: t.href,
        icon: t.icon as IconName,
        tone: t.tone as Tone,
      }));
    }
  } catch (error) {
    console.error("Failed to load topics from database, using fallback:", error);
  }
  return staticTopics;
}

function mapDbArticleToArticle(dbArticle: any, topicMap: Map<string, Topic>): Article {
  const topic = topicMap.get(dbArticle.topicSlug);
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
    title: dbArticle.title,
    href: `/articles/${dbArticle.slug}`,
    description: dbArticle.description || undefined,
    category: topic?.label || dbArticle.topicSlug,
    categoryHref: topic?.href || `/category/${dbArticle.topicSlug}`,
    categoryTone: ((topic?.tone === "pink" ? "accent-secondary" : topic?.tone) || "primary") as CategoryTone,
    author: dbArticle.authorName || dbArticle.author?.name || "Shruti Singh",
    date: dateStr,
    readTime: dbArticle.readTime,
    topic: dbArticle.topicSlug,
    cover,
    image: dbArticle.imageUrl
      ? { src: dbArticle.imageUrl, alt: dbArticle.imageAlt || dbArticle.title }
      : undefined,
  };
}

async function getTopicMap(): Promise<Map<string, Topic>> {
  const allTopics = await getTopics();
  return new Map(allTopics.map((t) => [t.slug, t]));
}

export async function getHeroArticles(): Promise<Article[]> {
  try {
    const { getHeroArticleSlugs } = await import("./settings");
    const slugs = await getHeroArticleSlugs();
    const topicMap = await getTopicMap();

    const records = await prisma.article.findMany({
      where: { slug: { in: slugs }, status: "PUBLISHED" },
      include: { author: true },
    });

    const recordMap = new Map(records.map((r) => [r.slug, r]));
    const orderedArticles: Article[] = [];

    for (const slug of slugs) {
      const record = recordMap.get(slug);
      if (record) {
        orderedArticles.push(mapDbArticleToArticle(record, topicMap));
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
        include: { author: true },
      });
      for (const filler of fillers) {
        orderedArticles.push(mapDbArticleToArticle(filler, topicMap));
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

export async function getEditorsPicks(limit = 4): Promise<Article[]> {
  try {
    const topicMap = await getTopicMap();
    const records = await prisma.article.findMany({
      where: { editorsPick: true, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: { author: true },
    });
    if (records.length > 0) {
      return records.map((a) => mapDbArticleToArticle(a, topicMap));
    }
  } catch (error) {
    console.error("Failed to load editors picks from database:", error);
  }
  return staticEditorsPicks.slice(0, limit);
}

export async function getLatestArticles(limit = 9): Promise<Article[]> {
  try {
    const topicMap = await getTopicMap();
    const records = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: { author: true },
    });
    if (records.length > 0) {
      return records.map((a) => mapDbArticleToArticle(a, topicMap));
    }
  } catch (error) {
    console.error("Failed to load latest articles from database:", error);
  }
  return [...staticLatestArticles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

export async function getTrendingArticles(limit = 5): Promise<Article[]> {
  try {
    const topicMap = await getTopicMap();
    const records = await prisma.article.findMany({
      where: { trending: true, status: "PUBLISHED" },
      orderBy: [{ trendingRank: "asc" }, { publishedAt: "desc" }],
      take: limit,
      include: { author: true },
    });
    if (records.length > 0) {
      return records.map((a) => mapDbArticleToArticle(a, topicMap));
    }
  } catch (error) {
    console.error("Failed to load trending articles from database:", error);
  }
  return staticTrendingArticles.slice(0, limit);
}

/** All blog articles, newest first. */
export async function getBlogArticles(): Promise<Article[]> {
  try {
    const topicMap = await getTopicMap();
    const records = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { author: true },
    });
    if (records.length > 0) {
      return records.map((a) => mapDbArticleToArticle(a, topicMap));
    }
  } catch (error) {
    console.error("Failed to load blog articles from database:", error);
  }
  return [...staticBlogArticles].sort((a, b) => b.date.localeCompare(a.date));
}

/** Lead story plus a paginated list of the rest, for /category/[slug]. */
export async function getCategoryListing(topic: string, page = 1, pageSize = LISTING_PAGE_SIZE) {
  try {
    const topicMap = await getTopicMap();
    const count = await prisma.article.count({
      where: { topicSlug: topic, status: "PUBLISHED" },
    });

    if (count > 0) {
      // 1. Lead/Featured story (prefer featured: true, else newest)
      let featuredDb = await prisma.article.findFirst({
        where: { topicSlug: topic, status: "PUBLISHED", featured: true },
        include: { author: true },
        orderBy: { publishedAt: "desc" },
      });

      if (!featuredDb) {
        featuredDb = await prisma.article.findFirst({
          where: { topicSlug: topic, status: "PUBLISHED" },
          include: { author: true },
          orderBy: { publishedAt: "desc" },
        });
      }

      const featured = featuredDb ? mapDbArticleToArticle(featuredDb, topicMap) : null;

      // 2. Latest publish date in this topic
      const newest = await prisma.article.findFirst({
        where: { topicSlug: topic, status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: { publishedAt: true },
      });
      const latestDate = newest?.publishedAt
        ? newest.publishedAt.toISOString().split("T")[0]
        : null;

      // 3. Paginated remaining articles
      const restWhere = featuredDb
        ? { topicSlug: topic, status: "PUBLISHED" as const, id: { not: featuredDb.id } }
        : { topicSlug: topic, status: "PUBLISHED" as const };

      const totalRest = await prisma.article.count({ where: restWhere });
      const pageCount = Math.max(1, Math.ceil(totalRest / pageSize));
      const safePage = Math.min(Math.max(1, page), pageCount);
      const skip = (safePage - 1) * pageSize;

      const restRecords = await prisma.article.findMany({
        where: restWhere,
        orderBy: { publishedAt: "desc" },
        skip,
        take: pageSize,
        include: { author: true },
      });

      const items = restRecords.map((a) => mapDbArticleToArticle(a, topicMap));

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
  const all = (await getBlogArticles()).filter((article) => article.topic === topic);
  const featured = all.find((article) => article.featured) ?? all[0] ?? null;
  const rest = all.filter((article) => article !== featured);
  return { featured, count: all.length, latestDate: all[0]?.date ?? null, ...paginate(rest, page, pageSize) };
}

/** Most-read articles in a topic. */
export async function getPopularInCategory(topic: string, limit = 5): Promise<Article[]> {
  try {
    const topicMap = await getTopicMap();
    const records = await prisma.article.findMany({
      where: { topicSlug: topic, status: "PUBLISHED" },
      orderBy: [
        { trending: "desc" },
        { viewsCount: "desc" },
        { publishedAt: "desc" },
      ],
      take: limit,
      include: { author: true },
    });

    if (records.length > 0) {
      return records.map((a) => mapDbArticleToArticle(a, topicMap));
    }
  } catch (error) {
    console.error(`Failed to load popular articles in topic "${topic}" from database:`, error);
  }

  const trending = await getTrendingArticles(10);
  const trendingRank = new Map(trending.map((article, i) => [article.slug, i]));
  const rank = (slug?: string) => (slug ? trendingRank.get(slug) ?? Number.POSITIVE_INFINITY : Number.POSITIVE_INFINITY);

  return (await getBlogArticles())
    .filter((article) => article.topic === topic)
    .sort((a, b) => rank(a.slug) - rank(b.slug) || b.date.localeCompare(a.date))
    .slice(0, limit);
}

export type SearchParams = { query: string; category: string | null; page?: number; pageSize?: number };

/** Case-insensitive search across title, excerpt, category and author. */
export async function searchArticles({ query, category, page = 1, pageSize = LISTING_PAGE_SIZE }: SearchParams) {
  const { items } = queryArticles(await getBlogArticles(), { query, category, limit: Number.MAX_SAFE_INTEGER });
  return paginate(items, page, pageSize);
}

/** Fetch a single article by slug from the database and increment view counter. */
export async function getArticleBySlug(slug: string) {
  try {
    const article = await prisma.article.findUnique({
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
      },
    });

    if (article) {
      // Asynchronously increment views
      prisma.article
        .update({
          where: { slug },
          data: { viewsCount: { increment: 1 } },
        })
        .catch(() => {});
      return article;
    }
  } catch (error) {
    console.error(`Failed to load article "${slug}" from database:`, error);
  }
  return null;
}
