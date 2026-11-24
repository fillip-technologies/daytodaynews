"use server";

import { revalidatePath } from "next/cache";
import { planChecklist, planDueDate, planExtras, planSeeds } from "@/lib/plan-data";
import { prisma } from "@/lib/prisma";
import { errorMessage, requireStaff } from "@/lib/staff";
import { cleanLine, cleanText } from "@/lib/validation";

// Admin → Editorial Plan: the 90-day editorial management dashboard (plan
// section 15): assignments, keywords, word targets, status and checklist.

type Result = { success: boolean; error?: string; added?: number };

const STATUSES = ["IDEA", "ASSIGNED", "WRITING", "REVIEW", "SCHEDULED", "PUBLISHED"] as const;
const CHECK_KEYS = new Set<string>(planChecklist.map(([key]) => key));

const extraDates: Record<number, string> = {
  37: "2026-11-21T09:00:00+05:30",
  38: "2027-01-20T09:00:00+05:30",
  39: "2027-02-03T09:00:00+05:30",
};

/** Adds the plan's 36 articles (plus the pillar guide and research items) that aren't in the plan yet. */
export async function importPdfPlan(): Promise<Result> {
  try {
    await requireStaff();
    const existing = new Set((await prisma.planItem.findMany({ select: { number: true } })).map((p) => p.number));
    const liveSlugs = new Set(
      (
        await prisma.article.findMany({
          where: { slug: { in: planSeeds.flatMap((s) => (s.refresh ? [s.refresh] : [])) } },
          select: { slug: true },
        })
      ).map((a) => a.slug),
    );
    const rows = [...planSeeds, ...planExtras]
      .filter((seed) => !existing.has(seed.number))
      .map((seed) => {
        const refresh = seed.refresh && liveSlugs.has(seed.refresh) ? seed.refresh : null;
        return {
          number: seed.number,
          kind: refresh ? ("REFRESH" as const) : ("NEW" as const),
          title: seed.title,
          focusKeyword: seed.focusKeyword,
          category: seed.category,
          wordTarget: seed.wordTarget,
          month: seed.month,
          dueDate: extraDates[seed.number] ? new Date(extraDates[seed.number]) : planDueDate(seed.number),
          articleSlug: refresh,
          notes: [refresh ? `Refresh the existing article (/articles/${refresh}) instead of writing a duplicate.` : "", seed.notes ?? ""]
            .filter(Boolean)
            .join(" "),
        };
      });
    if (rows.length) await prisma.planItem.createMany({ data: rows });
    revalidatePath("/admin/plan");
    revalidatePath("/admin");
    return { success: true, added: rows.length };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to import the plan.") };
  }
}

export type PlanItemInput = {
  title: string;
  kind?: string;
  focusKeyword?: string;
  secondaryKeywords?: string;
  category?: string;
  wordTarget?: string | number;
  month?: string | number;
  dueDate?: string;
  writerId?: string;
  editorId?: string;
  status?: string;
  articleSlug?: string;
  metaTitle?: string;
  metaDescription?: string;
  notes?: string;
  checklist?: string[];
};

export async function savePlanItem(id: string | null, input: PlanItemInput): Promise<Result> {
  try {
    await requireStaff();
    const title = cleanLine(input.title, 255);
    if (!title) return { success: false, error: "The title is required." };
    const dueText = cleanLine(input.dueDate, 10);
    if (dueText && !/^\d{4}-\d{2}-\d{2}$/.test(dueText)) return { success: false, error: "Due date must look like 2026-11-20." };
    const words = Number(input.wordTarget);
    const month = Number(input.month);
    const data = {
      title,
      kind: input.kind === "REFRESH" ? ("REFRESH" as const) : ("NEW" as const),
      focusKeyword: cleanLine(input.focusKeyword, 150) || null,
      secondaryKeywords: cleanText(input.secondaryKeywords, 2000) || null,
      category: cleanLine(input.category, 120) || null,
      wordTarget: Number.isInteger(words) && words > 0 && words < 20000 ? words : null,
      month: [1, 2, 3].includes(month) ? month : null,
      dueDate: dueText ? new Date(`${dueText}T09:00:00+05:30`) : null,
      writerId: cleanLine(input.writerId, 191) || null,
      editorId: cleanLine(input.editorId, 191) || null,
      status: STATUSES.find((s) => s === input.status) ?? "IDEA",
      articleSlug: cleanLine(input.articleSlug, 191).toLowerCase() || null,
      metaTitle: cleanLine(input.metaTitle, 255) || null,
      metaDescription: cleanText(input.metaDescription, 500) || null,
      notes: cleanText(input.notes, 5000) || null,
      checklist: JSON.stringify((input.checklist ?? []).filter((key) => CHECK_KEYS.has(key))),
    };
    if (id) {
      await prisma.planItem.update({ where: { id }, data });
    } else {
      const last = await prisma.planItem.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
      await prisma.planItem.create({ data: { ...data, number: (last?.number ?? 0) + 1 } });
    }
    revalidatePath("/admin/plan");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to save the plan item.") };
  }
}

export async function setPlanStatus(id: string, status: string): Promise<Result> {
  try {
    await requireStaff();
    const next = STATUSES.find((s) => s === status);
    if (!next) return { success: false, error: "Unknown status." };
    await prisma.planItem.update({ where: { id }, data: { status: next } });
    revalidatePath("/admin/plan");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to update the status.") };
  }
}

export async function deletePlanItem(id: string): Promise<Result> {
  try {
    await requireStaff();
    await prisma.planItem.delete({ where: { id } });
    revalidatePath("/admin/plan");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to delete the plan item.") };
  }
}
