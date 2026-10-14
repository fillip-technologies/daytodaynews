import { prisma } from "@/lib/prisma";
import { getSiteSeo } from "@/lib/seo/site";
import { ArticleForm } from "../ArticleForm";

export const metadata = {
  title: "Write New Article — Admin Portal",
};

export default async function NewArticlePage() {
  const [topics, authors, site] = await Promise.all([
    prisma.topic.findMany({
      orderBy: { label: "asc" },
      select: { slug: true, label: true },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getSiteSeo(),
  ]);

  return (
    <ArticleForm
      topics={topics.map((t) => ({ value: t.slug, label: t.label }))}
      authors={authors.map((a) => ({ value: a.id, label: a.name }))}
      seoContext={{ siteUrl: site.siteUrl, titleTemplate: site.titleTemplate }}
    />
  );
}
