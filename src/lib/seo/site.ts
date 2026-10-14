import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { normalizeSiteSeo, SITE_SEO_KEY, type SiteSeo } from "./site-config";

/** Site-wide SEO settings from admin (memoized per request), with safe defaults. */
export const getSiteSeo = cache(async (): Promise<SiteSeo> => {
  const fallbackUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: SITE_SEO_KEY } });
    return normalizeSiteSeo(row ? JSON.parse(row.value) : null, fallbackUrl);
  } catch (error) {
    console.error("Failed to load site SEO settings, using defaults:", error);
    return normalizeSiteSeo(null, fallbackUrl);
  }
});

/** One SeoMeta row for a fixed page in `locale` (memoized per request). */
export const getPageSeo = cache(async (pageKey: string, locale: string) => {
  try {
    return await prisma.seoMeta.findUnique({ where: { pageKey_locale: { pageKey, locale } } });
  } catch (error) {
    console.error(`Failed to load SEO for page "${pageKey}":`, error);
    return null;
  }
});
