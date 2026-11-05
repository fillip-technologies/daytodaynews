import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_HEADER_MENUS,
  HEADER_MENU_SETTING,
  LEGACY_HEADER_SETTING,
  parseHeaderMenus,
  parseLegacyHeaderMenus,
  type HeaderMenu,
} from "@/lib/header-menu";
import { buildStartingHomepage, HOMEPAGE_SETTING, parseHomepage, type HomeSection } from "@/lib/homepage";
import { mergePageValues, pageSettingKey, type PageValues } from "@/lib/page-content";
import { getPageSchema, pageDefaults } from "@/lib/page-defaults";
import { defaultSiteLinks, parseSiteLinks, SITE_LINKS_SETTING, type SiteLinks } from "@/lib/site-links";
import { parseTextOverrides, SITE_TEXT_SETTING, type TextOverrides } from "@/lib/site-text";

/** A stored setting's raw value, or null when it is missing or can't be read. */
async function readSetting(key: string): Promise<string | null> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key } });
    return setting?.value ?? null;
  } catch (error) {
    console.error(`Failed to load the "${key}" setting:`, error);
    return null;
  }
}

/** Interface text changed under Admin → Site Text (memoized per request). */
export const getSiteTextOverrides = cache(async (): Promise<TextOverrides> => {
  const json = await readSetting(SITE_TEXT_SETTING);
  return json ? parseTextOverrides(json) : {};
});

/** The top strip and footer links from Admin → Links & Footer, or the shipped ones. */
export const getSiteLinks = cache(async (): Promise<SiteLinks> => {
  const json = await readSetting(SITE_LINKS_SETTING);
  return (json && parseSiteLinks(json)) || defaultSiteLinks();
});

/** A fixed page's content from Admin → Pages, over its shipped defaults. */
export const getPageContent = cache(async (page: string): Promise<PageValues> => {
  const schema = getPageSchema(page);
  const defaults = pageDefaults[page] ?? {};
  if (!schema) return defaults;
  return mergePageValues(schema, defaults, await readSetting(pageSettingKey(page)));
});

export const DEFAULT_HERO_ARTICLE_SLUGS = [
  "ai-automation-agency-vs-in-house-ai-team--which-model-fits-your-business-",
  "business-processes-to-automate-with-ai-2026",
  "choose-software-development-company-india",
];

export async function getHeroArticleSlugs(): Promise<string[]> {
  try {
    if (!prisma.siteSetting) {
      return DEFAULT_HERO_ARTICLE_SLUGS;
    }
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "hero_articles" },
    });
    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 3);
      }
    }
  } catch (error) {
    console.error("Failed to load hero_articles setting:", error);
  }
  return DEFAULT_HERO_ARTICLE_SLUGS;
}

/**
 * The header menus from Admin → Mega Menu. Until menus are saved there, the
 * older one-category-per-menu setting is used, then the editorial-plan defaults.
 */
export async function getHeaderMenus(): Promise<HeaderMenu[]> {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: [HEADER_MENU_SETTING, LEGACY_HEADER_SETTING] } },
    });
    const stored = (key: string) => settings.find((setting) => setting.key === key)?.value;
    const menus = stored(HEADER_MENU_SETTING);
    const legacy = stored(LEGACY_HEADER_SETTING);
    const parsed = (menus && parseHeaderMenus(menus)) || (legacy && parseLegacyHeaderMenus(legacy));
    if (parsed) return parsed;
  } catch (error) {
    console.error("Failed to load the header menu setting:", error);
  }
  return DEFAULT_HEADER_MENUS;
}

/**
 * The homepage layout from Admin → Homepage. Until one is saved, the starting
 * layout (built from what the old homepage showed) stands in; `saved` says which.
 */
export async function getHomepage(): Promise<{ sections: HomeSection[]; saved: boolean }> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: HOMEPAGE_SETTING } });
    const stored = setting && parseHomepage(setting.value);
    if (stored) return { sections: stored, saved: true };
    return { sections: await getStartingHomepage(), saved: false };
  } catch (error) {
    console.error("Failed to load the homepage layout:", error);
    return { sections: [], saved: false };
  }
}

async function getStartingHomepage(): Promise<HomeSection[]> {
  const [articles, heroSlugs, menus, topics] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, topicSlug: true, editorsPick: true, trending: true, trendingRank: true },
    }),
    getHeroArticleSlugs(),
    getHeaderMenus(),
    prisma.topic.findMany({ orderBy: { label: "asc" }, select: { slug: true } }),
  ]);
  const unranked = Number.MAX_SAFE_INTEGER;
  return buildStartingHomepage({
    articles: articles.map((a) => ({ slug: a.slug, topic: a.topicSlug })),
    heroSlugs,
    editorsPickSlugs: articles.filter((a) => a.editorsPick).map((a) => a.slug),
    trendingSlugs: articles
      .filter((a) => a.trending)
      .sort((a, b) => (a.trendingRank ?? unranked) - (b.trendingRank ?? unranked))
      .map((a) => a.slug),
    categoryOrder: [...new Set([...menus.flatMap((menu) => menu.categories), ...topics.map((t) => t.slug)])],
  });
}
