import { cleanSeoUrl } from "@/lib/seo/validate";
import { cleanLine } from "@/lib/validation";

// Sub-topics of a category's mega menu, as edited under Admin → Mega Menu.
// Pure module: shared by the admin form (types, limits) and the server action.

export const MAX_MENU_TOPICS = 12;

/** One row of the admin editor. */
export type MenuTopicInput = {
  labelEn: string;
  labelHi: string;
  /** "search": `value` is a keyword; "link": `value` is a site path or https URL. */
  kind: "search" | "link";
  value: string;
  alwaysShow: boolean;
};

export type CleanMenuTopic = {
  labelEn: string;
  labelHi: string | null;
  query: string | null;
  href: string | null;
  alwaysShow: boolean;
};

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** Validates the full, ordered topic list for one category. */
export function cleanMenuTopics(input: unknown): Result<CleanMenuTopic[]> {
  if (!Array.isArray(input)) return { ok: false, error: "Invalid topic list." };
  if (input.length > MAX_MENU_TOPICS) {
    return { ok: false, error: `A menu can have at most ${MAX_MENU_TOPICS} topics.` };
  }

  const topics: CleanMenuTopic[] = [];
  for (const [index, item] of input.entries()) {
    const raw = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const n = index + 1;
    const labelEn = cleanLine(raw.labelEn, 100);
    if (!labelEn) return { ok: false, error: `Topic ${n}: the English name is required.` };
    const labelHi = cleanLine(raw.labelHi, 100) || null;

    if (raw.kind === "link") {
      const url = cleanSeoUrl(raw.value);
      if (!url.ok || !url.value) {
        return { ok: false, error: `Topic ${n} ("${labelEn}"): the link must start with / (a page on this site) or https://` };
      }
      // A direct link never leads to an empty result page, so it always shows.
      topics.push({ labelEn, labelHi, query: null, href: url.value, alwaysShow: true });
    } else {
      const query = cleanLine(raw.value, 200);
      if (!query) return { ok: false, error: `Topic ${n} ("${labelEn}"): the search keyword is required.` };
      topics.push({ labelEn, labelHi, query, href: null, alwaysShow: raw.alwaysShow === true });
    }
  }
  return { ok: true, value: topics };
}

/** A stored row as an editor row. */
export function toMenuTopicInput(row: CleanMenuTopic): MenuTopicInput {
  return {
    labelEn: row.labelEn,
    labelHi: row.labelHi ?? "",
    kind: row.href ? "link" : "search",
    value: row.href ?? row.query ?? "",
    alwaysShow: row.alwaysShow,
  };
}
