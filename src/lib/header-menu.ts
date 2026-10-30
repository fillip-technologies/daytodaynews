import { cleanLine } from "@/lib/validation";

// The menus across the website header, as edited under Admin → Mega Menu. Each
// menu has a short label and one or more categories: its dropdown shows a
// column of submenu topics per category, and the label links to the first one.
// Pure module: shared by the admin editor, the server action and the seed script.

/** SiteSetting key holding the menus as JSON. */
export const HEADER_MENU_SETTING = "header_menu";
/** The older setting (a list of category slugs, one menu each), still read as a fallback. */
export const LEGACY_HEADER_SETTING = "header_categories";

export const MAX_HEADER_MENUS = 12;
export const MAX_MENU_CATEGORIES = 3;

export type HeaderMenu = {
  /** Label in the header bar; empty uses the first category's name. */
  labelEn: string;
  labelHi: string;
  /** Category slugs, one dropdown column each, in display order. */
  categories: string[];
};

/** The menus from the editorial plan, used until a menu bar is saved in admin. */
export const DEFAULT_HEADER_MENUS: HeaderMenu[] = [
  { labelEn: "Technology", labelHi: "टेक्नोलॉजी", categories: ["technology"] },
  { labelEn: "AI & Automation", labelHi: "AI और ऑटोमेशन", categories: ["ai-automation"] },
  { labelEn: "Hardware", labelHi: "हार्डवेयर", categories: ["hardware"] },
  { labelEn: "Industries", labelHi: "उद्योग", categories: ["industries"] },
  { labelEn: "Startups", labelHi: "स्टार्टअप्स", categories: ["startups"] },
  {
    labelEn: "Business Opportunities",
    labelHi: "बिज़नेस के अवसर",
    categories: ["business-opportunities", "business-growth"],
  },
  { labelEn: "Government", labelHi: "सरकार", categories: ["government-schemes", "government-tenders"] },
  { labelEn: "Global Markets", labelHi: "ग्लोबल मार्केट्स", categories: ["global-markets"] },
  // Insights and Tools & Resources are linked from the footer instead.
];

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const isSlugList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((slug) => typeof slug === "string");

/** Validates the full, ordered menu bar against the categories that exist. */
export function cleanHeaderMenus(input: unknown, knownSlugs: ReadonlySet<string>): Result<HeaderMenu[]> {
  if (!Array.isArray(input) || input.length === 0) return { ok: false, error: "The menu bar needs at least 1 menu." };
  if (input.length > MAX_HEADER_MENUS) {
    return { ok: false, error: `The menu bar can have at most ${MAX_HEADER_MENUS} menus.` };
  }

  const used = new Set<string>();
  const menus: HeaderMenu[] = [];
  for (const [index, item] of input.entries()) {
    const raw = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const labelEn = cleanLine(raw.labelEn, 60);
    const labelHi = cleanLine(raw.labelHi, 60);
    const name = labelEn ? `Menu ${index + 1} ("${labelEn}")` : `Menu ${index + 1}`;
    const categories = isSlugList(raw.categories) ? raw.categories : [];

    if (categories.length === 0) return { ok: false, error: `${name}: pick at least 1 category.` };
    if (categories.length > MAX_MENU_CATEGORIES) {
      return { ok: false, error: `${name}: a menu can show at most ${MAX_MENU_CATEGORIES} categories.` };
    }
    for (const slug of categories) {
      if (!knownSlugs.has(slug)) return { ok: false, error: `${name}: the category "${slug}" no longer exists.` };
      if (used.has(slug)) return { ok: false, error: `${name}: each category can be in only one menu.` };
      used.add(slug);
    }
    menus.push({ labelEn, labelHi, categories });
  }
  return { ok: true, value: menus };
}

/** Reads the stored menus, or null when the value isn't a usable menu list. */
export function parseHeaderMenus(json: string): HeaderMenu[] | null {
  try {
    const value: unknown = JSON.parse(json);
    if (!Array.isArray(value)) return null;
    const menus = value.flatMap((item): HeaderMenu[] => {
      const raw = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      if (!isSlugList(raw.categories) || raw.categories.length === 0) return [];
      return [
        {
          labelEn: typeof raw.labelEn === "string" ? raw.labelEn : "",
          labelHi: typeof raw.labelHi === "string" ? raw.labelHi : "",
          categories: raw.categories,
        },
      ];
    });
    return menus.length > 0 ? menus : null;
  } catch {
    return null;
  }
}

/** The older setting's slugs as menus labelled with their category names. */
export function parseLegacyHeaderMenus(json: string): HeaderMenu[] | null {
  try {
    const value: unknown = JSON.parse(json);
    if (!isSlugList(value) || value.length === 0) return null;
    return value.map((slug) => ({ labelEn: "", labelHi: "", categories: [slug] }));
  } catch {
    return null;
  }
}
