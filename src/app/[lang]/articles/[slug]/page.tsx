import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/i18n/Link";
import { notFound } from "next/navigation";
import { CoverArt } from "@/components/blog/CoverArt";
import { ArticleContent } from "@/components/article/ArticleContent";
import { Newsletter } from "@/components/home/Newsletter";
import { JsonLd } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { defaultLocale, format, isLocale, localizePath, locales, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { getArticleBySlug, getPopularInCategory } from "@/lib/articles";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { buildMetadata, canonicalPath, splitKeywords } from "@/lib/seo/metadata";
import { getSiteSeo } from "@/lib/seo/site";
import { absoluteUrl, articleNode, breadcrumbList, graph } from "@/lib/seo/structured-data";
import { toneStyle, type Tone } from "@/lib/tones";
import type { CoverPattern, CoverSpec } from "@/types/article";

type Props = PageProps<"/[lang]/articles/[slug]">;

async function readParams(params: Props["params"]) {
  const { lang, slug } = await params;
  return { slug, locale: (isLocale(lang) ? lang : defaultLocale) as Locale };
}

/** Until every language exists, all copies point at the English original. */
const isFullyTranslated = (translatedLocales: Locale[]) => locales.every((l) => translatedLocales.includes(l));

/** Published articles are public; drafts and archived ones only for signed-in staff (preview). */
async function canViewArticle(status: string) {
  return status === "PUBLISHED" || Boolean(await getCurrentUser());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await readParams(params);
  const t = dictionaries[locale];
  const [article, site] = await Promise.all([getArticleBySlug(slug, locale), getSiteSeo()]);
  if (!article || !(await canViewArticle(article.status))) {
    return { title: t.article.notFoundTitle, robots: { index: false, follow: false } };
  }

  return buildMetadata({
    locale,
    path: `/articles/${slug}`,
    translated: isFullyTranslated(article.translatedLocales),
    site,
    seo: article.seo,
    auto: {
      title: article.title,
      description: article.description || format(t.article.readAbout, { title: article.title }),
      image: article.imageUrl,
      // Staff previews of drafts must never be indexed.
      noIndex: article.status !== "PUBLISHED",
    },
    type: "article",
    article: {
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author?.name || article.authorName],
      section: article.topic.label,
    },
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug, locale } = await readParams(params);
  const t = dictionaries[locale];
  const [article, site] = await Promise.all([getArticleBySlug(slug, locale), getSiteSeo()]);

  if (!article || !(await canViewArticle(article.status))) {
    notFound();
  }
  const isDraft = article.status !== "PUBLISHED";

  const path = `/articles/${slug}`;
  const pageUrl = absoluteUrl(site, canonicalPath(path, locale, isFullyTranslated(article.translatedLocales), article.seo));
  const structuredData = graph(
    articleNode(site, locale, {
      url: pageUrl,
      title: article.title,
      description: article.description,
      image: article.seo?.ogImage || article.imageUrl,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      authorName: article.author?.name || article.authorName,
      section: article.topic.label,
      keywords: splitKeywords(article.seo?.keywords),
      textLocale: article.contentLocale,
    }),
    breadcrumbList([
      { name: t.common.home, url: absoluteUrl(site, localizePath("/", locale)) },
      { name: article.topic.label, url: absoluteUrl(site, localizePath(`/category/${article.topicSlug}`, locale)) },
      { name: article.title, url: pageUrl },
    ]),
  );

  const related = await getPopularInCategory(article.topicSlug, 3, locale);
  const otherArticles = related.filter((r) => r.slug !== slug).slice(0, 2);
  // The page is in `locale`, but the story itself may still be English only.
  const textLang = article.contentLocale !== locale ? article.contentLocale : undefined;

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
      {!isDraft && <JsonLd data={structuredData} />}
      {/* Atmosphere background */}
      <div className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem] overflow-hidden">
          <div
            style={toneStyle(topicTone)}
            className="absolute -top-32 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-(color:--tone)/15 blur-3xl"
          />
        </div>

        <article className="mx-auto w-full max-w-4xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 lg:px-8">
          {/* Breadcrumb Navigation. Text sits in a reading column (~75 characters a line); the cover stays wide. */}
          <nav aria-label="Breadcrumb" className="mx-auto mb-6 max-w-[44rem]">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
              <li>
                <Link href="/" className="text-text-muted transition-colors hover:text-primary">
                  {t.common.home}
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
          <header className="mx-auto max-w-[44rem] space-y-6">
            {isDraft && (
              <p
                role="status"
                className="flex items-center gap-2.5 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-medium text-warning"
              >
                <Icon name="eye" className="size-4 shrink-0" />
                {t.common.draftPreview}
              </p>
            )}
            {textLang && (
              <p
                role="note"
                className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-secondary"
              >
                <Icon name="globe" className="size-4 shrink-0 text-primary" />
                {t.common.englishOnly}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <span
                style={toneStyle(topicTone)}
                className="inline-flex items-center gap-1.5 rounded-full border border-surface-elevated bg-(color:--tone)/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-(color:--tone)"
              >
                <Icon name={article.topic.icon as any} className="size-3.5" />
                {article.topic.label}
              </span>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs font-medium text-text-secondary">
                {format(t.common.minRead, { n: article.readTime })}
              </span>
              <span className="text-xs text-text-muted">•</span>
              <time
                dateTime={article.publishedAt.toISOString()}
                className="text-xs font-medium text-text-secondary"
              >
                {formatDate(article.publishedAt.toISOString(), locale)}
              </time>
            </div>

            <h1 lang={textLang} className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl lg:leading-[1.15]">
              {article.title}
            </h1>

            {article.description && (
              <p lang={textLang} className="text-lg leading-relaxed text-text-secondary sm:text-xl">
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
                  {article.author?.bio || t.article.staffWriter}
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
          <div lang={textLang} className="mx-auto mt-8 max-w-[44rem]">
            {article.content ? (
              <ArticleContent content={article.content} />
            ) : (
              <p className="text-base text-text-muted">{t.article.comingSoon}</p>
            )}
          </div>

          {/* Related Articles Section */}
          {otherArticles.length > 0 && (
            <section className="mt-16 border-t border-border pt-10">
              <h2 className="text-xl font-bold text-text-primary">
                {format(t.article.relatedIn, { category: article.topic.label })}
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {otherArticles.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={rel.href}
                    className="group flex flex-col justify-between rounded-2xl border border-border bg-surface-elevated p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        {rel.readTime ? format(t.common.minRead, { n: rel.readTime }) : null}
                      </p>
                      <h3 lang={rel.locale} className="mt-2 text-base font-semibold text-text-primary group-hover:text-primary">
                        {rel.title}
                      </h3>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      {t.common.readStory} <Icon name="arrowRight" className="size-3.5" />
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
