import { getTopic } from "@/data/topics";
import { getArticleSummaries } from "@/lib/articles";
import { queryArticles } from "@/lib/blog";
import { toMenuTopicInput } from "@/lib/menu-topics";
import { prisma } from "@/lib/prisma";
import { getHeaderCategorySlugs } from "@/lib/settings";
import { MenuManager } from "./MenuManager";

export const metadata = {
  title: "Mega Menu — Admin Portal",
};

export default async function AdminMenuPage() {
  const [categories, headerSlugs, articles] = await Promise.all([
    prisma.topic.findMany({
      orderBy: { label: "asc" },
      select: {
        id: true,
        slug: true,
        label: true,
        icon: true,
        tone: true,
        _count: { select: { articles: true } },
        translations: { where: { locale: "hi" }, select: { label: true } },
        menuTopics: {
          orderBy: { sortOrder: "asc" },
          select: { labelEn: true, labelHi: true, query: true, href: true, alwaysShow: true },
        },
      },
    }),
    getHeaderCategorySlugs(),
    getArticleSummaries("en"),
  ]);

  return (
    <MenuManager
      initialHeaderSlugs={headerSlugs.filter((slug) => categories.some((c) => c.slug === slug))}
      categories={categories.map((category) => {
        // Count matches exactly as the public menu does (lib/navigation).
        const scope = getTopic(category.slug) ? category.slug : null;
        const matches: Record<string, number> = {};
        for (const { query } of category.menuTopics) {
          if (query && !(query in matches)) {
            matches[query] = queryArticles(articles, { query, category: scope, limit: 0 }).total;
          }
        }
        return {
          id: category.id,
          slug: category.slug,
          label: category.label,
          labelHi: category.translations[0]?.label ?? null,
          icon: category.icon,
          tone: category.tone,
          articleCount: category._count.articles,
          topics: category.menuTopics.map(toMenuTopicInput),
          matches,
        };
      })}
    />
  );
}
