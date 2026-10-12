import { prisma } from "@/lib/prisma";
import { getHeaderCategorySlugs } from "@/lib/settings";
import { SiteSettingsManager } from "./SiteSettingsManager";

export const metadata = {
  title: "Site Configuration — Admin Portal",
};

export default async function AdminSettingsPage() {
  const [topics, selectedSlugs] = await Promise.all([
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
  ]);

  return <SiteSettingsManager topics={topics} initialSelectedSlugs={selectedSlugs} />;
}
