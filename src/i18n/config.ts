import type { Metadata } from "next";

export const locales = ["en", "hi"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Remembers the language a reader chose with the switcher. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Each language named in itself, for the switcher. */
export const localeNames: Record<Locale, string> = { en: "English", hi: "हिंदी" };

/** BCP 47 tags for Intl formatting and `hreflang`. */
export const localeTags: Record<Locale, string> = { en: "en-US", hi: "hi-IN" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** The locale prefix of `pathname` ("/hi/blog" → "hi"), if any. */
export function localeOf(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : null;
}

/** `pathname` without its locale prefix ("/hi/blog" → "/blog", "/hi" → "/"). */
export function stripLocale(pathname: string) {
  const locale = localeOf(pathname);
  if (!locale) return pathname;
  return pathname.slice(locale.length + 1) || "/";
}

/**
 * Prefixes an internal path with the locale ("/blog?q=x" → "/hi/blog?q=x").
 * External URLs, hash and protocol links, and already-prefixed paths pass through.
 */
export function localizePath(href: string, locale: Locale) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (localeOf(href.split(/[?#]/)[0])) return href;
  if (href === "/") return `/${locale}`;
  if (href.startsWith("/?") || href.startsWith("/#")) return `/${locale}${href.slice(1)}`;
  return `/${locale}${href}`;
}

/**
 * Canonical and hreflang links for a page at `path` (unprefixed). Pages whose
 * text exists only in English point every language at the English URL, so the
 * Hindi copy isn't indexed as a duplicate.
 */
export function alternates(
  path: string,
  locale: Locale,
  { translated = true } = {},
): { canonical: string; languages: Record<string, string> } & Metadata["alternates"] {
  if (!translated) {
    return { canonical: localizePath(path, "en"), languages: { en: localizePath(path, "en") } };
  }
  return {
    canonical: localizePath(path, locale),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, localizePath(path, l)])),
      "x-default": localizePath(path, defaultLocale),
    },
  };
}

/** Fills `{name}` placeholders: format("{n} min read", { n: 5 }). */
export function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** Picks the singular or plural form and fills `{n}` (plus any other values). */
export function plural(
  forms: { one: string; other: string },
  n: number,
  values: Record<string, string | number> = {},
) {
  return format(n === 1 ? forms.one : forms.other, { n, ...values });
}
