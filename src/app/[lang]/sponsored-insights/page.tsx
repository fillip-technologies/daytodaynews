import type { Metadata } from "next";
import { ArticleTypeListing } from "@/components/static/ArticleTypeListing";
import { parsePage } from "@/lib/pagination";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";

type Props = PageProps<"/[lang]/sponsored-insights">;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  return fixedPageMetadata("sponsored-insights", await localeFromParams(params), {
    noIndex: parsePage((await searchParams).page) > 1,
  });
}

// Articles marked "Sponsored" in the article editor.
export default async function SponsoredInsightsPage({ params, searchParams }: Props) {
  return (
    <ArticleTypeListing type="SPONSORED" locale={await localeFromParams(params)} page={parsePage((await searchParams).page)} />
  );
}
