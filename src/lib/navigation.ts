import { cache } from "react";
import { primaryNavigation, type NavGroup, type NavItem, type NavLink, type NavStory } from "@/config/navigation";
import { getTopic } from "@/data/topics";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import type { Article } from "@/types/article";
import { getArticleSummaries, getTopics } from "./articles";
import { queryArticles } from "./blog";
import { searchUrl } from "./search";
import { getHeaderMenus } from "./settings";

const MAX_MENU_STORIES = 3;

type MenuTopicRow = {
  labelEn: string;
  labelHi: string | null;
  query: string | null;
  href: string | null;
  alwaysShow: boolean;
};

export type SiteNavigation = {
  /** Menus in the header bar, in the order chosen in Admin → Mega Menu. */
  header: NavItem[];
  /** Every category, for the footer. */
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

/** Header menus and categories in `locale`, each menu carrying its mega-menu content. */
export async function getSiteNavigation(locale: Locale = "en"): Promise<SiteNavigation> {
  const [menus, topics, articles, menuTopics] = await Promise.all([
    getHeaderMenus(),
    getTopics(locale),
    getArticleSummaries(locale),
    getMenuTopics(),
  ]);

  const sections: NavItem[] = topics.map((topic) => ({
    label: topic.label,
    href: topic.href || `/category/${topic.slug}`,
    category: topic.slug,
    icon: topic.icon,
    description: topic.description,
  }));
  const bySlug = new Map(sections.map((section) => [section.category, section]));

  // Menus whose categories have all been deleted are left out.
  const header = menus.flatMap((menu): NavItem[] => {
    const groups = menu.categories.flatMap((slug): NavGroup[] => {
      const section = bySlug.get(slug);
      return section
        ? [{ ...section, category: slug, ...groupContent(slug, articles, locale, menuTopics.get(slug) ?? []) }]
        : [];
    });
    const [first] = groups;
    if (!first) return [];
    const custom = locale === "hi" ? menu.labelHi : menu.labelEn;
    return [
      {
        label: custom || first.label,
        href: first.href,
        category: first.category,
        icon: first.icon,
        // One category's line would misdescribe a menu that spans several.
        description: groups.length === 1 ? first.description : undefined,
        groups,
        stories: topStories(articles, menu.categories),
        articleCount: groups.reduce((sum, group) => sum + group.articleCount, 0),
      },
    ];
  });

  return { header: header.length > 0 ? header : primaryNavigation, sections };
}

function groupContent(slug: string, articles: Article[], locale: Locale, menuTopics: MenuTopicRow[]) {
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

  return { topics, articleCount: articles.filter((article) => article.topic === slug).length };
}

/** The menu's newest articles across its categories, featured ones first. */
function topStories(articles: Article[], categories: string[]): NavStory[] {
  // Featured first; the sort is stable, so each group stays newest first.
  return articles
    .filter((article) => article.topic && categories.includes(article.topic))
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
}
