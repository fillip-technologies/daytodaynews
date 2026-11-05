"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { cleanPageValues, pageSettingKey, type PageValues } from "@/lib/page-content";
import { getPageSchema } from "@/lib/page-defaults";
import { prisma } from "@/lib/prisma";
import { cleanSiteLinks, SITE_LINKS_SETTING, type SiteLinks } from "@/lib/site-links";
import { cleanTextOverrides, SITE_TEXT_SETTING, type TextOverrides } from "@/lib/site-text";

// Saves for Admin → Pages, Admin → Links & Footer and Admin → Site Text.

type SaveResult<T> = { success: boolean; error?: string; value?: T };

async function isStaff() {
  const user = await getCurrentUser();
  return Boolean(user && (user.role === "ADMIN" || user.role === "EDITOR"));
}

async function store(key: string, value: unknown) {
  const json = JSON.stringify(value);
  await prisma.siteSetting.upsert({ where: { key }, update: { value: json }, create: { key, value: json } });
}

const categorySlugs = async () =>
  new Set((await prisma.topic.findMany({ select: { slug: true } })).map((topic) => topic.slug));

const failure = (error: unknown, fallback: string) => ({
  success: false,
  error: error instanceof Error ? error.message : fallback,
});

/** Replaces the interface text changes (only strings that differ from the shipped text are kept). */
export async function updateSiteText(input: unknown): Promise<SaveResult<TextOverrides>> {
  try {
    if (!(await isStaff())) return { success: false, error: "Unauthorized: Staff editorial access required." };
    const cleaned = cleanTextOverrides(input);
    if (!cleaned.ok) return { success: false, error: cleaned.error };
    await store(SITE_TEXT_SETTING, cleaned.value);
    revalidatePath("/", "layout"); // Interface text appears on every page.
    revalidatePath("/admin/text");
    return { success: true, value: cleaned.value };
  } catch (error) {
    console.error("updateSiteText error:", error);
    return failure(error, "Failed to save the site text.");
  }
}

/** Replaces the top strip and footer links. */
export async function updateSiteLinks(input: unknown): Promise<SaveResult<SiteLinks>> {
  try {
    if (!(await isStaff())) return { success: false, error: "Unauthorized: Staff editorial access required." };
    const cleaned = cleanSiteLinks(input, await categorySlugs());
    if (!cleaned.ok) return { success: false, error: cleaned.error };
    await store(SITE_LINKS_SETTING, cleaned.value);
    revalidatePath("/", "layout"); // The strip and footer appear on every page.
    revalidatePath("/admin/links");
    return { success: true, value: cleaned.value };
  } catch (error) {
    console.error("updateSiteLinks error:", error);
    return failure(error, "Failed to save the links.");
  }
}

/** Replaces one fixed page's content. */
export async function updatePageContent(page: string, input: unknown): Promise<SaveResult<PageValues>> {
  try {
    if (!(await isStaff())) return { success: false, error: "Unauthorized: Staff editorial access required." };
    const schema = getPageSchema(page);
    if (!schema) return { success: false, error: "Unknown page." };
    const cleaned = cleanPageValues(schema, input, await categorySlugs());
    if (!cleaned.ok) return { success: false, error: cleaned.error };
    await store(pageSettingKey(page), cleaned.value);
    revalidatePath(`/[lang]${schema.path}`, "page"); // The page, in every language.
    revalidatePath("/admin/pages");
    return { success: true, value: cleaned.value };
  } catch (error) {
    console.error("updatePageContent error:", error);
    return failure(error, "Failed to save the page.");
  }
}
