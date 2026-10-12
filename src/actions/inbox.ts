"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { SubmissionStatus, PitchStatus } from "@/generated/prisma";

async function requireStaff() {
  const current = await getCurrentUser();
  if (!current || (current.role !== "ADMIN" && current.role !== "EDITOR")) {
    throw new Error("Unauthorized: Staff access required.");
  }
}

export async function updateContactStatus(id: string, status: SubmissionStatus) {
  try {
    await requireStaff();
    await prisma.contactSubmission.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/inbox");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function deleteContactSubmission(id: string) {
  try {
    await requireStaff();
    await prisma.contactSubmission.delete({
      where: { id },
    });
    revalidatePath("/admin/inbox");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function updatePitchStatus(id: string, status: PitchStatus) {
  try {
    await requireStaff();
    await prisma.contributorPitch.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/inbox");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function deleteContributorPitch(id: string) {
  try {
    await requireStaff();
    await prisma.contributorPitch.delete({
      where: { id },
    });
    revalidatePath("/admin/inbox");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function deleteNewsletterSubscriber(id: string) {
  try {
    await requireStaff();
    await prisma.newsletterSubscriber.delete({
      where: { id },
    });
    revalidatePath("/admin/inbox");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
