import { locales, type Locale } from "@/i18n/config";
import { cleanLine } from "@/lib/validation";

// Server-side cleaning for everything admins type into the SEO screens. Values
// end up in <meta> tags, robots.txt and analytics snippets, so each one is
// trimmed, length-capped and format-checked before it is stored.

export const SEO_LIMITS = {
  title: 255,
  description: 1000,
  keywords: 1000,
  url: 2048,
} as const;

/** SEO overrides for one page, article or category in one language. */
export type SeoFieldsValue = {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  noIndex: boolean;
  noFollow: boolean;
};

export type CleanSeo = {
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
};

export const emptySeoFields: SeoFieldsValue = {
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  canonicalUrl: "",
  noIndex: false,
  noFollow: false,
};

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** A site path ("/about") or an absolute http(s) URL; anything else (javascript:, data:, //host) is rejected. */
export function cleanSeoUrl(value: unknown): Result<string | null> {
  const text = cleanLine(value, SEO_LIMITS.url);
  if (!text) return { ok: true, value: null };
  if (text.startsWith("/") && !text.startsWith("//")) return { ok: true, value: text };
  try {
    const url = new URL(text);
    if (url.protocol === "https:" || url.protocol === "http:") return { ok: true, value: url.toString() };
  } catch {
    // fall through
  }
  return { ok: false, error: "URLs must start with https:// (or be a path on this site starting with /)." };
}

/** Comma-separated keywords, de-duplicated, one line. */
function cleanKeywords(value: unknown) {
  const parts = cleanLine(value, SEO_LIMITS.keywords)
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return [...new Set(parts)].join(", ") || null;
}

export function cleanSeoInput(input: unknown, label = "SEO"): Result<CleanSeo> {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const ogImage = cleanSeoUrl(raw.ogImage);
  if (!ogImage.ok) return { ok: false, error: `${label} share image: ${ogImage.error}` };
  const canonical = cleanSeoUrl(raw.canonicalUrl);
  if (!canonical.ok) return { ok: false, error: `${label} canonical URL: ${canonical.error}` };

  return {
    ok: true,
    value: {
      metaTitle: cleanLine(raw.metaTitle, SEO_LIMITS.title) || null,
      metaDescription: cleanLine(raw.metaDescription, SEO_LIMITS.description) || null,
      keywords: cleanKeywords(raw.keywords),
      ogTitle: cleanLine(raw.ogTitle, SEO_LIMITS.title) || null,
      ogDescription: cleanLine(raw.ogDescription, SEO_LIMITS.description) || null,
      ogImage: ogImage.value,
      canonicalUrl: canonical.value,
      noIndex: raw.noIndex === true,
      noFollow: raw.noFollow === true,
    },
  };
}

/** True when nothing is overridden, so the row can be deleted instead of stored. */
export function isEmptySeo(seo: CleanSeo) {
  return (
    !seo.metaTitle &&
    !seo.metaDescription &&
    !seo.keywords &&
    !seo.ogTitle &&
    !seo.ogDescription &&
    !seo.ogImage &&
    !seo.canonicalUrl &&
    !seo.noIndex &&
    !seo.noFollow
  );
}

/** Cleans `{ en, hi }` SEO input; returns the first error found. */
export function cleanLocalizedSeo(input: unknown): Result<Partial<Record<Locale, CleanSeo>>> {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out: Partial<Record<Locale, CleanSeo>> = {};
  for (const locale of locales) {
    if (!(locale in raw)) continue;
    const cleaned = cleanSeoInput(raw[locale], locale === "en" ? "English" : "Hindi");
    if (!cleaned.ok) return cleaned;
    out[locale] = cleaned.value;
  }
  return { ok: true, value: out };
}

/** A stored SeoMeta row as form values (nulls become empty strings). */
export function toSeoFields(row: Partial<CleanSeo> | null | undefined): SeoFieldsValue {
  return {
    metaTitle: row?.metaTitle ?? "",
    metaDescription: row?.metaDescription ?? "",
    keywords: row?.keywords ?? "",
    ogTitle: row?.ogTitle ?? "",
    ogDescription: row?.ogDescription ?? "",
    ogImage: row?.ogImage ?? "",
    canonicalUrl: row?.canonicalUrl ?? "",
    noIndex: row?.noIndex ?? false,
    noFollow: row?.noFollow ?? false,
  };
}
