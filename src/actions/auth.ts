"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  comparePassword,
  signSessionToken,
} from "@/lib/auth";
import { clearRateLimit, clientIp, rateLimit } from "@/lib/rate-limit";

export type LoginResult = {
  success: boolean;
  error?: string;
};

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Compared against when the email is unknown, so a wrong email takes as long as
// a wrong password and response times don't reveal which accounts exist.
const DUMMY_HASH = "$2b$10$tLIp0Rt/UD66U7M5HTBJoOot7JsEo.ulTw2eVsdw9aBJuZ.tNiM1S";

export async function loginAdmin(values: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  const email = values.email?.trim().toLowerCase().slice(0, 254);
  const password = values.password?.slice(0, 200);

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  // Brute-force protection: 5 tries per account per connection, 20 per connection.
  const ip = await clientIp();
  const allowed =
    (await rateLimit("login-ip", ip, 20, FIFTEEN_MINUTES)) &&
    (await rateLimit("login", `${ip}|${email}`, 5, FIFTEEN_MINUTES));
  if (!allowed) {
    return { success: false, error: "Too many login attempts. Please wait 15 minutes and try again." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const isMatch = await comparePassword(password, user?.passwordHash || DUMMY_HASH);

    if (!user || !user.isActive || !user.passwordHash || !isMatch) {
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

    await clearRateLimit("login", `${ip}|${email}`);
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
