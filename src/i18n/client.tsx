"use client";

import { createContext, use, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries";

type I18n = { locale: Locale; t: Dictionary };

const I18nContext = createContext<I18n | null>(null);

/** Provides the page's locale and interface text to Client Components. */
export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return <I18nContext value={{ locale, t: dictionary }}>{children}</I18nContext>;
}

/** Locale and interface text for Client Components under the `[lang]` layout. */
export function useI18n(): I18n {
  const i18n = use(I18nContext);
  if (!i18n) throw new Error("useI18n must be used inside <I18nProvider>.");
  return i18n;
}

/** The current locale, or null outside the public site (e.g. admin previews). */
export function useLocale(): Locale | null {
  return use(I18nContext)?.locale ?? null;
}
