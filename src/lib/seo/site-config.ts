import { socialNetworks, type SocialNetwork } from "@/config/footerNavigation";
import { locales, type Locale } from "@/i18n/config";
import { cleanLine, isEmail } from "@/lib/validation";
import { cleanSeoUrl, SEO_LIMITS } from "./validate";

// Site-wide SEO settings: shape, defaults and cleaning. Stored as JSON in the
// SiteSetting table (key SITE_SEO_KEY). Pure module, safe for client components.

export const SITE_SEO_KEY = "seo_site";

export type LocalizedText = Record<Locale, string>;

export const articleSchemaTypes = ["NewsArticle", "BlogPosting", "Article"] as const;
export type ArticleSchemaType = (typeof articleSchemaTypes)[number];

/** Allowed display heights in CSS pixels; the header ones keep the logo inside the header bar. */
export const LOGO_HEIGHT_LIMITS = {
  header: { min: 24, max: 60 },
  headerMobile: { min: 24, max: 56 },
  footer: { min: 24, max: 120 },
  credit: { min: 16, max: 64 },
} as const;

export type LogoSize = { header: number; headerMobile: number; footer: number };

/** The publication itself (its name is `siteName`): logo, structured data, footer socials, RSS. */
export type PublisherSettings = {
  /** Site path or https URL. Shown in the header and footer, and given to Google and feed readers. */
  logoUrl: string;
  /** The logo file's own size in pixels (read in admin when it is set), for its proportions. */
  logoWidth: number;
  logoHeight: number;
  /** Displayed heights in CSS pixels: header on wider screens, header on phones, footer. */
  logoSize: LogoSize;
  email: string;
  /** "2025" or "2025-01-15", or empty. */
  foundingDate: string;
  /** Footer icons and structured-data profiles; empty networks are hidden. */
  socials: Record<SocialNetwork, string>;
  /** Other official profiles (Google News, Facebook, Crunchbase…), https URLs. */
  sameAs: string[];
  /** schema.org type of every article page. */
  articleType: ArticleSchemaType;
};

/**
 * The company that designs and manages the website. With a name and website it
 * is named as the site's creator in structured data, page meta tags and llms.txt;
 * the toggles add the visible credits.
 */
export type DeveloperSettings = {
  name: string;
  url: string;
  logoUrl: string;
  /** Height of the logo in the footer credit, CSS pixels. */
  logoHeight: number;
  /** Words before the logo in the footer, e.g. "Designed & Managed by". */
  creditLabel: LocalizedText;
  description: LocalizedText;
  /** The company's own official profiles, https URLs. */
  sameAs: string[];
  /** The company owns the publication (parent organization in structured data). */
  ownsSite: boolean;
  showInFooter: boolean;
  showOnAbout: boolean;
};

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
  publisher: PublisherSettings;
  developer: DeveloperSettings;
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
  publisher: {
    logoUrl: "/brand/day-to-day-news-logo.png",
    logoWidth: 1589,
    logoHeight: 989,
    logoSize: { header: 56, headerMobile: 48, footer: 56 },
    email: "",
    foundingDate: "",
    socials: { linkedin: "", x: "", instagram: "", youtube: "" },
    sameAs: [],
    articleType: "NewsArticle",
  },
  developer: {
    name: "Fillip Technologies",
    url: "https://filliptechnologies.com/",
    logoUrl: "/brand/fillip-technologies-logo.png",
    logoHeight: 28,
    creditLabel: both("Designed & Managed by", "डिज़ाइन एवं प्रबंधन"),
    description: both(
      "Fillip Technologies is an IT service provider based in Patna, India, offering web and mobile app development, custom software, AI automation and chatbots, SEO and digital marketing, and creative design.",
      "Fillip Technologies पटना (भारत) स्थित एक IT सर्विस प्रोवाइडर है, जो वेब और मोबाइल ऐप डेवलपमेंट, कस्टम सॉफ़्टवेयर, AI ऑटोमेशन और चैटबॉट, SEO व डिजिटल मार्केटिंग और क्रिएटिव डिज़ाइन सेवाएँ देती है।",
    ),
    sameAs: [
      "https://linkedin.com/company/fillip-technologies",
      "https://facebook.com/FillipTechnologies",
      "https://instagram.com/filliptechnologies",
      "https://x.com/Fillip_Tech",
      "https://www.threads.com/@filliptechnologies",
      "https://youtube.com/channel/UCR7oww-nQszfqAsf19T2UtQ",
    ],
    ownsSite: false,
    showInFooter: true,
    showOnAbout: true,
  },
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

const FOUNDING_DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

/** An absolute http(s) address, or "" when empty. */
function webUrl(value: unknown, label: string): Result<string> {
  const text = cleanLine(value, SEO_LIMITS.url);
  if (!text) return { ok: true, value: "" };
  try {
    const url = new URL(text);
    if (url.protocol === "https:" || url.protocol === "http:") return { ok: true, value: url.toString() };
  } catch {
    // fall through
  }
  return { ok: false, error: `${label} must be a full address starting with https://` };
}

/** Profile addresses, as a list or one per line; blank lines are skipped. */
function webUrls(value: unknown, label: string): Result<string[]> {
  const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\r?\n/) : [];
  const urls: string[] = [];
  for (const item of list) {
    const url = webUrl(item, `${label}: "${cleanLine(item, 60)}"`);
    if (!url.ok) return url;
    if (url.value) urls.push(url.value);
  }
  return { ok: true, value: [...new Set(urls)].slice(0, 20) };
}

/** A logo: a path on this site or an https URL. */
function logoUrl(value: unknown, label: string): Result<string> {
  const url = cleanSeoUrl(value);
  return url.ok ? { ok: true, value: url.value ?? "" } : { ok: false, error: `${label}: ${url.error}` };
}

/** A whole number within `limits`; anything else keeps `fallback`. */
function clampInt(value: unknown, limits: { min: number; max: number }, fallback: number) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(limits.max, Math.max(limits.min, n)) : fallback;
}

const PIXEL_SIZE = { min: 1, max: 20000 };

function cleanPublisher(input: unknown, current: PublisherSettings): Result<PublisherSettings> {
  const raw = { ...current, ...(input && typeof input === "object" ? input : {}) } as Record<string, unknown>;

  const logo = logoUrl(raw.logoUrl, "Site logo");
  if (!logo.ok) return logo;
  // The header always needs a logo: an emptied field goes back to the bundled one.
  const fallbackLogo = defaultSiteSeo.publisher;
  const logoFile = logo.value
    ? {
        logoUrl: logo.value,
        logoWidth: clampInt(raw.logoWidth, PIXEL_SIZE, current.logoWidth),
        logoHeight: clampInt(raw.logoHeight, PIXEL_SIZE, current.logoHeight),
      }
    : { logoUrl: fallbackLogo.logoUrl, logoWidth: fallbackLogo.logoWidth, logoHeight: fallbackLogo.logoHeight };

  const sizeRaw = (raw.logoSize && typeof raw.logoSize === "object" ? raw.logoSize : {}) as Record<string, unknown>;
  const logoSize: LogoSize = {
    header: clampInt(sizeRaw.header, LOGO_HEIGHT_LIMITS.header, current.logoSize.header),
    headerMobile: clampInt(sizeRaw.headerMobile, LOGO_HEIGHT_LIMITS.headerMobile, current.logoSize.headerMobile),
    footer: clampInt(sizeRaw.footer, LOGO_HEIGHT_LIMITS.footer, current.logoSize.footer),
  };

  const email = cleanLine(raw.email, 254).toLowerCase();
  if (email && !isEmail(email)) return { ok: false, error: "Publisher email is not a valid address." };

  const foundingDate = cleanLine(raw.foundingDate, 10);
  if (foundingDate && !FOUNDING_DATE.test(foundingDate)) {
    return { ok: false, error: "Founded must be a year (2025) or a date (2025-01-15)." };
  }

  const socialsRaw = (raw.socials && typeof raw.socials === "object" ? raw.socials : {}) as Record<string, unknown>;
  const socials = { ...current.socials };
  for (const network of socialNetworks) {
    const url = webUrl(socialsRaw[network] ?? current.socials[network], `${network} profile`);
    if (!url.ok) return url;
    socials[network] = url.value;
  }

  const sameAs = webUrls(raw.sameAs, "Other profiles");
  if (!sameAs.ok) return sameAs;

  const articleType = articleSchemaTypes.find((type) => type === raw.articleType) ?? current.articleType;

  return {
    ok: true,
    value: { ...logoFile, logoSize, email, foundingDate, socials, sameAs: sameAs.value, articleType },
  };
}

function cleanDeveloper(input: unknown, current: DeveloperSettings): Result<DeveloperSettings> {
  const raw = { ...current, ...(input && typeof input === "object" ? input : {}) } as Record<string, unknown>;

  const name = cleanLine(raw.name, 100);
  const url = webUrl(raw.url, "Company website");
  if (!url.ok) return url;
  const logo = logoUrl(raw.logoUrl, "Company logo");
  if (!logo.ok) return logo;
  const sameAs = webUrls(raw.sameAs, "Company profiles");
  if (!sameAs.ok) return sameAs;

  const showInFooter = raw.showInFooter === true;
  const showOnAbout = raw.showOnAbout === true;
  const ownsSite = raw.ownsSite === true;
  if ((showInFooter || showOnAbout || ownsSite) && !(name && url.value)) {
    return { ok: false, error: "Enter the company name and website, or turn off its credit options." };
  }

  return {
    ok: true,
    value: {
      name,
      url: url.value,
      logoUrl: logo.value,
      logoHeight: clampInt(raw.logoHeight, LOGO_HEIGHT_LIMITS.credit, current.logoHeight),
      creditLabel: localized(raw.creditLabel, 60, current.creditLabel, true),
      description: localized(raw.description, 500, current.description),
      sameAs: sameAs.value,
      ownsSite,
      showInFooter,
      showOnAbout,
    },
  };
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

  const publisher = cleanPublisher(raw.publisher, current.publisher);
  if (!publisher.ok) return publisher;
  const developer = cleanDeveloper(raw.developer, current.developer);
  if (!developer.ok) return developer;

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
      publisher: publisher.value,
      developer: developer.value,
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
