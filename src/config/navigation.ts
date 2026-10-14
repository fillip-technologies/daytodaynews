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

export type NavItem = {
  label: string;
  href: string;
  /** Category slug, for matching articles/filters to a nav item. */
  category?: string;
  icon?: IconName;
  /** Short line shown under the label in the menu drawer. */
  description?: string;
  /** Smallest breakpoint at which the item shows in the header bar (default "md"). */
  showFrom?: "md" | "lg" | "xl";
  /** Mega-menu content, filled in from live articles (see lib/navigation). */
  topics?: NavLink[];
  stories?: NavStory[];
  articleCount?: number;
};

/** Primary categories — rendered by DesktopNav and the menu drawer. */
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
    showFrom: "lg",
  },
  {
    label: "Startups",
    href: "/category/startups",
    category: "startups",
    icon: "rocket",
    description: "Founders, funding and product growth",
    showFrom: "xl",
  },
  {
    label: "Insights",
    href: "/category/insights",
    category: "insights",
    icon: "lightbulb",
    description: "Analysis and technology trends",
    showFrom: "xl",
  },
];

/** Secondary links — shown only in the menu drawer; labels come from the dictionary. */
export const secondaryNavigation: Array<{ key: keyof Dictionary["secondaryNav"]; href: string }> = [
  { key: "latest", href: "/blog" },
  { key: "newsletter", href: "/newsletter" },
  { key: "about", href: "/about" },
  { key: "writeForUs", href: "/write-for-us" },
  { key: "contact", href: "/contact" },
];

export const subscribeHref = "/newsletter";

/** True when `pathname` (locale-prefixed or not) is `href` or a page beneath it. */
export function isActivePath(pathname: string, href: string) {
  const path = stripLocale(pathname);
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}
