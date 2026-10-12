import { prisma } from "@/lib/prisma";
import { CategoryManager } from "./CategoryManager";

export const metadata = {
  title: "Categories & Topics — Admin Portal",
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.topic.findMany({
    orderBy: { label: "asc" },
    include: {
      _count: {
        select: {
          articles: true,
        },
      },
    },
  });

  return <CategoryManager initialCategories={categories} />;
}
