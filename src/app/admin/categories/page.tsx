import { prisma } from "@/lib/prisma";
import { getSiteSeo } from "@/lib/seo/site";
import { CategoryManager } from "./CategoryManager";

export const metadata = {
  title: "Categories & Topics — Admin Portal",
};

export default async function AdminCategoriesPage() {
  const [categories, site] = await Promise.all([
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
          select: { label: true, description: true },
        },
        seo: true,
      },
    }),
    getSiteSeo(),
  ]);

  return (
    <CategoryManager
      initialCategories={categories}
      seoContext={{ siteUrl: site.siteUrl, titleTemplate: site.titleTemplate }}
    />
  );
}
