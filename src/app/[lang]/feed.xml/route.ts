import { isLocale, localeTags, localizePath } from "@/i18n/config";
import { getLatestArticles } from "@/lib/articles";
import { feedPath } from "@/lib/seo/metadata";
import { getSiteSeo } from "@/lib/seo/site";
import { absoluteUrl } from "@/lib/seo/structured-data";
import { escapeXml, xmlResponse } from "@/lib/seo/xml";

// /en/feed.xml and /hi/feed.xml: the latest articles as RSS 2.0, for feed
// readers and news aggregators. Linked from every page's <head>. Off (404)
// while "Allow search engines" is off in Admin → SEO.
export const dynamic = "force-dynamic";

const FEED_SIZE = 30;

export async function GET(_request: Request, { params }: RouteContext<"/[lang]/feed.xml">) {
  const { lang } = await params;
  const site = await getSiteSeo();
  if (!isLocale(lang) || !site.allowIndexing) return new Response("Not found", { status: 404 });

  const articles = await getLatestArticles(FEED_SIZE, lang);
  const home = absoluteUrl(site, localizePath("/", lang));
  const name = escapeXml(site.siteName[lang]);
  const logo = site.publisher.logoUrl ? absoluteUrl(site, site.publisher.logoUrl) : null;
  const newest = articles[0] ? new Date(articles[0].date) : new Date();

  const items = articles.map((article) => {
    const url = escapeXml(absoluteUrl(site, localizePath(article.href, lang)));
    return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(article.author)}</dc:creator>
      <category>${escapeXml(article.category)}</category>${
        article.description ? `\n      <description>${escapeXml(article.description)}</description>` : ""
      }
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${name}</title>
    <link>${escapeXml(home)}</link>
    <description>${escapeXml(site.defaultDescription[lang] || site.siteName[lang])}</description>
    <language>${localeTags[lang].toLowerCase()}</language>
    <copyright>© ${new Date().getFullYear()} ${name}</copyright>
    <lastBuildDate>${newest.toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(absoluteUrl(site, feedPath(lang)))}" rel="self" type="application/rss+xml" />${
      logo ? `\n    <image>\n      <url>${escapeXml(logo)}</url>\n      <title>${name}</title>\n      <link>${escapeXml(home)}</link>\n    </image>` : ""
    }${items.join("")}
  </channel>
</rss>
`;

  return xmlResponse(xml, "application/rss+xml");
}
