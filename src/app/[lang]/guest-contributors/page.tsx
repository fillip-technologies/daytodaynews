import type { Metadata } from "next";
import { ArticleTypeListing } from "@/components/static/ArticleTypeListing";
import { parsePage } from "@/lib/pagination";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";

type Props = PageProps<"/[lang]/guest-contributors">;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  return fixedPageMetadata("guest-contributors", await localeFromParams(params), {
    noIndex: parsePage((await searchParams).page) > 1,
  });
}

// Articles marked "Guest contribution" in the article editor.
export default async function GuestContributorsPage({ params, searchParams }: Props) {
  return (
    <ArticleTypeListing type="GUEST" locale={await localeFromParams(params)} page={parsePage((await searchParams).page)} />
  );
}
