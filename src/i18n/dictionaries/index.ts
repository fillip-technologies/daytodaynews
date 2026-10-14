import type { Locale } from "../config";
import { en, type Dictionary } from "./en";
import { hi } from "./hi";

export type { Dictionary };

// Server-side lookup. Client Components get their dictionary from I18nProvider,
// so they never bundle every language.
export const dictionaries: Record<Locale, Dictionary> = { en, hi };
