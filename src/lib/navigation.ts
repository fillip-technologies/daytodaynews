import { cache } from "react";
import type { NavItem, NavLink, NavStory } from "@/config/navigation";
import { getTopic } from "@/data/topics";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import type { Article } from "@/types/article";
import { getArticleSummaries, getTopics } from "./articles";
import { queryArticles } from "./blog";
import { searchUrl } from "./search";
import { getHeaderNavigation } from "./settings";

const MAX_MENU_STORIES = 3;

type MenuTopicRow = {
  labelEn: string;
  labelHi: string | null;
  query: string | null;
  href: string | null;
  alwaysShow: boolean;
};

export type SiteNavigation = {
  /** Categories in the header bar, in the order chosen in admin settings. */
  header: NavItem[];
  /** Every category, for the menu drawer and footer. */
  sections: NavItem[];
};

/** Mega-menu topics from Admin → Mega Menu, by category slug, in display order. */
const getMenuTopics = cache(async (): Promise<Map<string, MenuTopicRow[]>> => {
  try {
    const rows = await prisma.menuTopic.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        labelEn: true,
        labelHi: true,
        query: true,
        href: true,
        alwaysShow: true,
        topic: { select: { slug: true } },
      },
    });
    const bySlug = new Map<string, MenuTopicRow[]>();
    for (const { topic, ...row } of rows) {
      bySlug.set(topic.slug, [...(bySlug.get(topic.slug) ?? []), row]);
    }
    return bySlug;
  } catch (error) {
    console.error("Failed to load mega-menu topics:", error);
    return new Map();
  }
});

/** Header and drawer navigation in `locale`, each category carrying its mega-menu content. */
export async function getSiteNavigation(locale: Locale = "en"): Promise<SiteNavigation> {
  const [header, topics, articles, menuTopics] = await Promise.all([
    getHeaderNavigation(locale),
    getTopics(locale),
    getArticleSummaries(locale),
    getMenuTopics(),
  ]);

  const withMenu = (item: NavItem): NavItem =>
    item.category
      ? { ...item, ...menuContent(item.category, articles, locale, menuTopics.get(item.category) ?? []) }
      : item;

  return {
    header: header.map(withMenu),
    sections: topics.map((topic) =>
      withMenu({
        label: topic.label,
        href: topic.href || `/category/${topic.slug}`,
        category: topic.slug,
        icon: topic.icon,
        description: topic.description,
      }),
    ),
  };
}

function menuContent(slug: string, articles: Article[], locale: Locale, menuTopics: MenuTopicRow[]) {
  // /search ignores categories it doesn't know, so match exactly as it will.
  const category = getTopic(slug) ? slug : null;

  // Keyword topics stay hidden until an article matches (so the menu never
  // leads to an empty page), unless the admin chose "always show". Direct
  // links always show.
  const topics: NavLink[] = menuTopics
    .filter(
      (t) =>
        t.href ||
        t.alwaysShow ||
        (t.query && queryArticles(articles, { query: t.query, category, limit: 1 }).total > 0),
    )
    .map((t) => ({
      label: (locale === "hi" && t.labelHi) || t.labelEn,
      href: t.href || searchUrl({ query: t.query ?? "", category }),
    }));

  const inCategory = articles.filter((article) => article.topic === slug);
  // Featured first; the sort is stable, so each group stays newest first.
  const stories: NavStory[] = [...inCategory]
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, MAX_MENU_STORIES)
    .map(({ title, href, date, readTime, image, cover, locale: storyLocale }) => ({
      title,
      href,
      date,
      readTime,
      image,
      cover,
      locale: storyLocale,
    }));

  return { topics, stories, articleCount: inCategory.length };
}
