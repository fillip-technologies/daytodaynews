import { exploreTopics, footerGroups } from "@/config/footerNavigation";
import { utilityNavigation } from "@/config/navigation";
import { dictionaries } from "@/i18n/dictionaries";
import { cleanSeoUrl } from "@/lib/seo/validate";
import { cleanLine } from "@/lib/validation";

// The utility strip above the header and the footer's link columns, as edited
// under Admin → Links & Footer. Until something is saved, the links defined in
// config/ (with their dictionary labels) are used. Pure module: shared by the
// admin editor, the server action and the site layout.

/** SiteSetting key holding the links as JSON. */
export const SITE_LINKS_SETTING = "site_links";

export const MAX_UTILITY_LINKS = 12;
export const MAX_FOOTER_GROUPS = 4;
export const MAX_GROUP_LINKS = 10;
export const MAX_EXPLORE_CATEGORIES = 12;

export type LinkText = { en: string; hi: string };
export type SiteLink = { label: LinkText; href: string };
export type FooterGroupLinks = { title: LinkText; links: SiteLink[] };

export type SiteLinks = {
  /** The strip above the header (and the "more" links in the phone menu). */
  utility: SiteLink[];
  /** The footer's first column: category links. */
  exploreTitle: LinkText;
  exploreCategories: string[];
  /** The footer's other columns. */
  footerGroups: FooterGroupLinks[];
};

/** The same links in one language, as the site renders them. */
export type LocalizedLink = { label: string; href: string };
export type LocalizedFooterGroup = { title: string; links: LocalizedLink[] };

const { en, hi } = dictionaries;

/** What the site showed before anything was saved in admin. */
export function defaultSiteLinks(): SiteLinks {
  return {
    utility: utilityNavigation.map((link) => ({
      label: { en: en.utilityNav[link.key], hi: hi.utilityNav[link.key] },
      href: link.href,
    })),
    exploreTitle: { en: en.footer.groups.explore, hi: hi.footer.groups.explore },
    exploreCategories: [...exploreTopics],
    footerGroups: footerGroups.map((group) => ({
      title: { en: en.footer.groups[group.id], hi: hi.footer.groups[group.id] },
      links: group.links.map((link) => ({
        label: { en: en.footer.links[link.key], hi: hi.footer.links[link.key] },
        href: link.href,
      })),
    })),
  };
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const asRecord = (value: unknown) => (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
const asArray = (value: unknown) => (Array.isArray(value) ? value : []);
const cleanLabel = (value: unknown): LinkText => {
  const raw = asRecord(value);
  return { en: cleanLine(raw.en, 80), hi: cleanLine(raw.hi, 80) };
};

function cleanLinks(value: unknown, max: number, where: string): Result<SiteLink[]> {
  const links: SiteLink[] = [];
  for (const [index, item] of asArray(value).entries()) {
    const raw = asRecord(item);
    const label = cleanLabel(raw.label);
    const hrefText = cleanLine(raw.href, 2048);
    const name = `${where}, link ${index + 1}`;
    if (!label.en && !label.hi && !hrefText) continue; // An untouched empty row.
    if (!label.en) return { ok: false, error: `${name}: the English label is required.` };
    const href = cleanSeoUrl(hrefText);
    if (!href.ok || !href.value) {
      return { ok: false, error: `${name} ("${label.en}"): the link must start with / (a page on this site) or https://` };
    }
    links.push({ label, href: href.value });
  }
  if (links.length > max) return { ok: false, error: `${where} can have at most ${max} links.` };
  return { ok: true, value: links };
}

/** Validates the full set of links against the categories that exist. */
export function cleanSiteLinks(input: unknown, categorySlugs: ReadonlySet<string>): Result<SiteLinks> {
  const raw = asRecord(input);

  const utility = cleanLinks(raw.utility, MAX_UTILITY_LINKS, "Top strip");
  if (!utility.ok) return utility;

  const groups = asArray(raw.footerGroups);
  if (groups.length > MAX_FOOTER_GROUPS) {
    return { ok: false, error: `The footer can have at most ${MAX_FOOTER_GROUPS} link columns besides Explore.` };
  }
  const footerGroupsClean: FooterGroupLinks[] = [];
  for (const [index, group] of groups.entries()) {
    const rawGroup = asRecord(group);
    const title = cleanLabel(rawGroup.title);
    const where = `Footer column ${index + 2}${title.en ? ` ("${title.en}")` : ""}`;
    if (!title.en) return { ok: false, error: `${where}: the English title is required.` };
    const links = cleanLinks(rawGroup.links, MAX_GROUP_LINKS, where);
    if (!links.ok) return links;
    footerGroupsClean.push({ title, links: links.value });
  }

  const exploreTitle = cleanLabel(raw.exploreTitle);
  if (!exploreTitle.en) return { ok: false, error: "Footer column 1: the English title is required." };
  const exploreCategories = [...new Set(asArray(raw.exploreCategories))]
    .filter((slug): slug is string => typeof slug === "string" && categorySlugs.has(slug))
    .slice(0, MAX_EXPLORE_CATEGORIES);

  return {
    ok: true,
    value: { utility: utility.value, exploreTitle, exploreCategories, footerGroups: footerGroupsClean },
  };
}

/** Reads stored links, or null when there are none or they can't be read. */
export function parseSiteLinks(json: string): SiteLinks | null {
  try {
    const raw = asRecord(JSON.parse(json));
    const text = (value: unknown): LinkText => {
      const t = asRecord(value);
      return { en: typeof t.en === "string" ? t.en : "", hi: typeof t.hi === "string" ? t.hi : "" };
    };
    const links = (value: unknown): SiteLink[] =>
      asArray(value).flatMap((item) => {
        const link = asRecord(item);
        return typeof link.href === "string" ? [{ label: text(link.label), href: link.href }] : [];
      });
    if (!Array.isArray(raw.utility) || !Array.isArray(raw.footerGroups)) return null;
    return {
      utility: links(raw.utility),
      exploreTitle: text(raw.exploreTitle),
      exploreCategories: asArray(raw.exploreCategories).filter((s): s is string => typeof s === "string"),
      footerGroups: raw.footerGroups.map((group) => ({
        title: text(asRecord(group).title),
        links: links(asRecord(group).links),
      })),
    };
  } catch {
    return null;
  }
}

/** A label in `locale`, falling back to English. */
export const localizeText = (text: LinkText, locale: string) => (locale === "hi" ? text.hi : text.en) || text.en;

export const localizeLinks = (links: SiteLink[], locale: string): LocalizedLink[] =>
  links.map((link) => ({ label: localizeText(link.label, locale), href: link.href }));
