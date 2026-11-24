// Which articles readers may see.
//
// SCHEDULING_ENABLED decides what a PUBLISHED article with a future publish
// date does:
//   false (now): it shows right away, with its date, as the site always did.
//   true: it is "scheduled": hidden from every public page, feed and sitemap
//         until that moment (pages refresh every few minutes, see
//         app/[lang]/layout.tsx); staff can still preview it.
//
// It is off because many existing articles carry December 2026 dates. Fix
// those dates first (`npm run fix:dates`, see scripts/fix-future-dates.ts),
// then switch this on so new future-dated articles are scheduled.
export const SCHEDULING_ENABLED = false;

/** Prisma filter for articles that are live on the site right now. */
export function liveArticleWhere() {
  return SCHEDULING_ENABLED
    ? { status: "PUBLISHED" as const, publishedAt: { lte: new Date() } }
    : { status: "PUBLISHED" as const };
}

/** Whether one article is live on the site right now. */
export function isLiveArticle(article: { status: string; publishedAt: Date }) {
  return article.status === "PUBLISHED" && (!SCHEDULING_ENABLED || article.publishedAt.getTime() <= Date.now());
}

/** Published but held back until its future date (only while scheduling is on). */
export function isScheduledArticle(article: { status: string; publishedAt: Date }) {
  return SCHEDULING_ENABLED && article.status === "PUBLISHED" && article.publishedAt.getTime() > Date.now();
}

/**
 * The date shown as "Updated": the last meaningful edit, when it came at least a
 * day after publishing (a same-day typo fix is not an update for readers).
 */
export function meaningfulUpdate(article: { publishedAt: Date; contentUpdatedAt?: Date | null }): Date | null {
  const updated = article.contentUpdatedAt;
  if (!updated) return null;
  return updated.getTime() - article.publishedAt.getTime() >= 24 * 60 * 60 * 1000 ? updated : null;
}

/** dateModified for structured data and the sitemap: the last meaningful edit, else the publish date. */
export function modifiedDate(article: { publishedAt: Date; contentUpdatedAt?: Date | null }): Date {
  const updated = article.contentUpdatedAt;
  return updated && updated > article.publishedAt ? updated : article.publishedAt;
}
