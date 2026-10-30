import { prisma } from "@/lib/prisma";
import { getHomepage } from "@/lib/settings";
import { HomepageManager } from "./HomepageManager";

export const metadata = {
  title: "Homepage — Admin Portal",
};

export default async function AdminHomepagePage() {
  const [{ sections, saved }, articles, categories] = await Promise.all([
    getHomepage(),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        topicSlug: true,
        imageUrl: true,
        publishedAt: true,
        editorsPick: true,
        trending: true,
        trendingRank: true,
      },
    }),
    prisma.topic.findMany({
      orderBy: { label: "asc" },
      select: { slug: true, label: true, icon: true, tone: true },
    }),
  ]);

  const labels = new Map(categories.map((c) => [c.slug, c.label]));
  return (
    <HomepageManager
      initialSections={sections}
      saved={saved}
      categories={categories}
      articles={articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        category: a.topicSlug,
        categoryLabel: labels.get(a.topicSlug) ?? a.topicSlug,
        date: a.publishedAt.toISOString().slice(0, 10),
        image: a.imageUrl,
        editorsPick: a.editorsPick,
        trending: a.trending,
        trendingRank: a.trendingRank,
      }))}
    />
  );
}
