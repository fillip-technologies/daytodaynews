import { prisma } from "@/lib/prisma";
import { cleanHttpUrl } from "@/lib/validation";

// Lead delivery to outside tools (Admin → Leads → CRM integration). Every new
// lead, enquiry, listing submission, pitch and contact message is POSTed as
// JSON to the webhook, so HubSpot, Zoho, Pipedrive, a Google Sheet or an n8n /
// Zapier flow can pick it up. Optional: with no URL nothing is sent.

export const INTEGRATIONS_SETTING = "integrations";

export type Integrations = { leadWebhookUrl: string };

export const defaultIntegrations: Integrations = { leadWebhookUrl: "" };

export function parseIntegrations(json: string | null | undefined): Integrations {
  try {
    const raw = json ? (JSON.parse(json) as Record<string, unknown>) : {};
    const url = cleanHttpUrl(raw.leadWebhookUrl);
    return { leadWebhookUrl: url && url.startsWith("https://") ? url : "" };
  } catch {
    return defaultIntegrations;
  }
}

export async function getIntegrations(): Promise<Integrations> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: INTEGRATIONS_SETTING } });
    return parseIntegrations(row?.value);
  } catch (error) {
    console.error("Failed to load integrations:", error);
    return defaultIntegrations;
  }
}

export type LeadEvent = {
  event: "advertising_enquiry" | "listing_enquiry" | "listing_submission" | "contributor_pitch" | "contact_message";
  data: Record<string, unknown>;
};

/** Sends one lead to the CRM webhook. Never throws; failures are only logged. */
export async function deliverLead(lead: LeadEvent): Promise<void> {
  const { leadWebhookUrl } = await getIntegrations();
  if (!leadWebhookUrl) return;
  try {
    const res = await fetch(leadWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "daytodaynews", sentAt: new Date().toISOString(), ...lead }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`Lead webhook answered ${res.status} for ${lead.event}`);
  } catch (error) {
    console.error(`Lead webhook failed for ${lead.event}:`, error);
  }
}
