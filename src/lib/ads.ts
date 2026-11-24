import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ADS_SETTING, defaultAds, parseAds, type AdsSettings } from "@/lib/ads-config";

export { usesAdsense, type AdPlacement } from "@/lib/ads-config";

/** Ads settings (memoized per request). */
export const getAds = cache(async (): Promise<AdsSettings> => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: ADS_SETTING } });
    return parseAds(row?.value);
  } catch (error) {
    console.error("Failed to load ads settings:", error);
    return defaultAds;
  }
});
