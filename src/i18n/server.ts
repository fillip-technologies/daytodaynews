import { lang } from "next/root-params";
import { defaultLocale, isLocale, type Locale } from "./config";
import { dictionaries } from "./dictionaries";

/**
 * The current page's locale, read from the `[lang]` root segment. Works in any
 * Server Component without prop drilling; outside `[lang]` (e.g. /admin) it
 * falls back to the default locale.
 */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return isLocale(value) ? value : defaultLocale;
}

/** Locale and interface text for Server Components. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
