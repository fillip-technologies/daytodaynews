import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getJwtSecret } from "@/lib/session-secret";

export const SESSION_COOKIE_NAME = "admin_session";

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
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
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
 * Reads the session cookie and returns the user only while they still exist, are
 * active and are staff in the database. Fails closed: a deactivated or deleted
 * user, or a database error, ends the session even though the token is valid.
 * (Matching by email too keeps sessions working if ids changed after reseeding.)
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

    if (user && user.isActive && (user.role === "ADMIN" || user.role === "EDITOR")) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
    return null;
  } catch (error) {
    console.error("Error retrieving current user from database:", error);
    return null;
  }
}
