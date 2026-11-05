import { cleanLine, cleanText } from "@/lib/validation";

// Editable content of the fixed pages (About, Contact, legal pages…), as edited
// under Admin → Pages. Each page declares its fields (lib/page-defaults); the
// page keeps its design and reads its words from here. Pure module: shared by
// the admin editor, the server action and the pages.

export type PageText = { en: string; hi: string };

/** Fields of one entry in an "items" list; an "id" is one value for both languages. */
export type ItemField = { key: string; label: string; kind: "line" | "text" | "markdown" | "id" };

export type PageField = { key: string; label: string; hint?: string } & (
  | { kind: "line" | "text" | "markdown" }
  /** A plain ISO date (yyyy-mm-dd), or empty. */
  | { kind: "date" }
  /** Lines of text, e.g. bullet points. */
  | { kind: "list"; max: number; itemLabel: string }
  /** Cards or sections, each with its own fields. */
  | { kind: "items"; max: number; itemLabel: string; fields: ItemField[] }
  /** Category slugs, in order. */
  | { kind: "categories"; max: number }
);

export type PageSchema = {
  key: string;
  /** Name in the admin. */
  label: string;
  /** The page on the site, unprefixed. */
  path: string;
  groups: Array<{ title: string; fields: PageField[] }>;
};

export type ItemValue = Record<string, PageText | string>;
export type FieldValue = PageText | string | PageText[] | ItemValue[] | string[];
export type PageValues = Record<string, FieldValue>;

/** SiteSetting key holding one page's content as JSON. */
export const pageSettingKey = (page: string) => `page:${page}`;

const asRecord = (value: unknown) => (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
const isText = (value: unknown): value is PageText =>
  !!value && typeof value === "object" && typeof (value as PageText).en === "string" && typeof (value as PageText).hi === "string";

const LIMITS = { line: 300, text: 3000, markdown: 20000, id: 60 } as const;

function cleanTextValue(value: unknown, kind: "line" | "text" | "markdown"): PageText {
  const raw = asRecord(value);
  const clean = kind === "line" ? cleanLine : cleanText;
  return { en: clean(raw.en, LIMITS[kind]), hi: clean(raw.hi, LIMITS[kind]) };
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, LIMITS.id);

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** Validates a page's submitted content against its fields. */
export function cleanPageValues(
  schema: PageSchema,
  input: unknown,
  categorySlugs: ReadonlySet<string>,
): Result<PageValues> {
  const raw = asRecord(input);
  const values: PageValues = {};
  for (const field of schema.groups.flatMap((group) => group.fields)) {
    const value = raw[field.key];
    switch (field.kind) {
      case "line":
      case "text":
      case "markdown":
        values[field.key] = cleanTextValue(value, field.kind);
        break;
      case "date": {
        const date = cleanLine(value, 10);
        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return { ok: false, error: `${field.label}: use a date like 2026-11-05, or leave it empty.` };
        }
        values[field.key] = date;
        break;
      }
      case "list": {
        const list = (Array.isArray(value) ? value : [])
          .map((item) => cleanTextValue(item, "line"))
          .filter((item) => item.en || item.hi);
        if (list.length > field.max) return { ok: false, error: `${field.label}: at most ${field.max} entries.` };
        if (list.some((item) => !item.en)) {
          return { ok: false, error: `${field.label}: every entry needs its English text.` };
        }
        values[field.key] = list;
        break;
      }
      case "items": {
        const items: ItemValue[] = [];
        const ids = new Set<string>();
        for (const item of Array.isArray(value) ? value : []) {
          const rawItem = asRecord(item);
          const clean: ItemValue = {};
          for (const itemField of field.fields) {
            clean[itemField.key] =
              itemField.kind === "id"
                ? slugify(cleanLine(rawItem[itemField.key], LIMITS.id))
                : cleanTextValue(rawItem[itemField.key], itemField.kind);
          }
          const texts = field.fields.filter((f) => f.kind !== "id").map((f) => clean[f.key] as PageText);
          if (texts.every((t) => !t.en && !t.hi)) continue; // An untouched empty entry.
          const name = `${field.label}, ${field.itemLabel.toLowerCase()} ${items.length + 1}`;
          const first = field.fields.find((f) => f.kind !== "id");
          if (first && !(clean[first.key] as PageText).en) {
            return { ok: false, error: `${name}: "${first.label}" needs its English text.` };
          }
          // Anchors (e.g. /privacy-policy#cookies) need a unique id; derive one from the title if empty.
          for (const idField of field.fields.filter((f) => f.kind === "id")) {
            const base =
              (clean[idField.key] as string) || slugify(first ? (clean[first.key] as PageText).en : "") || "section";
            let id = base;
            for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
            ids.add(id);
            clean[idField.key] = id;
          }
          items.push(clean);
        }
        if (items.length > field.max) return { ok: false, error: `${field.label}: at most ${field.max} entries.` };
        values[field.key] = items;
        break;
      }
      case "categories":
        values[field.key] = [...new Set(Array.isArray(value) ? value : [])]
          .filter((slug): slug is string => typeof slug === "string" && categorySlugs.has(slug))
          .slice(0, field.max);
        break;
    }
  }
  return { ok: true, value: values };
}

/** Whether a stored value has the shape `field` needs (anything else falls back to the default). */
function fits(field: PageField, value: unknown): boolean {
  switch (field.kind) {
    case "line":
    case "text":
    case "markdown":
      return isText(value);
    case "date":
      return typeof value === "string";
    case "list":
      return Array.isArray(value) && value.every(isText);
    case "items":
      return Array.isArray(value) && value.every((item) => item && typeof item === "object");
    case "categories":
      return Array.isArray(value) && value.every((slug) => typeof slug === "string");
  }
}

/** Stored content laid over the defaults, field by field. */
export function mergePageValues(schema: PageSchema, defaults: PageValues, json: string | null): PageValues {
  let stored: Record<string, unknown> = {};
  try {
    stored = json ? asRecord(JSON.parse(json)) : {};
  } catch {
    // Unreadable content: show the defaults.
  }
  const values: PageValues = { ...defaults };
  for (const field of schema.groups.flatMap((group) => group.fields)) {
    if (fits(field, stored[field.key])) values[field.key] = stored[field.key] as FieldValue;
  }
  return values;
}

/** How many texts have English but no Hindi yet. */
export function missingHindi(schema: PageSchema, values: PageValues): number {
  let missing = 0;
  const check = (value: unknown) => {
    if (isText(value) && value.en.trim() && !value.hi.trim()) missing++;
  };
  for (const field of schema.groups.flatMap((group) => group.fields)) {
    const value = values[field.key];
    if (field.kind === "list") ((value as PageText[] | undefined) ?? []).forEach(check);
    else if (field.kind === "items") ((value as ItemValue[] | undefined) ?? []).forEach((item) => Object.values(item).forEach(check));
    else check(value);
  }
  return missing;
}

/**
 * A page counts as translated once every text has Hindi. Until then its Hindi
 * URL names the English page as canonical and stays out of the sitemap, so a
 * half-English copy is never indexed as a duplicate.
 */
export const isPageTranslated = (schema: PageSchema, values: PageValues) => missingHindi(schema, values) === 0;

/** A page's content in one language; Hindi falls back to English where it is empty. */
export type ResolvedPage = {
  text(key: string): string;
  list(key: string): string[];
  items(key: string): Array<Record<string, string>>;
  categories(key: string): string[];
};

export function resolvePage(values: PageValues, locale: string): ResolvedPage {
  const pick = (value: PageText | string | undefined) =>
    typeof value === "string" ? value : value ? (locale === "hi" ? value.hi : value.en) || value.en : "";
  return {
    text: (key) => pick(values[key] as PageText | string | undefined),
    list: (key) => ((values[key] as PageText[] | undefined) ?? []).map(pick).filter(Boolean),
    items: (key) =>
      ((values[key] as ItemValue[] | undefined) ?? []).map((item) =>
        Object.fromEntries(Object.entries(item).map(([k, v]) => [k, pick(v)])),
      ),
    categories: (key) => (values[key] as string[] | undefined) ?? [],
  };
}
