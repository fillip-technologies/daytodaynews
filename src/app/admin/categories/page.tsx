import { prisma } from "@/lib/prisma";
import { getSiteSeo } from "@/lib/seo/site";
import { CategoryManager } from "./CategoryManager";

export const metadata = {
  title: "Categories & Topics — Admin Portal",
};

export default async function AdminCategoriesPage() {
  const [categories, site, pillars] = await Promise.all([
    prisma.topic.findMany({
      orderBy: { label: "asc" },
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
        translations: {
          where: { locale: "hi" },
          select: { label: true, description: true, intro: true, ctaTitle: true, ctaText: true, ctaLabel: true },
        },
        seo: true,
      },
    }),
    getSiteSeo(),
    prisma.article
      .findMany({ where: { isPillar: true }, orderBy: { title: "asc" }, select: { slug: true, title: true } })
      .catch(() => []),
  ]);

  return (
    <CategoryManager
      initialCategories={categories}
      pillars={pillars.map((p) => ({ value: p.slug, label: p.title }))}
      seoContext={{ siteUrl: site.siteUrl, titleTemplate: site.titleTemplate }}
    />
  );
}
