"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { cleanHomepage, HOMEPAGE_SETTING, type HomeSection } from "@/lib/homepage";
import { prisma } from "@/lib/prisma";

export type HomepageMutationResult = { success: boolean; error?: string; sections?: HomeSection[] };

/** Replaces the homepage layout with `input` (sections in display order). */
export async function updateHomepage(input: unknown): Promise<HomepageMutationResult> {
  try {
    const current = await getCurrentUser();
    if (!current || (current.role !== "ADMIN" && current.role !== "EDITOR")) {
      return { success: false, error: "Unauthorized: Staff editorial access required." };
    }

    const [articles, topics] = await Promise.all([
      prisma.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } }),
      prisma.topic.findMany({ select: { slug: true } }),
    ]);
    const cleaned = cleanHomepage(
      input,
      new Set(articles.map((a) => a.slug)),
      new Set(topics.map((t) => t.slug)),
    );
    if (!cleaned.ok) return { success: false, error: cleaned.error };

    const value = JSON.stringify(cleaned.value);
    await prisma.siteSetting.upsert({
      where: { key: HOMEPAGE_SETTING },
      update: { value },
      create: { key: HOMEPAGE_SETTING, value },
    });

    revalidatePath("/[lang]", "page"); // The home page, in every language.
    revalidatePath("/admin/homepage");
    return { success: true, sections: cleaned.value };
  } catch (error) {
    console.error("updateHomepage error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to save the homepage." };
  }
}
