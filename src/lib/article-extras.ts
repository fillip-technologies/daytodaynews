// The structured extras of an article (key takeaways, FAQs, downloads, related
// directory listings), stored as text/JSON columns. Pure module: shared by the
// admin form, the server actions and the public article page.

export type FaqItem = { q: string; a: string };
export type ResourceLink = { label: string; url: string };

export const EXTRA_LIMITS = {
  takeaways: 8,
  takeawayLength: 300,
  faq: 12,
  question: 300,
  answer: 2000,
  resources: 10,
  listings: 8,
  focusKeyword: 150,
} as const;

/** Non-empty trimmed lines. */
export function parseLines(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

function parseJsonArray(json: string | null | undefined): unknown[] {
  if (!json) return [];
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function parseFaq(json: string | null | undefined): FaqItem[] {
  return parseJsonArray(json).flatMap((item) => {
    const raw = (item ?? {}) as Record<string, unknown>;
    const q = typeof raw.q === "string" ? raw.q.trim() : "";
    const a = typeof raw.a === "string" ? raw.a.trim() : "";
    return q && a ? [{ q, a }] : [];
  });
}

export function parseResources(json: string | null | undefined): ResourceLink[] {
  return parseJsonArray(json).flatMap((item) => {
    const raw = (item ?? {}) as Record<string, unknown>;
    const label = typeof raw.label === "string" ? raw.label.trim() : "";
    const url = typeof raw.url === "string" ? raw.url.trim() : "";
    return label && url ? [{ label, url }] : [];
  });
}

export function parseSlugList(json: string | null | undefined): string[] {
  return [...new Set(parseJsonArray(json).filter((s): s is string => typeof s === "string" && Boolean(s)))];
}

const strip = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max) : "";

/** Cleans takeaways typed one per line; returns the stored text or null. */
export function cleanTakeaways(value: unknown): string | null {
  const lines = parseLines(strip(value, 5000))
    .map((line) => line.slice(0, EXTRA_LIMITS.takeawayLength))
    .slice(0, EXTRA_LIMITS.takeaways);
  return lines.length ? lines.join("\n") : null;
}

/** Cleans FAQ pairs; incomplete pairs are dropped. Returns stored JSON or null. */
export function cleanFaq(value: unknown): string | null {
  const items = (Array.isArray(value) ? value : [])
    .map((item) => {
      const raw = (item ?? {}) as Record<string, unknown>;
      return { q: strip(raw.q, EXTRA_LIMITS.question), a: strip(raw.a, EXTRA_LIMITS.answer) };
    })
    .filter((item) => item.q && item.a)
    .slice(0, EXTRA_LIMITS.faq);
  return items.length ? JSON.stringify(items) : null;
}

/** A site path or an http(s) URL. */
function cleanLinkUrl(value: unknown): string | null {
  const text = strip(value, 2048);
  if (!text) return null;
  if (text.startsWith("/") && !text.startsWith("//")) return text;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function cleanResources(value: unknown): Result<string | null> {
  const items: ResourceLink[] = [];
  for (const item of Array.isArray(value) ? value : []) {
    const raw = (item ?? {}) as Record<string, unknown>;
    const label = strip(raw.label, 150);
    const rawUrl = strip(raw.url, 2048);
    if (!label && !rawUrl) continue;
    const url = cleanLinkUrl(rawUrl);
    if (!label || !url) {
      return { ok: false, error: "Each download needs a name and a link (https://… or a /path on this site)." };
    }
    items.push({ label, url });
  }
  if (items.length > EXTRA_LIMITS.resources) {
    return { ok: false, error: `At most ${EXTRA_LIMITS.resources} downloads per article.` };
  }
  return { ok: true, value: items.length ? JSON.stringify(items) : null };
}

/** Listing slugs, de-duplicated, as stored JSON (or null). */
export function cleanSlugList(value: unknown, max: number): string | null {
  const slugs = [
    ...new Set(
      (Array.isArray(value) ? value : [])
        .map((s) => strip(s, 191).toLowerCase())
        .filter((s) => /^[a-z0-9-]+$/.test(s)),
    ),
  ].slice(0, max);
  return slugs.length ? JSON.stringify(slugs) : null;
}

/** Words in markdown text (rough: markup removed). */
export function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|-]/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** Links in markdown, split into this site's own pages and other websites. */
export function countLinks(markdown: string, siteHost?: string): { internal: number; external: number } {
  let internal = 0;
  let external = 0;
  for (const match of markdown.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)) {
    const href = match[1];
    if (href.startsWith("/") && !href.startsWith("//")) internal++;
    else if (/^https?:\/\//i.test(href)) {
      try {
        if (siteHost && new URL(href).host.replace(/^www\./, "") === siteHost.replace(/^www\./, "")) internal++;
        else external++;
      } catch {
        external++;
      }
    }
  }
  return { internal, external };
}
