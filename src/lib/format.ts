const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-12-12" → "Dec 12, 2026" (UTC, so server and client agree). */
export function formatDate(isoDate: string) {
  return dateFormatter.format(new Date(isoDate));
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
