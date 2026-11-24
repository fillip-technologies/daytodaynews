import type { Metadata } from "next";
import { ListingDetail } from "@/components/directory/ListingDetail";
import { getCurrentUser } from "@/lib/auth";
import { getListing } from "@/lib/directory";
import { isThinListing, listingPath } from "@/lib/directory-config";
import { redirectOrNotFound } from "@/lib/redirects";
import { buildMetadata } from "@/lib/seo/metadata";
import { localeFromParams } from "@/lib/seo/page-metadata";
import { getSiteSeo } from "@/lib/seo/site";

type Props = PageProps<"/[lang]/business-directory/[slug]">;

/** Approved listings are public; staff can preview pending and rejected ones. */
async function load(slug: string) {
  const staff = Boolean(await getCurrentUser());
  return getListing("BUSINESS", slug, staff);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [listing, site, locale] = await Promise.all([load(slug), getSiteSeo(), localeFromParams(params)]);
  if (!listing) return { robots: { index: false, follow: false } };
  const summary = listing.tagline || listing.description?.slice(0, 160) || listing.category || "";
  return buildMetadata({
    locale,
    path: listingPath("BUSINESS", listing.slug),
    // Listings are written in English only: every language points at /en.
    translated: false,
    site,
    seo: null,
    auto: {
      title: listing.category ? `${listing.name}: ${listing.category}` : listing.name,
      description: summary,
      image: listing.logoUrl,
      // Unapproved or thin profiles stay out of search results.
      noIndex: listing.status !== "APPROVED" || isThinListing(listing),
    },
  });
}

export default async function BusinessListingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const locale = await localeFromParams(params);
  const listing = await load(slug);
  if (!listing) return redirectOrNotFound(listingPath("BUSINESS", slug), locale);
  const from = (await searchParams).from;
  return (
    <ListingDetail
      listing={listing}
      locale={locale}
      from={typeof from === "string" ? from : undefined}
      preview={listing.status !== "APPROVED"}
    />
  );
}
