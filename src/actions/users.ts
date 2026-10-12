"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import type { Role } from "@/generated/prisma";

export type UserMutationResult = {
  success: boolean;
  error?: string;
};

async function requireAdmin() {
  const current = await getCurrentUser();
  if (!current || current.role !== "ADMIN") {
    throw new Error("Unauthorized: Super Admin access required.");
  }
  return current;
}

export async function createUser(data: {
  name: string;
  email: string;
  role: Role;
  password?: string;
  bio?: string;
}): Promise<UserMutationResult> {
  try {
    await requireAdmin();

    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const role = data.role;
    const bio = data.bio?.trim() || null;

    if (!name || !email) {
      return { success: false, error: "Name and email are required." };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "A user with this email already exists." };
    }

    const passwordHash = data.password?.trim()
      ? await hashPassword(data.password.trim())
      : null;

    await prisma.user.create({
      data: {
        name,
        email,
        role,
        bio,
        passwordHash,
        isActive: true,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create user." };
  }
}

export async function updateUser(data: {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio?: string;
  isActive?: boolean;
  newPassword?: string;
}): Promise<UserMutationResult> {
  try {
    await requireAdmin();

    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const role = data.role;
    const bio = data.bio?.trim() || null;

    if (!name || !email) {
      return { success: false, error: "Name and email are required." };
    }

    const existing = await prisma.user.findUnique({ where: { id: data.id } });
    if (!existing) {
      return { success: false, error: "User not found." };
    }

    // Check email uniqueness if email changed
    if (email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return { success: false, error: "Email is already taken by another user." };
      }
    }

    const updatePayload: any = {
      name,
      email,
      role,
      bio,
      isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
    };

    if (data.newPassword && data.newPassword.trim()) {
      updatePayload.passwordHash = await hashPassword(data.newPassword.trim());
    }

    await prisma.user.update({
      where: { id: data.id },
      data: updatePayload,
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update user." };
  }
}

export async function deleteUser(id: string): Promise<UserMutationResult> {
  try {
    const current = await requireAdmin();

    if (current.id === id) {
      return { success: false, error: "You cannot delete your own admin account." };
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete user." };
  }
}
