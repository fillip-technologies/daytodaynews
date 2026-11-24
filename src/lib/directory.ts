import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { RESERVED_LISTING_SLUGS, slugifyListing, type ListingKind, type ListingTier } from "@/lib/directory-config";

// Reads for the public directories. Only APPROVED listings are public;
// Featured (paid) listings come first and are labelled as such, then Verified.

export const DIRECTORY_PAGE_SIZE = 12;

export type ListingCardData = {
  slug: string;
  kind: ListingKind;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  category: string | null;
  country: string | null;
  city: string | null;
  tier: ListingTier;
};

const cardSelect = {
  slug: true,
  kind: true,
  name: true,
  tagline: true,
  logoUrl: true,
  category: true,
  country: true,
  city: true,
  tier: true,
} as const;

/** Approved listings of one directory, filtered and paginated. */
export async function searchListings({
  kind,
  query = "",
  category = "",
  country = "",
  page = 1,
  pageSize = DIRECTORY_PAGE_SIZE,
}: {
  kind: ListingKind;
  query?: string;
  category?: string;
  country?: string;
  page?: number;
  pageSize?: number;
}) {
  const q = query.trim().slice(0, 100);
  const where = {
    kind,
    status: "APPROVED" as const,
    ...(category ? { category } : {}),
    ...(country ? { country } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { tagline: { contains: q } },
            { description: { contains: q } },
            { services: { contains: q } },
            { category: { contains: q } },
          ],
        }
      : {}),
  };
  try {
    const total = await prisma.listing.count({ where });
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), pageCount);
    const items = await prisma.listing.findMany({
      where,
      orderBy: [{ tier: "desc" }, { name: "asc" }],
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      select: cardSelect,
    });
    return { items: items as ListingCardData[], total, page: safePage, pageCount };
  } catch (error) {
    console.error(`Failed to load the ${kind} directory:`, error);
    return { items: [] as ListingCardData[], total: 0, page: 1, pageCount: 1 };
  }
}

/** Categories and countries that approved listings of a directory use, for its filters. */
export const getDirectoryFacets = cache(async (kind: ListingKind) => {
  try {
    const rows = await prisma.listing.findMany({
      where: { kind, status: "APPROVED" },
      select: { category: true, country: true },
    });
    const sorted = (values: Array<string | null>) =>
      [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) => a.localeCompare(b));
    return { categories: sorted(rows.map((r) => r.category)), countries: sorted(rows.map((r) => r.country)) };
  } catch (error) {
    console.error(`Failed to load ${kind} directory filters:`, error);
    return { categories: [] as string[], countries: [] as string[] };
  }
});

/** One listing by slug; drafts only when `includeUnapproved` (staff preview). */
export const getListing = cache(async (kind: ListingKind, slug: string, includeUnapproved = false) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { slug } });
    if (!listing || listing.kind !== kind) return null;
    if (listing.status !== "APPROVED" && !includeUnapproved) return null;
    return listing;
  } catch (error) {
    console.error(`Failed to load listing "${slug}":`, error);
    return null;
  }
});

/** Approved listings by slug, in the given order (for "Companies & tools" under an article). */
export async function getListingsBySlugs(slugs: string[]): Promise<ListingCardData[]> {
  if (slugs.length === 0) return [];
  try {
    const rows = await prisma.listing.findMany({
      where: { slug: { in: slugs }, status: "APPROVED" },
      select: cardSelect,
    });
    const bySlug = new Map(rows.map((r) => [r.slug, r as ListingCardData]));
    return slugs.flatMap((slug) => bySlug.get(slug) ?? []);
  } catch (error) {
    console.error("Failed to load related listings:", error);
    return [];
  }
}

/** Other approved listings in the same category (for a listing page). */
export async function getSimilarListings(listing: { id: string; kind: ListingKind; category: string | null }, take = 4) {
  if (!listing.category) return [];
  try {
    const rows = await prisma.listing.findMany({
      where: { kind: listing.kind, status: "APPROVED", category: listing.category, id: { not: listing.id } },
      orderBy: [{ tier: "desc" }, { name: "asc" }],
      take,
      select: cardSelect,
    });
    return rows as ListingCardData[];
  } catch {
    return [];
  }
}

/** Lines of a multi-line listing field. */
export const listingLines = (text: string | null | undefined) =>
  (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

/** A free slug for `name` ("acme", "acme-2", …). */
export async function uniqueListingSlug(name: string, exceptId?: string): Promise<string> {
  const base = slugifyListing(name);
  for (let n = 1; n < 200; n++) {
    const slug = n === 1 && !RESERVED_LISTING_SLUGS.has(base) ? base : `${base}-${n}`;
    if (n === 1 && RESERVED_LISTING_SLUGS.has(base)) continue;
    const taken = await prisma.listing.findUnique({ where: { slug }, select: { id: true } });
    if (!taken || taken.id === exceptId) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}
