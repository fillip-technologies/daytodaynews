import type { IconName } from "@/components/ui/Icon";

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
    showFrom: "lg",
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

/** Secondary links — shown only in the menu drawer. */
export const secondaryNavigation: NavItem[] = [
  { label: "Latest", href: "/latest" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const subscribeHref = "/newsletter";

/** True when `pathname` is `href` or a page beneath it. */
export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
