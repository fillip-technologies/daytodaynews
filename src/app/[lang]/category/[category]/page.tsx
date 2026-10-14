import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { FeaturedArticle } from "@/components/blog/FeaturedArticle";
import { CategoryArticles } from "@/components/category/CategoryArticles";
import { CategoryHeader } from "@/components/category/CategoryHeader";
import { Newsletter } from "@/components/home/Newsletter";
import { getCategory, getCategoryByAlias, type Category } from "@/data/categories";
import { getTopic } from "@/data/topics";
import { cache } from "react";
import { defaultLocale, format, isLocale, localizePath, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { getCategoryListing, getPopularInCategory } from "@/lib/articles";
import { parsePage } from "@/lib/pagination";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSiteSeo } from "@/lib/seo/site";
import type { CleanSeo } from "@/lib/seo/validate";
import { toneStyle, type Tone } from "@/lib/tones";
import { prisma } from "@/lib/prisma";

type Props = PageProps<"/[lang]/category/[category]">;

const pageHref = (slug: string, page: number) =>
  page > 1 ? `/category/${slug}?page=${page}` : `/category/${slug}`;

type ResolvedCategory = Category & { tone?: Tone; seo: CleanSeo | null };

// Memoized per request: the page and its metadata both need the category.
const resolveCategory = cache(async (slug: string, locale: Locale): Promise<ResolvedCategory | null> => {
  const t = dictionaries[locale];
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
  return buildMetadata({
    locale,
    path: pageHref(category.slug, parsePage((await searchParams).page)),
    site,
    seo: category.seo,
    auto: { title: category.seoTitle, description: category.seoDescription },
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
  const [listing, popular] = await Promise.all([
    getCategoryListing(category.topic, requestedPage, locale),
    getPopularInCategory(category.topic, 5, locale),
  ]);
  const tone = category.tone || (getTopic(category.topic)?.tone ?? "primary");

  return (
    <main className="flex-1" style={toneStyle(tone)}>
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

          {listing.featured && listing.page === 1 && (
            <section aria-label={dictionaries[locale].common.featuredArticle} className="mt-10 sm:mt-12">
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
        </div>
      </div>

      <Newsletter />
    </main>
  );
}
