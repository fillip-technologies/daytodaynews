"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  comparePassword,
  signSessionToken,
} from "@/lib/auth";

export type LoginResult = {
  success: boolean;
  error?: string;
};

export async function loginAdmin(values: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  const email = values.email?.trim().toLowerCase();
  const password = values.password;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive || !user.passwordHash) {
      return { success: false, error: "Invalid email or password." };
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Invalid email or password." };
    }

    if (user.role !== "ADMIN" && user.role !== "EDITOR") {
      return { success: false, error: "Access denied. Insufficient staff permissions." };
    }

    const token = await signSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An unexpected error occurred during login." };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
