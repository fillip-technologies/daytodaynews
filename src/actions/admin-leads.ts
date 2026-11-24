"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { INTEGRATIONS_SETTING } from "@/lib/integrations";
import { errorMessage, requireAdmin, requireStaff } from "@/lib/staff";
import { cleanHttpUrl, cleanLine } from "@/lib/validation";

// Admin → Leads: follow up on advertiser and directory enquiries, and the CRM webhook.

type Result = { success: boolean; error?: string };

const leadStatuses = ["NEW", "CONTACTED", "FORWARDED", "WON", "CLOSED"] as const;

export async function setLeadStatus(id: string, statusInput: string): Promise<Result> {
  try {
    await requireStaff();
    const status = leadStatuses.find((s) => s === statusInput);
    if (!status) return { success: false, error: "Unknown status." };
    await prisma.lead.update({
      where: { id },
      data: { status, ...(status === "FORWARDED" ? { forwardedAt: new Date() } : {}) },
    });
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to update the lead.") };
  }
}

export async function deleteLead(id: string): Promise<Result> {
  try {
    await requireStaff();
    await prisma.lead.delete({ where: { id } });
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to delete the lead.") };
  }
}

export async function saveIntegrations(input: { leadWebhookUrl?: string }): Promise<Result> {
  try {
    await requireAdmin();
    const typed = cleanLine(input.leadWebhookUrl, 2048);
    const url = typed ? cleanHttpUrl(typed) : "";
    if (typed && (!url || !url.startsWith("https://"))) {
      return { success: false, error: "The webhook address must start with https://" };
    }
    const value = JSON.stringify({ leadWebhookUrl: url ?? "" });
    await prisma.siteSetting.upsert({
      where: { key: INTEGRATIONS_SETTING },
      update: { value },
      create: { key: INTEGRATIONS_SETTING, value },
    });
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to save the integration.") };
  }
}

/** Sends a sample lead to the webhook so the CRM side can be set up. */
export async function testLeadWebhook(): Promise<Result> {
  try {
    await requireAdmin();
    const { deliverLead, getIntegrations } = await import("@/lib/integrations");
    const { leadWebhookUrl } = await getIntegrations();
    if (!leadWebhookUrl) return { success: false, error: "Save a webhook address first." };
    await deliverLead({
      event: "advertising_enquiry",
      data: { test: true, name: "Test Lead", email: "test@example.com", message: "Test from DayTodayNews admin." },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Test failed.") };
  }
}
