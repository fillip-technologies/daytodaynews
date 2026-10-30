"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cleanHeaderMenus, HEADER_MENU_SETTING, type HeaderMenu } from "@/lib/header-menu";

async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
    throw new Error("Unauthorized: Staff access required.");
  }
  return user;
}

/** Replaces the header menu bar with `input` (in display order). */
export async function updateHeaderMenus(
  input: unknown,
): Promise<{ success: boolean; error?: string; menus?: HeaderMenu[] }> {
  try {
    await requireStaff();

    const topics = await prisma.topic.findMany({ select: { slug: true } });
    const cleaned = cleanHeaderMenus(input, new Set(topics.map((topic) => topic.slug)));
    if (!cleaned.ok) return { success: false, error: cleaned.error };

    const value = JSON.stringify(cleaned.value);
    await prisma.siteSetting.upsert({
      where: { key: HEADER_MENU_SETTING },
      update: { value },
      create: { key: HEADER_MENU_SETTING, value },
    });

    revalidatePath("/", "layout"); // The header appears on every page.
    revalidatePath("/admin/menu");
    return { success: true, menus: cleaned.value };
  } catch (error) {
    console.error("updateHeaderMenus error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to save the menu bar." };
  }
}

