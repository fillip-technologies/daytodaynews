import { prisma } from "@/lib/prisma";
import { getHeaderCategorySlugs, getHeroArticleSlugs } from "@/lib/settings";
import { SiteSettingsManager } from "./SiteSettingsManager";

export const metadata = {
  title: "Site Configuration — Admin Portal",
};

export default async function AdminSettingsPage() {
  const [topics, selectedSlugs, heroSlugs, publishedArticles] = await Promise.all([
    prisma.topic.findMany({
      orderBy: { label: "asc" },
      select: {
        id: true,
        slug: true,
        label: true,
        description: true,
        icon: true,
        tone: true,
        _count: { select: { articles: true } },
      },
    }),
    getHeaderCategorySlugs(),
    getHeroArticleSlugs(),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        imageUrl: true,
        imageAlt: true,
        topicSlug: true,
        authorName: true,
        publishedAt: true,
      },
    }),
  ]);

  return (
    <SiteSettingsManager
      topics={topics}
      initialSelectedSlugs={selectedSlugs}
      articles={publishedArticles}
      initialHeroSlugs={heroSlugs}
    />
  );
}
