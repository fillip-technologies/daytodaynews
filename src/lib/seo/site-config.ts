import { locales, type Locale } from "@/i18n/config";
import { cleanLine } from "@/lib/validation";
import { cleanSeoUrl, SEO_LIMITS } from "./validate";

// Site-wide SEO settings: shape, defaults and cleaning. Stored as JSON in the
// SiteSetting table (key SITE_SEO_KEY). Pure module, safe for client components.

export const SITE_SEO_KEY = "seo_site";

export type LocalizedText = Record<Locale, string>;

export type SiteSeo = {
  /** Public origin used for canonical, Open Graph and sitemap URLs. */
  siteUrl: string;
  siteName: LocalizedText;
  /** Applied to automatic page titles; must contain %s. */
  titleTemplate: LocalizedText;
  /** Home page title, and the fallback when a page has none. */
  defaultTitle: LocalizedText;
  defaultDescription: LocalizedText;
  defaultKeywords: LocalizedText;
  defaultOgImage: string;
  /** "@handle", or empty. */
  twitterHandle: string;
  /** Off = every page noindex and robots.txt disallows everything (e.g. staging). */
  allowIndexing: boolean;
  /** Extra robots.txt Disallow paths. */
  robotsDisallow: string[];
  verification: { google: string; bing: string };
  analytics: { gaId: string; gtmId: string };
};

const both = (en: string, hi: string): LocalizedText => ({ en, hi });

export const defaultSiteSeo: SiteSeo = {
  siteUrl: "http://localhost:3000",
  siteName: both("DayTodayNews", "DayTodayNews"),
  titleTemplate: both("%s — DayTodayNews", "%s — DayTodayNews"),
  defaultTitle: both("DayTodayNews", "DayTodayNews"),
  defaultDescription: both(
    "AI, software development and technology insights for founders, CTOs and technology teams.",
    "फ़ाउंडर्स, CTO और टेक्नोलॉजी टीमों के लिए AI, सॉफ़्टवेयर डेवलपमेंट और टेक्नोलॉजी से जुड़ी काम की जानकारी।",
  ),
  defaultKeywords: both("", ""),
  defaultOgImage: "",
  twitterHandle: "",
  allowIndexing: true,
  robotsDisallow: [],
  verification: { google: "", bing: "" },
  analytics: { gaId: "", gtmId: "" },
};

const GA_ID = /^G-[A-Z0-9]{4,20}$/;
const GTM_ID = /^GTM-[A-Z0-9]{4,20}$/;
const VERIFICATION = /^[A-Za-z0-9_\-.:=]{1,200}$/;
const TWITTER = /^@?[A-Za-z0-9_]{1,15}$/;

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function siteOrigin(value: unknown): string | null {
  const text = cleanLine(value, SEO_LIMITS.url);
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : null;
  } catch {
    return null;
  }
}

/** Per-language text; `required` fields fall back instead of being left empty. */
function localized(value: unknown, maxLength: number, fallback: LocalizedText, required = false): LocalizedText {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return Object.fromEntries(
    locales.map((l) => {
      const text = raw[l] === undefined ? fallback[l] : cleanLine(raw[l], maxLength);
      return [l, required && !text ? fallback[l] : text];
    }),
  ) as LocalizedText;
}

function disallowPaths(value: unknown): string[] {
  const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\r?\n/) : [];
  const paths = list
    .map((p) => cleanLine(p, 200).replace(/\s+/g, ""))
    .filter((p) => p.startsWith("/") && !p.startsWith("//"));
  return [...new Set(paths)].slice(0, 50);
}

/**
 * Strict cleaning for an admin save. Rejects values that would produce broken
 * tags or could inject markup (IDs and codes must match their formats).
 */
export function cleanSiteSeo(input: unknown, current: SiteSeo): Result<SiteSeo> {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

  const siteUrl = siteOrigin(raw.siteUrl);
  if (!siteUrl) return { ok: false, error: "Site URL must be a full address, e.g. https://www.daytodaynews.com" };

  const titleTemplate = localized(raw.titleTemplate, 120, current.titleTemplate, true);
  for (const l of locales) {
    if (!titleTemplate[l].includes("%s")) {
      return { ok: false, error: "Title format must contain %s where the page title goes." };
    }
  }

  const ogImage = cleanSeoUrl(raw.defaultOgImage);
  if (!ogImage.ok) return { ok: false, error: `Default share image: ${ogImage.error}` };

  const twitter = cleanLine(raw.twitterHandle, 16);
  if (twitter && !TWITTER.test(twitter)) return { ok: false, error: "Twitter/X handle can only contain letters, numbers and _." };

  const verificationRaw = (raw.verification ?? {}) as Record<string, unknown>;
  const google = cleanLine(verificationRaw.google, 200);
  const bing = cleanLine(verificationRaw.bing, 200);
  if ((google && !VERIFICATION.test(google)) || (bing && !VERIFICATION.test(bing))) {
    return { ok: false, error: "Verification codes can only contain letters, numbers and - _ . : =" };
  }

  const analyticsRaw = (raw.analytics ?? {}) as Record<string, unknown>;
  const gaId = cleanLine(analyticsRaw.gaId, 30).toUpperCase();
  const gtmId = cleanLine(analyticsRaw.gtmId, 30).toUpperCase();
  if (gaId && !GA_ID.test(gaId)) return { ok: false, error: "Google Analytics ID must look like G-XXXXXXXXXX." };
  if (gtmId && !GTM_ID.test(gtmId)) return { ok: false, error: "Tag Manager ID must look like GTM-XXXXXXX." };

  return {
    ok: true,
    value: {
      siteUrl,
      siteName: localized(raw.siteName, 100, current.siteName, true),
      titleTemplate,
      defaultTitle: localized(raw.defaultTitle, SEO_LIMITS.title, current.defaultTitle, true),
      defaultDescription: localized(raw.defaultDescription, SEO_LIMITS.description, current.defaultDescription),
      defaultKeywords: localized(raw.defaultKeywords, SEO_LIMITS.keywords, current.defaultKeywords),
      defaultOgImage: ogImage.value ?? "",
      twitterHandle: twitter ? `@${twitter.replace(/^@/, "")}` : "",
      allowIndexing: raw.allowIndexing !== false,
      robotsDisallow: disallowPaths(raw.robotsDisallow),
      verification: { google, bing },
      analytics: { gaId, gtmId },
    },
  };
}

/**
 * Lenient reading of stored JSON: anything missing or invalid falls back to
 * the default, so a bad row can never break page rendering.
 */
export function normalizeSiteSeo(stored: unknown, fallbackUrl: string): SiteSeo {
  const defaults = { ...defaultSiteSeo, siteUrl: siteOrigin(fallbackUrl) ?? defaultSiteSeo.siteUrl };
  if (!stored || typeof stored !== "object") return defaults;
  const raw = stored as Record<string, unknown>;
  const cleaned = cleanSiteSeo({ ...defaults, ...raw, siteUrl: raw.siteUrl || defaults.siteUrl }, defaults);
  return cleaned.ok ? cleaned.value : defaults;
}

/** Applies a title template ("%s — DayTodayNews") to a page title. */
export function applyTitleTemplate(template: string, title: string) {
  return template.includes("%s") ? template.replace("%s", title) : title;
}
