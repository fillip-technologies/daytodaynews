import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverArt } from "@/components/blog/CoverArt";
import { ArticleContent } from "@/components/article/ArticleContent";
import { Newsletter } from "@/components/home/Newsletter";
import { Icon } from "@/components/ui/Icon";
import { getArticleBySlug, getPopularInCategory } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { toneStyle, type Tone } from "@/lib/tones";
import type { CoverPattern, CoverSpec } from "@/types/article";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found — DayTodayNews" };

  return {
    title: `${article.title} — DayTodayNews`,
    description: article.description || `Read about ${article.title} on DayTodayNews.`,
    openGraph: {
      title: article.title,
      description: article.description || undefined,
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = await getPopularInCategory(article.topicSlug, 3);
  const otherArticles = related.filter((r) => r.slug !== slug).slice(0, 2);

  let coverSpec: CoverSpec | undefined;
  if (article.coverPattern && article.coverTones) {
    try {
      coverSpec = {
        pattern: article.coverPattern as CoverPattern,
        tones: JSON.parse(article.coverTones) as [Tone, Tone],
        icon: (article.coverIcon || "sparkles") as any,
      };
    } catch {
      // ignore
    }
  }

  const topicTone = (article.topic.tone || "primary") as Tone;

  return (
    <main className="flex-1">
      {/* Atmosphere background */}
      <div className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem] overflow-hidden">
          <div
            style={toneStyle(topicTone)}
            className="absolute -top-32 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-(color:--tone)/15 blur-3xl"
          />
        </div>

        <article className="mx-auto w-full max-w-4xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
              <li>
                <Link href="/" className="text-text-muted transition-colors hover:text-primary">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-text-muted/60">
                /
              </li>
              <li>
                <Link
                  href={`/category/${article.topicSlug}`}
                  className="text-text-muted transition-colors hover:text-primary"
                >
                  {article.topic.label}
                </Link>
              </li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                style={toneStyle(topicTone)}
                className="inline-flex items-center gap-1.5 rounded-full border border-surface-elevated bg-(color:--tone)/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-(color:--tone)"
              >
                <Icon name={article.topic.icon as any} className="size-3.5" />
                {article.topic.label}
              </span>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs font-medium text-text-secondary">{article.readTime} min read</span>
              <span className="text-xs text-text-muted">•</span>
              <time
                dateTime={article.publishedAt.toISOString()}
                className="text-xs font-medium text-text-secondary"
              >
                {formatDate(article.publishedAt.toISOString())}
              </time>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl lg:leading-[1.15]">
              {article.title}
            </h1>

            {article.description && (
              <p className="text-lg leading-relaxed text-text-secondary sm:text-xl">
                {article.description}
              </p>
            )}

            {/* Author bar */}
            <div className="flex items-center gap-4 border-y border-border py-4">
              <div className="grid size-11 place-items-center rounded-full bg-surface-elevated font-semibold text-text-primary shadow-xs ring-1 ring-border">
                {article.author?.name ? article.author.name[0] : "S"}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {article.author?.name || article.authorName}
                </p>
                <p className="text-xs text-text-muted">
                  {article.author?.bio || "Staff Writer & Technology Columnist"}
                </p>
              </div>
            </div>
          </header>

          {/* Article Visual / Cover */}
          {article.imageUrl ? (
            <div className="relative my-8 aspect-16/9 w-full overflow-hidden rounded-2xl border border-border shadow-xs">
              <Image
                src={article.imageUrl}
                alt={article.imageAlt || article.title}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 896px, 100vw"
              />
            </div>
          ) : coverSpec ? (
            <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-xs">
              <div className="aspect-16/9 w-full">
                <CoverArt cover={coverSpec} />
              </div>
            </div>
          ) : null}

          {/* Article Body */}
          <div className="mt-8">
            {article.content ? (
              <ArticleContent content={article.content} />
            ) : (
              <p className="text-base text-text-muted">Full content for this article will be published soon.</p>
            )}
          </div>

          {/* Related Articles Section */}
          {otherArticles.length > 0 && (
            <section className="mt-16 border-t border-border pt-10">
              <h2 className="text-xl font-bold text-text-primary">Related in {article.topic.label}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {otherArticles.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={rel.href}
                    className="group flex flex-col justify-between rounded-2xl border border-border bg-surface-elevated p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        {rel.readTime} min read
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-text-primary group-hover:text-primary">
                        {rel.title}
                      </h3>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      Read story <Icon name="arrowRight" className="size-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>

      <Newsletter />
    </main>
  );
}
