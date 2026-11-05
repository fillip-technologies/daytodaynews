import { lang } from "next/root-params";
import { cache } from "react";
import { applyTextOverrides } from "@/lib/site-text";
import { getSiteTextOverrides } from "@/lib/settings";
import { defaultLocale, isLocale, type Locale } from "./config";
import type { Dictionary } from "./dictionaries";

/**
 * The current page's locale, read from the `[lang]` root segment. Works in any
 * Server Component without prop drilling; outside `[lang]` (e.g. /admin) it
 * falls back to the default locale.
 */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return isLocale(value) ? value : defaultLocale;
}

/** Interface text in `locale`, with the changes made under Admin → Site Text (memoized per request). */
export const getDictionary = cache(
  async (locale: Locale): Promise<Dictionary> => applyTextOverrides(locale, await getSiteTextOverrides()),
);

/** Locale and interface text for Server Components. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: await getDictionary(locale) };
}
