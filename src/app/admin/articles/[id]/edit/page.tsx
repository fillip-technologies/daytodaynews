import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSeo } from "@/lib/seo/site";
import { toSeoFields } from "@/lib/seo/validate";
import { ArticleForm } from "../../ArticleForm";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "Edit Article — Admin Portal",
};

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;

  const [article, topics, authors, site] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: { translations: { where: { locale: "hi" } }, seo: true },
    }),
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

  if (!article) {
    notFound();
  }

  return (
    <ArticleForm
      initialData={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        topicSlug: article.topicSlug,
        authorId: article.authorId,
        description: article.description,
        content: article.content,
        readTime: article.readTime,
        featured: article.featured,
        editorsPick: article.editorsPick,
        trending: article.trending,
        status: article.status,
        coverPattern: article.coverPattern,
        coverTones: article.coverTones,
        coverIcon: article.coverIcon,
        imageUrl: article.imageUrl,
        imageAlt: article.imageAlt,
        hi: article.translations[0] ?? null,
        seo: {
          en: toSeoFields(article.seo.find((s) => s.locale === "en")),
          hi: toSeoFields(article.seo.find((s) => s.locale === "hi")),
        },
      }}
      topics={topics.map((t) => ({ value: t.slug, label: t.label }))}
      authors={authors.map((a) => ({ value: a.id, label: a.name }))}
      seoContext={{ siteUrl: site.siteUrl, titleTemplate: site.titleTemplate }}
    />
  );
}
