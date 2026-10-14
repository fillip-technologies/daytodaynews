import type { Locale } from "@/i18n/config";
import { isEmptySeo, type CleanSeo } from "./validate";

// Prisma nested writes for the SEO rows of an article or category, so they are
// saved in the same query as the article/category itself.

type LocalizedSeo = Partial<Record<Locale, CleanSeo>>;

/** For a new article/category: create rows only for languages with overrides. */
export function seoCreate(seo: LocalizedSeo) {
  const rows = (Object.entries(seo) as Array<[Locale, CleanSeo]>)
    .filter(([, value]) => !isEmptySeo(value))
    .map(([locale, value]) => ({ locale, ...value }));
  return rows.length ? { create: rows } : undefined;
}

/**
 * For an existing article/category: upsert languages with overrides and delete
 * the ones whose fields were all cleared. Languages not sent are left alone.
 */
export function seoUpdate(seo: LocalizedSeo, owner: { articleId: string } | { topicId: string }) {
  const entries = Object.entries(seo) as Array<[Locale, CleanSeo]>;
  if (entries.length === 0) return undefined;
  const cleared = entries.filter(([, value]) => isEmptySeo(value)).map(([locale]) => locale);
  const kept = entries.filter(([, value]) => !isEmptySeo(value));
  const whereFor = (locale: Locale) =>
    "articleId" in owner
      ? { articleId_locale: { articleId: owner.articleId, locale } }
      : { topicId_locale: { topicId: owner.topicId, locale } };
  return {
    ...(cleared.length ? { deleteMany: { locale: { in: cleared } } } : {}),
    ...(kept.length
      ? {
          upsert: kept.map(([locale, value]) => ({
            where: whereFor(locale),
            update: value,
            create: { locale, ...value },
          })),
        }
      : {}),
  };
}
