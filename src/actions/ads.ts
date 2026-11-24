"use server";

import { revalidatePath } from "next/cache";
import { ADS_SETTING, cleanAds } from "@/lib/ads-config";
import { prisma } from "@/lib/prisma";
import { errorMessage, requireAdmin } from "@/lib/staff";

// Admin → Ads: banner and AdSense placements.
export async function saveAds(input: unknown): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const clean = cleanAds(input);
    if (!clean.ok) return { success: false, error: clean.error };
    const value = JSON.stringify(clean.value);
    await prisma.siteSetting.upsert({ where: { key: ADS_SETTING }, update: { value }, create: { key: ADS_SETTING, value } });
    revalidatePath("/", "layout");
    revalidatePath("/admin/ads");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to save the ads.") };
  }
}
