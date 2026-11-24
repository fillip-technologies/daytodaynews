"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeRedirectPath } from "@/lib/redirects";
import { errorMessage, requireStaff } from "@/lib/staff";
import { cleanSeoUrl } from "@/lib/seo/validate";
import { cleanLine } from "@/lib/validation";

// Admin → Redirects: permanent (301) redirects for removed, merged or renamed pages.

type Result = { success: boolean; error?: string };

export async function saveRedirect(id: string | null, input: { fromPath: string; toPath: string; note?: string }): Promise<Result> {
  try {
    await requireStaff();
    const fromTyped = cleanLine(input.fromPath, 191);
    if (!fromTyped.startsWith("/")) return { success: false, error: "The old address must start with /, e.g. /articles/old-title" };
    const fromPath = normalizeRedirectPath(fromTyped);
    if (fromPath === "/") return { success: false, error: "The home page can't be redirected." };

    const target = cleanSeoUrl(cleanLine(input.toPath, 2048));
    if (!target.ok || !target.value) {
      return { success: false, error: "The new address must start with / (a page on this site) or https://" };
    }
    const toPath = target.value.startsWith("/") ? normalizeRedirectPath(target.value) : target.value;
    if (toPath === fromPath) return { success: false, error: "The old and new addresses are the same." };

    // No loops: the target must not itself redirect back here.
    const loop = await prisma.redirect.findUnique({ where: { fromPath: toPath } });
    if (loop && normalizeRedirectPath(loop.toPath) === fromPath) {
      return { success: false, error: "That would create a loop: the new address already redirects to the old one." };
    }

    const note = cleanLine(input.note, 255) || null;
    const clash = await prisma.redirect.findUnique({ where: { fromPath } });
    if (clash && clash.id !== id) return { success: false, error: "There is already a redirect from this address." };

    if (id) await prisma.redirect.update({ where: { id }, data: { fromPath, toPath, note } });
    else await prisma.redirect.create({ data: { fromPath, toPath, note } });
    revalidatePath("/admin/redirects");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to save the redirect.") };
  }
}

export async function deleteRedirect(id: string): Promise<Result> {
  try {
    await requireStaff();
    await prisma.redirect.delete({ where: { id } });
    revalidatePath("/admin/redirects");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to delete the redirect.") };
  }
}
