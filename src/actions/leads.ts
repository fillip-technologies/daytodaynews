"use server";

import { prisma } from "@/lib/prisma";
import { deliverLead } from "@/lib/integrations";
import { forwardEnquiryToListing, sendLeadNotification } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cleanEmail, cleanLine, cleanText, FORM_LIMITS, isHoneypotFilled } from "@/lib/validation";
import { normalizeWebsite } from "@/lib/directory-config";

// Public commercial forms: the Advertise page enquiry and a reader's enquiry to
// a listed company. Both are stored as leads (Admin → Leads), emailed to the
// team, sent to the CRM webhook, and record the page the visitor came from.

export type LeadResult = { success: boolean; error?: string };

const HOUR = 60 * 60 * 1000;

/** A site path the visitor came from, e.g. "/en/articles/x" (anything else is dropped). */
function cleanSourcePath(value: unknown): string | null {
  const text = cleanLine(value, 512);
  return text.startsWith("/") && !text.startsWith("//") ? text : null;
}

function contactFields(values: Record<string, string>) {
  return {
    name: cleanLine(values.name, FORM_LIMITS.name),
    email: cleanEmail(values.email),
    emailTyped: Boolean(values.email?.trim()),
    company: cleanLine(values.company, 150) || null,
    phone: cleanLine(values.phone, 40) || null,
    message: cleanText(values.message, FORM_LIMITS.message),
  };
}

export async function submitAdvertisingEnquiry(values: Record<string, string>): Promise<LeadResult> {
  if (isHoneypotFilled(values)) return { success: true };
  const { name, email, emailTyped, company, phone, message } = contactFields(values);
  const websiteTyped = cleanLine(values.website, 2048);
  const website = websiteTyped ? normalizeWebsite(websiteTyped) : null;
  const interest = cleanLine(values.interest, 150) || null;
  const budget = cleanLine(values.budget, 100) || null;
  const sourcePath = cleanSourcePath(values.sourcePath);

  if (!name || !emailTyped || !message) return { success: false, error: "Please fill in all required fields." };
  if (!email) return { success: false, error: "Please enter a valid email address." };
  if (websiteTyped && !website) return { success: false, error: "Please enter a valid website address." };

  if (!(await rateLimit("lead", await clientIp(), 5, HOUR))) {
    return { success: false, error: "Too many submissions from your connection. Please try again later." };
  }

  try {
    await prisma.lead.create({
      data: { type: "ADVERTISING", name, email, company, phone, website, interest, budget, message, sourcePath },
    });
    sendLeadNotification({ kind: "Advertising enquiry", name, email, company, phone, website, interest, budget, message, sourcePath }).catch(
      (err) => console.error("Failed to send advertising lead email:", err),
    );
    deliverLead({
      event: "advertising_enquiry",
      data: { name, email, company, phone, website, interest, budget, message, sourcePath },
    }).catch(() => {});
    return { success: true };
  } catch (error) {
    console.error("Advertising enquiry error:", error);
    return { success: false, error: "Could not send your enquiry. Please try again later." };
  }
}

/**
 * A reader's enquiry to a listed company: stored, forwarded to the company's
 * enquiry address (replies go straight to the reader), and copied to the team.
 */
export async function submitListingEnquiry(listingSlug: string, values: Record<string, string>): Promise<LeadResult> {
  if (isHoneypotFilled(values)) return { success: true };
  const { name, email, emailTyped, company, phone, message } = contactFields(values);
  const sourcePath = cleanSourcePath(values.sourcePath);

  if (!name || !emailTyped || !message) return { success: false, error: "Please fill in all required fields." };
  if (!email) return { success: false, error: "Please enter a valid email address." };

  if (!(await rateLimit("lead", await clientIp(), 8, HOUR))) {
    return { success: false, error: "Too many submissions from your connection. Please try again later." };
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { slug: cleanLine(listingSlug, 191) },
      select: { id: true, name: true, email: true, status: true, kind: true },
    });
    if (!listing || listing.status !== "APPROVED") return { success: false, error: "This listing is not available." };

    const forward = Boolean(listing.email);
    await prisma.lead.create({
      data: {
        type: "LISTING_ENQUIRY",
        name,
        email,
        company,
        phone,
        message,
        sourcePath,
        listingId: listing.id,
        status: forward ? "FORWARDED" : "NEW",
        forwardedAt: forward ? new Date() : null,
      },
    });

    if (listing.email) {
      forwardEnquiryToListing({ to: listing.email, listingName: listing.name, name, email, company, phone, message }).catch(
        (err) => console.error("Failed to forward listing enquiry:", err),
      );
    }
    sendLeadNotification({
      kind: forward ? "Directory enquiry (forwarded)" : "Directory enquiry (not forwarded: listing has no email)",
      listingName: listing.name,
      name,
      email,
      company,
      phone,
      message,
      sourcePath,
    }).catch((err) => console.error("Failed to send listing lead email:", err));
    deliverLead({
      event: "listing_enquiry",
      data: { listing: listing.name, listingKind: listing.kind, name, email, company, phone, message, sourcePath },
    }).catch(() => {});
    return { success: true };
  } catch (error) {
    console.error("Listing enquiry error:", error);
    return { success: false, error: "Could not send your enquiry. Please try again later." };
  }
}
