import { isLocale, localizePath, type Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { getSiteSeo } from "@/lib/seo/site";
import { absoluteUrl } from "@/lib/seo/structured-data";
import { escapeXml, xmlResponse } from "@/lib/seo/xml";

// /news-sitemap.xml: Google News sitemap of articles published in the last two
// days (Google ignores older ones), in each language they exist in. Listed in
// robots.txt next to the main sitemap; empty while "Allow search engines" is off.
export const dynamic = "force-dynamic";

const WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

export async function GET() {
  const site = await getSiteSeo();
  const entries: string[] = [];

  if (site.allowIndexing) {
    try {
      const articles = await prisma.article.findMany({
        where: { status: "PUBLISHED", publishedAt: { gte: new Date(Date.now() - WINDOW_MS), lte: new Date() } },
        orderBy: { publishedAt: "desc" },
        take: 1000,
        select: {
          id: true,
          slug: true,
          title: true,
          publishedAt: true,
          translations: { select: { locale: true, title: true } },
          seo: { where: { noIndex: true }, select: { locale: true } },
        },
      });

      for (const article of articles) {
        const versions: Array<{ locale: Locale; title: string }> = [
          { locale: "en", title: article.title },
          ...article.translations
            .filter((t): t is typeof t & { locale: Locale } => isLocale(t.locale) && t.locale !== "en")
            .map((t) => ({ locale: t.locale, title: t.title })),
        ];
        const hidden = new Set(article.seo.map((s) => s.locale));
        for (const { locale, title } of versions) {
          if (hidden.has(locale)) continue;
          entries.push(`
  <url>
    <loc>${escapeXml(absoluteUrl(site, localizePath(`/articles/${article.slug}`, locale)))}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(site.siteName[locale])}</news:name>
        <news:language>${locale}</news:language>
      </news:publication>
      <news:publication_date>${article.publishedAt.toISOString()}</news:publication_date>
      <news:title>${escapeXml(title)}</news:title>
    </news:news>
  </url>`);
        }
      }
    } catch (error) {
      console.error("News sitemap: failed to load articles:", error);
    }
  }

  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${entries.join("")}
</urlset>
`);
}
