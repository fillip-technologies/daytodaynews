import type { MetadataRoute } from "next";
import { isLocale, locales, localizePath, type Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { seoPages } from "@/lib/seo/pages";
import { getSiteSeo } from "@/lib/seo/site";

// /sitemap.xml: every indexable public URL in each language it exists in, with
// hreflang alternates. Built per request so new articles and SEO changes in
// admin show up immediately. Empty while "Allow search engines" is off.
export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteSeo();
  if (!site.allowIndexing) return [];

  const absolute = (path: string, locale: Locale) => new URL(localizePath(path, locale), site.siteUrl).toString();

  let topics: Array<{ id: string; slug: string; updatedAt: Date }> = [];
  let articles: Array<{ id: string; slug: string; updatedAt: Date; translations: Array<{ locale: string }> }> = [];
  let hidden = new Set<string>();
  try {
    const [topicRows, articleRows, noIndexRows] = await Promise.all([
      prisma.topic.findMany({ select: { id: true, slug: true, updatedAt: true } }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: { id: true, slug: true, updatedAt: true, translations: { select: { locale: true } } },
      }),
      prisma.seoMeta.findMany({
        where: { noIndex: true },
        select: { pageKey: true, articleId: true, topicId: true, locale: true },
      }),
    ]);
    topics = topicRows;
    articles = articleRows;
    hidden = new Set(noIndexRows.map((r) => `${r.pageKey ?? r.articleId ?? r.topicId}:${r.locale}`));
  } catch (error) {
    console.error("Sitemap: failed to load articles/categories, listing fixed pages only:", error);
  }

  const entries: Entry[] = [];

  /** Adds `path` in each language it is visible in, cross-linked as alternates. */
  function add(path: string, pageLocales: Locale[], id: string, extra: Omit<Entry, "url" | "alternates">) {
    const visible = pageLocales.filter((l) => !hidden.has(`${id}:${l}`));
    const languages =
      visible.length > 1 ? Object.fromEntries(visible.map((l) => [l, absolute(path, l)])) : undefined;
    for (const locale of visible) {
      entries.push({ url: absolute(path, locale), alternates: languages ? { languages } : undefined, ...extra });
    }
  }

  for (const page of seoPages) {
    if (page.hideFromSitemap) continue;
    // English-only pages point their Hindi copy at English, so only /en is listed.
    add(page.path, page.translated ? [...locales] : ["en"], page.key, {
      changeFrequency: page.key === "home" ? "daily" : "monthly",
      priority: page.key === "home" ? 1 : 0.5,
    });
  }

  for (const topic of topics) {
    add(`/category/${topic.slug}`, [...locales], topic.id, {
      lastModified: topic.updatedAt,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  for (const article of articles) {
    // An article's Hindi URL only counts once it has a Hindi version (matches its canonical).
    const articleLocales: Locale[] = [
      "en",
      ...article.translations.map((t) => t.locale).filter((l): l is Locale => isLocale(l) && l !== "en"),
    ];
    add(`/articles/${article.slug}`, articleLocales, article.id, {
      lastModified: article.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}
