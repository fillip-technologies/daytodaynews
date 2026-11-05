import type { Locale } from "@/i18n/config";
import { dictionaries, type Dictionary } from "@/i18n/dictionaries";
import { cleanLine } from "@/lib/validation";

// Interface text edited under Admin → Site Text: any string of the dictionaries
// (buttons, labels, short lines) in English and Hindi. Only changed strings are
// stored, so untouched ones keep following the shipped text. Pure module:
// shared by the admin editor, the server action and getDictionary().

/** SiteSetting key holding the overrides as JSON. */
export const SITE_TEXT_SETTING = "site_text";

/** Edited under Admin → Links & Footer instead. */
const MANAGED_ELSEWHERE = ["utilityNav.", "footer.groups.", "footer.links."];

/** Changed strings by dotted path, e.g. "header.subscribe". */
export type TextOverrides = Record<string, { en?: string; hi?: string }>;

/** One editable string: where it lives and its shipped English and Hindi. */
export type TextEntry = { path: string; en: string; hi: string };

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string" ? [`${prefix}${key}`] : leaves(value, `${prefix}${key}.`),
  );
}

function read(tree: Tree, path: string): string {
  const value = path.split(".").reduce<string | Tree | undefined>(
    (node, key) => (node && typeof node === "object" ? node[key] : undefined),
    tree,
  );
  return typeof value === "string" ? value : "";
}

/** Every editable string, in dictionary order. */
export function textEntries(): TextEntry[] {
  const en = dictionaries.en as unknown as Tree;
  const hi = dictionaries.hi as unknown as Tree;
  return leaves(en)
    .filter((path) => !MANAGED_ELSEWHERE.some((prefix) => path.startsWith(prefix)))
    .map((path) => ({ path, en: read(en, path), hi: read(hi, path) }));
}

/** The `{placeholders}` a string uses, e.g. "{n}" in "{n} min read". */
const placeholders = (text: string) => [...new Set(text.match(/\{\w+\}/g) ?? [])].sort().join(" ");

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/**
 * Validates submitted text (path → { en, hi }) and keeps only what differs
 * from the shipped text. A string must keep its {placeholders}, which the
 * site fills in (a count, a name).
 */
export function cleanTextOverrides(input: unknown): Result<TextOverrides> {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const overrides: TextOverrides = {};
  for (const entry of textEntries()) {
    const submitted = (raw[entry.path] && typeof raw[entry.path] === "object" ? raw[entry.path] : {}) as Record<
      string,
      unknown
    >;
    const value: { en?: string; hi?: string } = {};
    for (const locale of ["en", "hi"] as const) {
      const text = cleanLine(submitted[locale], 1000);
      if (!text || text === entry[locale]) continue;
      if (placeholders(text) !== placeholders(entry[locale])) {
        const needed = placeholders(entry[locale]) || "no {placeholders}";
        return {
          ok: false,
          error: `"${entry.path}" (${locale === "en" ? "English" : "Hindi"}) must keep exactly: ${needed}`,
        };
      }
      value[locale] = text;
    }
    if (value.en || value.hi) overrides[entry.path] = value;
  }
  return { ok: true, value: overrides };
}

/** Reads stored overrides; anything malformed is ignored. */
export function parseTextOverrides(json: string): TextOverrides {
  try {
    const value: unknown = JSON.parse(json);
    if (!value || typeof value !== "object") return {};
    const overrides: TextOverrides = {};
    for (const [path, item] of Object.entries(value as Record<string, unknown>)) {
      if (!item || typeof item !== "object") continue;
      const { en, hi } = item as Record<string, unknown>;
      overrides[path] = {
        ...(typeof en === "string" && en ? { en } : {}),
        ...(typeof hi === "string" && hi ? { hi } : {}),
      };
    }
    return overrides;
  } catch {
    return {};
  }
}

/** `locale`'s dictionary with the admin's changes applied. */
export function applyTextOverrides(locale: Locale, overrides: TextOverrides): Dictionary {
  const paths = Object.keys(overrides).filter((path) => overrides[path][locale]);
  if (paths.length === 0) return dictionaries[locale];
  const dictionary = structuredClone(dictionaries[locale]) as unknown as Tree;
  for (const path of paths) {
    const keys = path.split(".");
    const last = keys.pop()!;
    const parent = keys.reduce<Tree | undefined>(
      (node, key) => (node && typeof node[key] === "object" ? (node[key] as Tree) : undefined),
      dictionary,
    );
    // Only replace strings that exist, so a stale path can't add keys.
    if (parent && typeof parent[last] === "string") parent[last] = overrides[path][locale]!;
  }
  return dictionary as unknown as Dictionary;
}
