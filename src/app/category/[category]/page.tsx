import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { FeaturedArticle } from "@/components/blog/FeaturedArticle";
import { CategoryArticles } from "@/components/category/CategoryArticles";
import { CategoryHeader } from "@/components/category/CategoryHeader";
import { Newsletter } from "@/components/home/Newsletter";
import { categories, getCategory, getCategoryByAlias } from "@/data/categories";
import { getTopic } from "@/data/topics";
import { getCategoryListing, getPopularInCategory } from "@/lib/articles";
import { parsePage } from "@/lib/pagination";
import { toneStyle } from "@/lib/tones";

type Props = PageProps<"/category/[category]">;

const pageHref = (slug: string, page: number) =>
  page > 1 ? `/category/${slug}?page=${page}` : `/category/${slug}`;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  const url = pageHref(category.slug, parsePage((await searchParams).page));
  return {
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "DayTodayNews",
      title: category.seoTitle,
      description: category.seoDescription,
      url,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) {
    const canonical = getCategoryByAlias(slug);
    if (canonical) permanentRedirect(`/category/${canonical.slug}`);
    notFound();
  }

  const requestedPage = parsePage((await searchParams).page);
  const [listing, popular] = await Promise.all([
    getCategoryListing(category.topic, requestedPage),
    getPopularInCategory(category.topic),
  ]);
  const tone = getTopic(category.topic)?.tone ?? "primary";

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
            related={categories.filter((item) => item.slug !== category.slug)}
          />

          {listing.featured && listing.page === 1 && (
            <section aria-label="Featured article" className="mt-10 sm:mt-12">
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
