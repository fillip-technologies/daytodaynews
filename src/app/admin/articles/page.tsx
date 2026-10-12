import { prisma } from "@/lib/prisma";
import { ArticlesList } from "./ArticlesList";

export const metadata = {
  title: "Articles CMS — Admin Portal",
};

export default async function AdminArticlesPage() {
  const [articles, topics] = await Promise.all([
    prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        topic: { select: { label: true } },
      },
    }),
    prisma.topic.findMany({
      orderBy: { label: "asc" },
      select: { slug: true, label: true },
    }),
  ]);

  return <ArticlesList initialArticles={articles} topics={topics} />;
}
