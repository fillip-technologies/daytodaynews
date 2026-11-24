import type { Metadata } from "next";
import { DirectoryIndex, isFilteredDirectory } from "@/components/directory/DirectoryIndex";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";

type Props = PageProps<"/[lang]/software-directory">;

// Filtered and later pages are thin variations: kept out of search results.
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  return fixedPageMetadata("software-directory", await localeFromParams(params), {
    noIndex: isFilteredDirectory(await searchParams),
  });
}

// Listings: Admin → Directory. Page title and description: Admin → SEO → Pages.
export default async function SoftwareDirectoryPage({ params, searchParams }: Props) {
  return <DirectoryIndex kind="SOFTWARE" locale={await localeFromParams(params)} searchParams={await searchParams} />;
}
