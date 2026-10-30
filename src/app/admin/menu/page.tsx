import { getTopic } from "@/data/topics";
import { getArticleSummaries } from "@/lib/articles";
import { queryArticles } from "@/lib/blog";
import { toMenuTopicInput } from "@/lib/menu-topics";
import { prisma } from "@/lib/prisma";
import { getHeaderMenus } from "@/lib/settings";
import { MenuManager } from "./MenuManager";

export const metadata = {
  title: "Mega Menu — Admin Portal",
};

export default async function AdminMenuPage() {
  const [categories, menus, articles] = await Promise.all([
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
    getHeaderMenus(),
    getArticleSummaries("en"),
  ]);

  // Deleted categories drop out of their menus, and menus left empty drop out.
  const known = new Set(categories.map((c) => c.slug));
  const initialMenus = menus.flatMap((menu) => {
    const slugs = menu.categories.filter((slug) => known.has(slug));
    return slugs.length > 0 ? [{ ...menu, categories: slugs }] : [];
  });

  return (
    <MenuManager
      initialMenus={initialMenus}
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
