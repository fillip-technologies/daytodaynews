"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { cleanMenuTopics } from "@/lib/menu-topics";
import { prisma } from "@/lib/prisma";

export type MenuMutationResult = { success: boolean; error?: string };

async function requireStaff() {
  const current = await getCurrentUser();
  if (!current || (current.role !== "ADMIN" && current.role !== "EDITOR")) {
    throw new Error("Unauthorized: Staff editorial access required.");
  }
}

/** Replaces the mega-menu topics of one category with `input` (in display order). */
export async function updateMenuTopics(topicId: string, input: unknown): Promise<MenuMutationResult> {
  try {
    await requireStaff();

    const cleaned = cleanMenuTopics(input);
    if (!cleaned.ok) return { success: false, error: cleaned.error };

    const topic = await prisma.topic.findUnique({ where: { id: topicId }, select: { id: true } });
    if (!topic) return { success: false, error: "Category not found." };

    // Delete and recreate together, so a failure never leaves a half-saved menu.
    await prisma.$transaction([
      prisma.menuTopic.deleteMany({ where: { topicId } }),
      prisma.menuTopic.createMany({
        data: cleaned.value.map((item, sortOrder) => ({ ...item, topicId, sortOrder })),
      }),
    ]);

    revalidatePath("/", "layout"); // Mega menus appear on every page.
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error) {
    console.error("Update menu topics error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to save menu topics." };
  }
}
