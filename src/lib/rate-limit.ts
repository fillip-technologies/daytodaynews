import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getJwtSecret } from "@/lib/session-secret";

// Fixed-window rate limits stored in the database, so they hold across server
// instances and restarts. Subjects (IPs, emails) are stored only as keyed
// hashes, never in plain text.

/** The client IP as reported by the proxy in front of the app, or "unknown". */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
}

function keyFor(action: string, subject: string) {
  const digest = createHmac("sha256", getJwtSecret()).update(subject.toLowerCase()).digest("hex");
  return `${action}:${digest.slice(0, 48)}`;
}

/**
 * Counts one attempt of `action` by `subject`. Returns false (blocked) once
 * `limit` attempts were made within `windowMs`. Database errors let the
 * request through: an outage must not lock every reader out of the forms.
 */
export async function rateLimit(action: string, subject: string, limit: number, windowMs: number) {
  const key = keyFor(action, subject);
  const now = new Date();
  try {
    const row = await prisma.rateLimit.findUnique({ where: { key } });
    if (!row || row.resetAt <= now) {
      const resetAt = new Date(now.getTime() + windowMs);
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      // Occasionally sweep expired windows so the table stays small.
      if (Math.random() < 0.02) {
        prisma.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }).catch(() => {});
      }
      return true;
    }
    if (row.count >= limit) return false;
    await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
    return true;
  } catch (error) {
    console.error(`Rate limit check failed for "${action}":`, error);
    return true;
  }
}

/** Forgets the attempts of `action` by `subject` (e.g. after a successful login). */
export async function clearRateLimit(action: string, subject: string) {
  await prisma.rateLimit.deleteMany({ where: { key: keyFor(action, subject) } }).catch(() => {});
}
