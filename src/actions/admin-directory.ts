"use server";

import { revalidatePath } from "next/cache";
import { localizePath } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { uniqueListingSlug } from "@/lib/directory";
import {
  cleanListing,
  directoryPath,
  listingKinds,
  listingPath,
  RESERVED_LISTING_SLUGS,
  slugifyListing,
  type ListingInput,
  type ListingKind,
  type ListingStatus,
  type ListingTier,
} from "@/lib/directory-config";
import { sendListingApproved } from "@/lib/mail";
import { recordMove } from "@/lib/redirects";
import { getSiteSeo } from "@/lib/seo/site";
import { errorMessage, requireStaff } from "@/lib/staff";
import { cleanLine, cleanText } from "@/lib/validation";

// Admin → Directory: create, edit, approve, rank (tier) and remove listings.

type Result = { success: boolean; error?: string; slug?: string; id?: string };

const tiers: ListingTier[] = ["BASIC", "VERIFIED", "FEATURED"];
const statuses: ListingStatus[] = ["PENDING", "APPROVED", "REJECTED"];

function refreshDirectory(kind: ListingKind) {
  revalidatePath("/", "layout");
  revalidatePath(directoryPath[kind]);
  revalidatePath("/admin/directory");
}

/** Emails the company when its listing goes live (once). */
async function notifyApproved(listing: { name: string; email: string | null; kind: ListingKind; slug: string }) {
  if (!listing.email) return;
  const site = await getSiteSeo();
  const url = new URL(localizePath(listingPath(listing.kind, listing.slug), "en"), site.siteUrl).toString();
  sendListingApproved({ name: listing.name, email: listing.email, url }).catch((err) =>
    console.error("Failed to send listing approved email:", err),
  );
}

export async function saveListing(
  id: string | null,
  data: ListingInput & {
    kind: string;
    slug?: string;
    tier?: string;
    status?: string;
    adminNotes?: string;
    notifyOnApprove?: boolean;
  },
): Promise<Result> {
  try {
    await requireStaff();
    const kind = listingKinds.find((k) => k === data.kind);
    if (!kind) return { success: false, error: "Choose a directory." };
    const clean = cleanListing(kind, data, false);
    if (!clean.ok) return { success: false, error: clean.error };

    const tier = tiers.find((t) => t === data.tier) ?? "BASIC";
    const status = statuses.find((s) => s === data.status) ?? "PENDING";
    const adminNotes = cleanText(data.adminNotes, 5000) || null;

    let slug = slugifyListing(cleanLine(data.slug, 191) || clean.value.name);
    if (RESERVED_LISTING_SLUGS.has(slug)) return { success: false, error: `"${slug}" can't be used as a web address.` };

    const existing = id ? await prisma.listing.findUnique({ where: { id } }) : null;
    if (id && !existing) return { success: false, error: "Listing not found." };
    const taken = await prisma.listing.findUnique({ where: { slug }, select: { id: true } });
    if (taken && taken.id !== id) {
      if (cleanLine(data.slug, 191)) return { success: false, error: "Another listing already uses this web address." };
      slug = await uniqueListingSlug(clean.value.name, id ?? undefined);
    }

    const becameApproved = status === "APPROVED" && existing?.status !== "APPROVED";
    const fields = {
      ...clean.value,
      kind,
      slug,
      tier,
      status,
      adminNotes,
      approvedAt: status === "APPROVED" ? (existing?.approvedAt ?? new Date()) : null,
    };

    const saved = existing
      ? await prisma.listing.update({ where: { id: existing.id }, data: fields })
      : await prisma.listing.create({ data: fields });

    // A renamed or moved listing keeps its old address working.
    if (existing && existing.status === "APPROVED" && (existing.slug !== slug || existing.kind !== kind)) {
      await recordMove(listingPath(existing.kind, existing.slug), listingPath(kind, slug), `Listing renamed: ${saved.name}`);
    }
    if (becameApproved && data.notifyOnApprove !== false) await notifyApproved(saved);

    refreshDirectory(kind);
    if (existing && existing.kind !== kind) refreshDirectory(existing.kind);
    return { success: true, slug: saved.slug, id: saved.id };
  } catch (error) {
    console.error("Save listing error:", error);
    return { success: false, error: errorMessage(error, "Failed to save the listing.") };
  }
}

export async function setListingStatus(id: string, statusInput: string): Promise<Result> {
  try {
    await requireStaff();
    const status = statuses.find((s) => s === statusInput);
    if (!status) return { success: false, error: "Unknown status." };
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Listing not found." };
    const saved = await prisma.listing.update({
      where: { id },
      data: { status, approvedAt: status === "APPROVED" ? (existing.approvedAt ?? new Date()) : null },
    });
    if (status === "APPROVED" && existing.status !== "APPROVED") await notifyApproved(saved);
    refreshDirectory(saved.kind);
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to update the listing.") };
  }
}

export async function setListingTier(id: string, tierInput: string): Promise<Result> {
  try {
    await requireStaff();
    const tier = tiers.find((t) => t === tierInput);
    if (!tier) return { success: false, error: "Unknown listing type." };
    const saved = await prisma.listing.update({ where: { id }, data: { tier } });
    refreshDirectory(saved.kind);
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to update the listing.") };
  }
}

export async function deleteListing(id: string): Promise<Result> {
  try {
    await requireStaff();
    const deleted = await prisma.listing.delete({ where: { id } });
    refreshDirectory(deleted.kind);
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to delete the listing.") };
  }
}
