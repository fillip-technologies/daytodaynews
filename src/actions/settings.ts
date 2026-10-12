"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
    throw new Error("Unauthorized: Staff access required.");
  }
  return user;
}

export async function updateHeaderCategories(slugs: string[]) {
  try {
    await requireStaff();

    if (!Array.isArray(slugs)) {
      return { success: false, error: "Invalid category selection." };
    }

    if (slugs.length === 0) {
      return { success: false, error: "Please select at least 1 category for the header." };
    }

    if (slugs.length > 5) {
      return { success: false, error: "Maximum 5 categories can be shown in the header." };
    }

    // Verify all slugs exist in DB
    const existingTopics = await prisma.topic.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true },
    });

    const validSlugs = slugs.filter((s) =>
      existingTopics.some((t) => t.slug === s)
    );

    if (validSlugs.length === 0) {
      return { success: false, error: "None of the selected categories were found." };
    }

    if (!prisma.siteSetting) {
      return { success: false, error: "SiteSetting model is initializing. Please try again." };
    }

    await prisma.siteSetting.upsert({
      where: { key: "header_categories" },
      update: { value: JSON.stringify(validSlugs) },
      create: { key: "header_categories", value: JSON.stringify(validSlugs) },
    });

    // Revalidate global layout so header updates across all pages
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");

    return { success: true, slugs: validSlugs };
  } catch (error) {
    console.error("updateHeaderCategories error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update header categories.",
    };
  }
}
