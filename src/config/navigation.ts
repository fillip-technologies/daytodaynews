import type { IconName } from "@/components/ui/Icon";
import { stripLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { CoverSpec } from "@/types/article";

export type NavLink = { label: string; href: string };

/** Article teaser shown in a category's mega menu. */
export type NavStory = {
  title: string;
  href: string;
  /** ISO date. */
  date: string;
  readTime?: number;
  image?: { src: string; alt: string };
  cover?: CoverSpec;
  /** Language of the title (English when untranslated). */
  locale?: Locale;
};

/** One category in a mega menu: its page and its submenu topics. */
export type NavGroup = {
  label: string;
  href: string;
  category: string;
  icon?: IconName;
  description?: string;
  topics: NavLink[];
  articleCount: number;
};

export type NavItem = {
  label: string;
  href: string;
  /** Category slug, for matching articles/filters to a nav item. */
  category?: string;
  icon?: IconName;
  /** Short line shown under the label in the menu drawer. */
  description?: string;
  /** Mega-menu columns, one per category, filled in from live data (see lib/navigation). */
  groups?: NavGroup[];
  stories?: NavStory[];
  articleCount?: number;
};

/** Fallback header menus, used when the database can't be reached. */
export const primaryNavigation: NavItem[] = [
  {
    label: "AI & Automation",
    href: "/category/ai-automation",
    category: "ai-automation",
    icon: "sparkles",
    description: "Models, agents and workflow automation",
  },
  {
    label: "Software",
    href: "/category/software",
    category: "software",
    icon: "layers",
    description: "Architecture, platforms and tooling",
  },
  {
    label: "Development",
    href: "/category/development",
    category: "development",
    icon: "code",
    description: "Web, mobile and engineering practice",
  },
  {
    label: "Business",
    href: "/category/business",
    category: "business",
    icon: "briefcase",
    description: "B2B tech, hiring and outsourcing",
  },
  {
    label: "Startups",
    href: "/category/startups",
    category: "startups",
    icon: "rocket",
    description: "Founders, funding and product growth",
  },
  {
    label: "Insights",
    href: "/category/insights",
    category: "insights",
    icon: "lightbulb",
    description: "Analysis and technology trends",
  },
];

/**
 * Utility links — the strip above the header and the menu drawer; labels come
 * from the dictionary. Advertising and submissions use the existing contact and
 * pitch forms until they have pages of their own.
 */
export const utilityNavigation: Array<{ key: keyof Dictionary["utilityNav"]; href: string }> = [
  { key: "about", href: "/about" },
  { key: "editorialTeam", href: "/about#team-title" },
  { key: "writeForUs", href: "/write-for-us" },
  { key: "advertise", href: "/contact" },
  { key: "submitStartup", href: "/write-for-us#pitch-form-title" },
  { key: "submitTool", href: "/write-for-us#pitch-form-title" },
  { key: "newsletter", href: "/newsletter" },
  { key: "contact", href: "/contact" },
];

export const subscribeHref = "/newsletter";

/** True when `pathname` (locale-prefixed or not) is `href` or a page beneath it. */
export function isActivePath(pathname: string, href: string) {
  const path = stripLocale(pathname);
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}
