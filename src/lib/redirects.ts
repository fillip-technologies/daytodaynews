import { notFound, permanentRedirect } from "next/navigation";
import { localizePath, type Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";

// Permanent redirects from Admin → Redirects (and the ones made automatically
// when an article's slug changes). They are only consulted when a page is not
// found, so they never shadow a live page.

/** "/Articles/Old/" → "/Articles/Old": one form for stored and looked-up paths. */
export function normalizeRedirectPath(path: string): string {
  let clean = path.trim().split(/[?#]/)[0];
  if (!clean.startsWith("/")) clean = `/${clean}`;
  clean = clean.replace(/\/{2,}/g, "/");
  if (clean.length > 1) clean = clean.replace(/\/+$/, "");
  // A path typed with its language ("/en/articles/x") applies to every language.
  clean = clean.replace(/^\/(en|hi)(?=\/|$)/, "") || "/";
  return clean;
}

/** The target of a redirect from `path`, or null. Counts the hit. */
export async function findRedirect(path: string): Promise<string | null> {
  const fromPath = normalizeRedirectPath(path);
  try {
    const redirect = await prisma.redirect.findUnique({ where: { fromPath } });
    if (!redirect) return null;
    prisma.redirect.update({ where: { id: redirect.id }, data: { hits: { increment: 1 } } }).catch(() => {});
    return redirect.toPath;
  } catch (error) {
    console.error(`Redirect lookup failed for "${fromPath}":`, error);
    return null;
  }
}

/**
 * For a page that doesn't exist: follow a stored redirect (keeping the reader's
 * language for site paths) or show the 404 page.
 */
export async function redirectOrNotFound(path: string, locale: Locale): Promise<never> {
  const target = await findRedirect(path);
  if (target) {
    permanentRedirect(target.startsWith("/") ? localizePath(target, locale) : target);
  }
  notFound();
}

/**
 * After an article or listing moves from `oldPath` to `newPath`: send the old
 * address to the new one, re-point redirects that led to the old address (no
 * chains), and drop any redirect away from the new address.
 */
export async function recordMove(oldPath: string, newPath: string, note: string) {
  const from = normalizeRedirectPath(oldPath);
  const to = normalizeRedirectPath(newPath);
  if (from === to) return;
  await prisma.$transaction([
    prisma.redirect.deleteMany({ where: { fromPath: to } }),
    prisma.redirect.updateMany({ where: { toPath: from }, data: { toPath: to } }),
    prisma.redirect.upsert({
      where: { fromPath: from },
      update: { toPath: to, note },
      create: { fromPath: from, toPath: to, note },
    }),
  ]);
}
