import type { Metadata } from "next";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { buildMetadata } from "./metadata";
import { getSeoPage } from "./pages";
import { getPageSeo, getSiteSeo } from "./site";

/** The locale from a `[lang]` params promise (the proxy guarantees a valid one). */
export async function localeFromParams(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  return isLocale(lang) ? lang : defaultLocale;
}

/** Metadata for a fixed page (Admin → SEO → Pages), e.g. fixedPageMetadata("about", "hi"). */
export async function fixedPageMetadata(
  key: string,
  locale: Locale,
  options: { noIndex?: boolean } = {},
): Promise<Metadata> {
  const page = getSeoPage(key);
  if (!page) throw new Error(`Unknown SEO page "${key}"`);
  const [site, seo] = await Promise.all([getSiteSeo(), getPageSeo(key, locale)]);
  const defaults = page.defaults[locale];
  return buildMetadata({
    locale,
    path: page.path,
    translated: page.translated,
    site,
    seo,
    auto: { title: defaults.title, description: defaults.description, noIndex: options.noIndex },
  });
}
