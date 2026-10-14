import { localeTags, type Locale } from "@/i18n/config";

const dateFormatters = new Map<Locale, Intl.DateTimeFormat>();

/** "2026-12-12" → "Dec 12, 2026" / "12 दिस॰ 2026" (UTC, so server and client agree). */
export function formatDate(isoDate: string, locale: Locale = "en") {
  let formatter = dateFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(localeTags[locale], {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    dateFormatters.set(locale, formatter);
  }
  return formatter.format(new Date(isoDate));
}

/** "Shruti Singh" → "SS" */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
