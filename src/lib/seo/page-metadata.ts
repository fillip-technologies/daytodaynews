import type { Metadata } from "next";
import { defaultLocale, isLocale, localeTags, localizePath, type Locale } from "@/i18n/config";
import { isPageTranslated } from "@/lib/page-content";
import { getPageSchema } from "@/lib/page-defaults";
import { getPageContent } from "@/lib/settings";
import { buildMetadata, canonicalPath } from "./metadata";
import { getSeoPage, type SeoPage } from "./pages";
import { getPageSeo, getSiteSeo } from "./site";
import { absoluteUrl, breadcrumbList, graph, webPageNode } from "./structured-data";

/** The locale from a `[lang]` params promise (the proxy guarantees a valid one). */
export async function localeFromParams(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  return isLocale(lang) ? lang : defaultLocale;
}

/**
 * Whether a fixed page has its own Hindi version. Pages edited under Admin →
 * Pages have one once all their Hindi text is filled in; the rest use the flag
 * in lib/seo/pages.
 */
export async function isFixedPageTranslated(page: SeoPage): Promise<boolean> {
  const schema = getPageSchema(page.key);
  return schema ? isPageTranslated(schema, await getPageContent(page.key)) : page.translated;
}

/** Metadata for a fixed page (Admin → SEO → Pages), e.g. fixedPageMetadata("about", "hi"). */
export async function fixedPageMetadata(
  key: string,
  locale: Locale,
  options: { noIndex?: boolean } = {},
): Promise<Metadata> {
  const page = getSeoPage(key);
  if (!page) throw new Error(`Unknown SEO page "${key}"`);
  const [site, seo, translated] = await Promise.all([getSiteSeo(), getPageSeo(key, locale), isFixedPageTranslated(page)]);
  const defaults = page.defaults[locale];
  return buildMetadata({
    locale,
    path: page.path,
    translated,
    site,
    seo,
    auto: { title: defaults.title, description: defaults.description, noIndex: options.noIndex },
  });
}

/** schema.org type of each fixed page; the rest are plain WebPages. */
const pageTypes: Record<string, string> = {
  about: "AboutPage",
  contact: "ContactPage",
  blog: "CollectionPage",
};

/**
 * Structured data for a fixed page: the page itself (named and described as in
 * its meta tags) and its breadcrumb. The site-wide graph comes from the layout.
 */
export async function fixedPageGraph(key: string, locale: Locale) {
  const page = getSeoPage(key);
  if (!page) return null;
  const [site, seo, translated] = await Promise.all([getSiteSeo(), getPageSeo(key, locale), isFixedPageTranslated(page)]);
  const defaults = page.defaults[locale];
  const url = absoluteUrl(site, canonicalPath(page.path, locale, translated, seo));
  const name = seo?.ogTitle || seo?.metaTitle || defaults.title || site.defaultTitle[locale];
  return graph(
    webPageNode(site, {
      type: pageTypes[key] ?? "WebPage",
      url,
      name,
      description: seo?.metaDescription || defaults.description || site.defaultDescription[locale],
      // An untranslated page's text is English on both URLs.
      inLanguage: localeTags[translated ? locale : "en"],
    }),
    breadcrumbList([
      { name: site.siteName[locale], url: absoluteUrl(site, localizePath("/", locale)) },
      { name, url },
    ]),
  );
}
