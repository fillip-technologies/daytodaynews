import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "admin_session";
const JWT_SECRET_STRING = process.env.JWT_SECRET || "daytodaynews_secret_jwt_key_2026_super_secure_random";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export type UserSession = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.id || !payload.email || !payload.role) {
      return null;
    }
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name || ""),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}

/**
 * Reads the session cookie and verifies the user exists in MariaDB.
 * Recovers seamlessly if IDs shifted during database seeding, and falls back to verified JWT payload.
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.id },
          { email: session.email },
        ],
        isActive: true,
      },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (user && user.isActive) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }

    // If verified JWT belongs to staff, preserve active session
    if (session.role === "ADMIN" || session.role === "EDITOR") {
      return session;
    }

    return null;
  } catch (error) {
    console.error("Error retrieving current user from database:", error);
    if (session.role === "ADMIN" || session.role === "EDITOR") {
      return session;
    }
    return null;
  }
}
