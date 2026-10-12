import { prisma } from "@/lib/prisma";
import { primaryNavigation, type NavItem } from "@/config/navigation";
import { getTopics } from "./articles";

export const DEFAULT_HEADER_CATEGORY_SLUGS = [
  "ai-automation",
  "software",
  "development",
  "business",
  "startups",
];

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

export async function getHeaderCategorySlugs(): Promise<string[]> {
  try {
    if (!prisma.siteSetting) {
      return DEFAULT_HEADER_CATEGORY_SLUGS;
    }
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "header_categories" },
    });
    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 5);
      }
    }
  } catch (error) {
    console.error("Failed to load header_categories setting:", error);
  }
  return DEFAULT_HEADER_CATEGORY_SLUGS;
}

export async function getHeaderNavigation(): Promise<NavItem[]> {
  try {
    const [slugs, allTopics] = await Promise.all([
      getHeaderCategorySlugs(),
      getTopics(),
    ]);

    const topicMap = new Map(allTopics.map((t) => [t.slug, t]));

    // Build nav items in the exact order specified by slugs (max 5)
    const items: NavItem[] = [];
    for (let i = 0; i < slugs.length && i < 5; i++) {
      const slug = slugs[i];
      const topic = topicMap.get(slug);
      if (topic) {
        items.push({
          label: topic.label,
          href: topic.href || `/category/${topic.slug}`,
          category: topic.slug,
          icon: topic.icon,
          description: topic.description,
          showFrom: i < 3 ? "md" : "lg",
        });
      }
    }

    if (items.length > 0) {
      return items;
    }
  } catch (error) {
    console.error("Failed to build header navigation:", error);
  }
  return primaryNavigation;
}
