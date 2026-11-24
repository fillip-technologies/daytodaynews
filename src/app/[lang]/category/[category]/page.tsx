import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { FeaturedArticle } from "@/components/blog/FeaturedArticle";
import { CategoryArticles } from "@/components/category/CategoryArticles";
import { CategoryHeader } from "@/components/category/CategoryHeader";
import { Newsletter } from "@/components/home/Newsletter";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategory, getCategoryByAlias, type Category } from "@/data/categories";
import { getTopic } from "@/data/topics";
import { cache } from "react";
import { defaultLocale, format, isLocale, localizePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { getCategoryListing, getPopularInCategory } from "@/lib/articles";
import { parsePage } from "@/lib/pagination";
import { buildMetadata, canonicalPath } from "@/lib/seo/metadata";
import { getSiteSeo } from "@/lib/seo/site";
import { absoluteUrl, breadcrumbList, collectionNode, graph } from "@/lib/seo/structured-data";
import type { CleanSeo } from "@/lib/seo/validate";
import { toneStyle, type Tone } from "@/lib/tones";
import { prisma } from "@/lib/prisma";
import { AdSlot } from "@/components/ads/AdSlot";
import { CtaBox } from "@/components/article/ArticleExtras";
import { PageMarkdown } from "@/components/static/PageMarkdown";
import { Icon } from "@/components/ui/Icon";
import Link from "@/i18n/Link";
import { getLiveArticlesBySlugs } from "@/lib/articles";
import { categoryCta } from "@/lib/category-cta";
import { liveArticleWhere } from "@/lib/visibility";

type Props = PageProps<"/[lang]/category/[category]">;

const pageHref = (slug: string, page: number) =>
  page > 1 ? `/category/${slug}?page=${page}` : `/category/${slug}`;

type ResolvedCategory = Category & {
  tone?: Tone;
  seo: CleanSeo | null;
  /** Longer introduction (markdown) and pillar guide, from Admin → Categories. */
  intro?: string | null;
  pillarSlug?: string | null;
  cta?: { ctaTitle?: string | null; ctaText?: string | null; ctaLabel?: string | null; ctaHref?: string | null };
};

// Memoized per request: the page and its metadata both need the category.
const resolveCategory = cache(async (slug: string, locale: Locale): Promise<ResolvedCategory | null> => {
  const t = await getDictionary(locale);
  try {
    // 1. Direct DB lookup by slug (e.g. "ai-automation", "software", "development", etc.),
    // 2. else a legacy alias (e.g. "software-development" -> "software").
    const include = { translations: { where: { locale } }, seo: { where: { locale } } };
    const dbTopic =
      (await prisma.topic.findUnique({ where: { slug }, include })) ??
      (getCategoryByAlias(slug)
        ? await prisma.topic.findUnique({ where: { slug: getCategoryByAlias(slug)!.topic }, include })
        : null);

    if (dbTopic) {
      const translation = dbTopic.translations[0];
      const name = translation?.label || dbTopic.label;
      const description = translation?.description || dbTopic.description;
      return {
        slug: dbTopic.slug,
        topic: dbTopic.slug,
        name,
        description,
        icon: (dbTopic.icon as any) || "sparkles",
        tone: (dbTopic.tone as Tone) || "primary",
        seoTitle: format(t.category.seoTitle, { category: name }),
        seoDescription: description,
        seo: dbTopic.seo[0] ?? null,
        intro: translation?.intro || dbTopic.intro,
        pillarSlug: dbTopic.pillarSlug,
        cta: {
          ctaTitle: translation?.ctaTitle || dbTopic.ctaTitle,
          ctaText: translation?.ctaText || dbTopic.ctaText,
          ctaLabel: translation?.ctaLabel || dbTopic.ctaLabel,
          ctaHref: dbTopic.ctaHref,
        },
      };
    }
  } catch (err) {
    console.error("Failed to query topic from DB:", err);
  }

  // 3. Fallback to static category definition
  const staticCat = getCategory(slug) || getCategoryByAlias(slug);
  if (staticCat) {
    return { ...staticCat, seoTitle: format(t.category.seoTitle, { category: staticCat.name }), seo: null };
  }

  return null;
});

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang, category: slug } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const [category, site] = await Promise.all([resolveCategory(slug, locale), getSiteSeo()]);
  if (!category) return {};
  // An empty category page stays out of search results until its first article.
  const published = await prisma.article
    .count({ where: { topicSlug: category.topic, ...liveArticleWhere() } })
    .catch(() => 1);
  return buildMetadata({
    locale,
    path: pageHref(category.slug, parsePage((await searchParams).page)),
    site,
    seo: category.seo,
    auto: { title: category.seoTitle, description: category.seoDescription, noIndex: published === 0 },
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { lang, category: slug } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const category = await resolveCategory(slug, locale);
  if (!category) {
    const canonical = getCategoryByAlias(slug);
    if (canonical) permanentRedirect(localizePath(`/category/${canonical.slug}`, locale));
    notFound();
  }

  const requestedPage = parsePage((await searchParams).page);
  const [listing, popular, site, t, pillars] = await Promise.all([
    getCategoryListing(category.topic, requestedPage, locale),
    getPopularInCategory(category.topic, 5, locale),
    getSiteSeo(),
    getDictionary(locale),
    category.pillarSlug ? getLiveArticlesBySlugs([category.pillarSlug], locale) : Promise.resolve([]),
  ]);
  const pillar = pillars[0] ?? null;
  const isFirstPage = listing.page === 1;
  const cta = categoryCta({ slug: category.topic, ...category.cta }, locale);
  const tone = category.tone || (getTopic(category.topic)?.tone ?? "primary");

  const pageUrl = absoluteUrl(site, canonicalPath(pageHref(category.slug, requestedPage), locale, true, category.seo));
  const structuredData = graph(
    collectionNode(site, locale, { url: pageUrl, name: category.name, description: category.description }),
    breadcrumbList([
      { name: t.common.home, url: absoluteUrl(site, localizePath("/", locale)) },
      { name: category.name, url: absoluteUrl(site, localizePath(`/category/${category.slug}`, locale)) },
    ]),
  );

  return (
    <main className="flex-1" style={toneStyle(tone)}>
      <JsonLd data={structuredData} />
      <div className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem] overflow-hidden">
          <div className="absolute -top-40 left-[6%] h-80 w-[36rem] rounded-full bg-(color:--tone)/12 blur-3xl" />
          <div className="absolute -top-32 right-[4%] h-80 w-[30rem] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-8 sm:px-6 sm:pt-14 lg:px-8">
          <CategoryHeader
            category={category}
            articleCount={listing.count}
            latestDate={listing.latestDate}
          />

          {isFirstPage && category.intro && (
            <div className="mt-8 max-w-3xl space-y-4 text-base leading-relaxed text-text-secondary [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_strong]:text-text-primary [&_ul]:list-disc [&_ul]:pl-6">
              <PageMarkdown>{category.intro}</PageMarkdown>
            </div>
          )}

          {isFirstPage && pillar && (
            <Link
              href={pillar.href}
              className="group mt-8 flex items-center justify-between gap-4 rounded-2xl border border-primary/25 bg-primary/5 p-5 transition-colors hover:bg-primary/10"
            >
              <span className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                  {t.category.startHere} · {t.category.completeGuide}
                </span>
                <span lang={pillar.locale} className="mt-1 block text-lg font-semibold text-text-primary">
                  {pillar.title}
                </span>
              </span>
              <Icon name="arrowRight" className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          {listing.featured && listing.page === 1 && (
            <section aria-label={t.common.featuredArticle} className="mt-10 sm:mt-12">
              <FeaturedArticle article={listing.featured} />
            </section>
          )}

          <CategoryArticles
            categoryName={category.name}
            articles={listing.items}
            popular={popular}
            page={listing.page}
            pageCount={listing.pageCount}
            hrefForPage={(page) => pageHref(category.slug, page)}
          />

          <div className="mx-auto max-w-4xl">
            <CtaBox cta={cta} />
            <AdSlot placement="category" locale={locale} />
          </div>
        </div>
      </div>

      <Newsletter />
    </main>
  );
}
