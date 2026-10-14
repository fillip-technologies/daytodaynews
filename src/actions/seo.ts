"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma";
import { locales } from "@/i18n/config";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSeoPage } from "@/lib/seo/pages";
import { cleanSiteSeo, SITE_SEO_KEY } from "@/lib/seo/site-config";
import { getSiteSeo } from "@/lib/seo/site";
import { cleanLocalizedSeo, isEmptySeo } from "@/lib/seo/validate";

export type SeoMutationResult = { success: boolean; error?: string };

/** Site-wide and fixed-page SEO is limited to admins (editors manage article/category SEO). */
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required to change site SEO.");
  }
  return user;
}

/** Saves Admin → SEO → Website / Sitemap & Robots / Verification & Analytics. */
export async function updateSiteSeo(input: unknown): Promise<SeoMutationResult> {
  try {
    await requireAdmin();
    const cleaned = cleanSiteSeo(input, await getSiteSeo());
    if (!cleaned.ok) return { success: false, error: cleaned.error };

    const value = JSON.stringify(cleaned.value);
    await prisma.siteSetting.upsert({
      where: { key: SITE_SEO_KEY },
      update: { value },
      create: { key: SITE_SEO_KEY, value },
    });

    revalidatePath("/", "layout"); // Titles, robots and verification tags on every page.
    revalidatePath("/admin/seo");
    return { success: true };
  } catch (error) {
    console.error("Update site SEO error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to save SEO settings." };
  }
}

/** Saves the SEO overrides of one fixed page (Admin → SEO → Pages), both languages. */
export async function updatePageSeo(pageKey: string, input: unknown): Promise<SeoMutationResult> {
  try {
    await requireAdmin();
    const page = getSeoPage(pageKey);
    if (!page) return { success: false, error: "Unknown page." };

    const cleaned = cleanLocalizedSeo(input);
    if (!cleaned.ok) return { success: false, error: cleaned.error };

    // Both languages are saved together: all or nothing.
    const operations: Prisma.PrismaPromise<unknown>[] = [];
    for (const locale of locales) {
      const value = cleaned.value[locale];
      if (!value) continue;
      operations.push(
        isEmptySeo(value)
          ? prisma.seoMeta.deleteMany({ where: { pageKey, locale } })
          : prisma.seoMeta.upsert({
              where: { pageKey_locale: { pageKey, locale } },
              update: value,
              create: { pageKey, locale, ...value },
            }),
      );
    }
    await prisma.$transaction(operations);

    revalidatePath("/", "layout");
    revalidatePath("/admin/seo");
    return { success: true };
  } catch (error) {
    console.error("Update page SEO error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to save page SEO." };
  }
}
