"use server";

import { prisma } from "@/lib/prisma";
import { cleanListing, listingKinds, type ListingInput, type ListingKind } from "@/lib/directory-config";
import { uniqueListingSlug } from "@/lib/directory";
import { deliverLead } from "@/lib/integrations";
import { sendListingReceived } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cleanLine, isHoneypotFilled } from "@/lib/validation";

// Public listing submissions (List your business, Submit a tool, Submit your
// startup). They arrive as PENDING and appear on the site only after staff
// approve them in Admin → Directory.

export type SubmitListingResult = { success: boolean; error?: string };

const HOUR = 60 * 60 * 1000;

export async function submitListing(kindInput: string, values: Record<string, string>): Promise<SubmitListingResult> {
  if (isHoneypotFilled(values)) return { success: true };
  const kind = listingKinds.find((k) => k === kindInput) as ListingKind | undefined;
  if (!kind) return { success: false, error: "Unknown directory." };

  const clean = cleanListing(kind, values as ListingInput, true);
  if (!clean.ok) return { success: false, error: clean.error };
  const submitterName = cleanLine(values.submitterName, 100) || null;

  if (!(await rateLimit("listing", await clientIp(), 4, HOUR))) {
    return { success: false, error: "Too many submissions from your connection. Please try again later." };
  }

  try {
    // One listing per website: a second submission for the same site is treated as an update request.
    if (clean.value.website) {
      const host = new URL(clean.value.website).host.replace(/^www\./, "");
      const existing = await prisma.listing.findFirst({
        where: { kind, website: { contains: host } },
        select: { id: true, name: true },
      });
      if (existing) {
        return {
          success: false,
          error: `${existing.name} is already in the directory. To update it, please use the contact page.`,
        };
      }
    }

    const slug = await uniqueListingSlug(clean.value.name);
    const listing = await prisma.listing.create({
      data: { ...clean.value, kind, slug, status: "PENDING", tier: "BASIC", submitterName, submitterEmail: clean.value.email },
    });

    sendListingReceived({ name: listing.name, kind, email: listing.email, submitterName }).catch((err) =>
      console.error("Failed to send listing received email:", err),
    );
    deliverLead({
      event: "listing_submission",
      data: { kind, name: listing.name, website: listing.website, email: listing.email, country: listing.country, category: listing.category, submitterName },
    }).catch(() => {});
    return { success: true };
  } catch (error) {
    console.error("Listing submission error:", error);
    return { success: false, error: "Could not submit your listing. Please try again later." };
  }
}
