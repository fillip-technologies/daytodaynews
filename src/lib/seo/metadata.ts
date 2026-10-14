import type { Metadata } from "next";
import { alternates, localeTags, locales, type Locale } from "@/i18n/config";
import { applyTitleTemplate, type SiteSeo } from "./site-config";
import type { CleanSeo } from "./validate";

// Builds the complete metadata for a public page from three layers, most
// specific first:
//   1. the admin's SEO overrides for this page in this language (SeoMeta row),
//   2. the page's own automatic text in this language (title, summary, cover),
//   3. the site-wide defaults from Admin → SEO → Website.
// Every page returns the full set of tags itself, so nothing depends on how
// Next merges nested metadata objects.

type SeoRow = Partial<CleanSeo> | null | undefined;

export type BuildMetadataInput = {
  locale: Locale;
  /** Unprefixed path, e.g. "/articles/my-story" ("/" for home). */
  path: string;
  /** False when the body text exists only in English: canonical → /en, no Hindi alternate. */
  translated?: boolean;
  site: SiteSeo;
  seo?: SeoRow;
  auto: {
    /** Bare page title (the site's title format adds the brand); null → site default title. */
    title: string | null;
    description?: string | null;
    keywords?: string | null;
    image?: string | null;
    /** The page asks not to be indexed (e.g. search results, drafts). */
    noIndex?: boolean;
  };
  type?: "website" | "article";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    section?: string;
  };
};

const ogLocale = (locale: Locale) => localeTags[locale].replace("-", "_");

export function splitKeywords(value: string | null | undefined) {
  const list = (value ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
}

export function buildMetadata({
  locale,
  path,
  translated = true,
  site,
  seo,
  auto,
  type = "website",
  article,
}: BuildMetadataInput): Metadata {
  const pageTitle = auto.title
    ? applyTitleTemplate(site.titleTemplate[locale], auto.title)
    : site.defaultTitle[locale];
  const title = seo?.metaTitle || pageTitle;
  const description = seo?.metaDescription || auto.description || site.defaultDescription[locale] || undefined;
  const keywords = splitKeywords(seo?.keywords || auto.keywords || site.defaultKeywords[locale]);

  const shareTitle = seo?.ogTitle || seo?.metaTitle || auto.title || site.defaultTitle[locale];
  const shareDescription = seo?.ogDescription || description;
  const image = seo?.ogImage || auto.image || site.defaultOgImage || undefined;

  const links = alternates(path, locale, { translated });
  const canonical = seo?.canonicalUrl || links.canonical;

  const index = site.allowIndexing && !seo?.noIndex && !auto.noIndex;
  const follow = site.allowIndexing && !seo?.noFollow;

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical, languages: links.languages },
    robots: { index, follow, googleBot: { index, follow } },
    openGraph: {
      type,
      title: shareTitle,
      description: shareDescription,
      url: canonical,
      siteName: site.siteName[locale],
      locale: ogLocale(locale),
      alternateLocale: translated ? locales.filter((l) => l !== locale).map(ogLocale) : undefined,
      images: image ? [{ url: image }] : undefined,
      ...(type === "article" && article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.authors,
            section: article.section,
            tags: keywords,
          }
        : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      site: site.twitterHandle || undefined,
      creator: site.twitterHandle || undefined,
      title: shareTitle,
      description: shareDescription,
      images: image ? [image] : undefined,
    },
  };
}
