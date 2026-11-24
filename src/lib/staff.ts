import { getCurrentUser, type UserSession } from "@/lib/auth";

/** The signed-in staff member (admin or editor), or an error for anyone else. */
export async function requireStaff(): Promise<UserSession> {
  const current = await getCurrentUser();
  if (!current || (current.role !== "ADMIN" && current.role !== "EDITOR")) {
    throw new Error("Unauthorized: staff access required.");
  }
  return current;
}

/** Admins only (site-wide settings such as integrations and ads). */
export async function requireAdmin(): Promise<UserSession> {
  const current = await requireStaff();
  if (current.role !== "ADMIN") throw new Error("Only administrators can change this.");
  return current;
}

/** "Unauthorized…" and other thrown errors as a short message for the admin UI. */
export const errorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);
