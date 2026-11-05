"use client";

import type { FooterGroup, SocialLink } from "@/config/footerNavigation";
import type { NavItem } from "@/config/navigation";
import type { LocalizedFooterGroup } from "@/lib/site-links";
import { toneStyle, type Tone } from "@/lib/tones";
import { FooterBottomBar, type FooterCredit } from "./FooterBottomBar";
import { FooterBrand } from "./FooterBrand";
import { FooterLinks } from "./FooterLinks";

/** The footer's link columns from Admin → Links & Footer, in the page's language. */
export type FooterLinksData = {
  exploreTitle: string;
  exploreCategories: string[];
  groups: LocalizedFooterGroup[];
};

type FooterProps = {
  /** The categories (in the page's language) for the Explore column. */
  sections?: NavItem[];
  links: FooterLinksData;
  /** "Designed & Managed by" credit from Admin → SEO → Brand & Credits, or null when off. */
  credit?: FooterCredit | null;
  /** Social profiles set in admin; empty hides the row. */
  socials?: SocialLink[];
};

/** Marker-dot colors of the columns after Explore, in turn. */
const GROUP_TONES: Tone[] = ["primary", "pink", "accent", "accent-secondary"];

export function Footer({ sections = [], links, credit = null, socials = [] }: FooterProps) {
  const groups: FooterGroup[] = [
    {
      id: "explore",
      title: links.exploreTitle,
      tone: "accent-secondary",
      links: links.exploreCategories.flatMap((slug) => {
        const section = sections.find((item) => item.category === slug);
        return section ? [{ label: section.label, href: section.href }] : [];
      }),
    },
    ...links.groups.map((group, index) => ({
      id: `group-${index + 1}`,
      title: group.title,
      tone: GROUP_TONES[index % GROUP_TONES.length],
      links: group.links,
    })),
  ];

  return (
    <footer className="relative isolate overflow-hidden border-t border-border bg-surface">
      {/* Restrained pink → purple → blue glow behind the brand row */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-primary opacity-60" />
        <div
          style={toneStyle("pink")}
          className="absolute -top-40 left-[5%] h-80 w-[36rem] rounded-full bg-(color:--tone)/10 blur-3xl"
        />
        <div className="absolute -top-44 left-[38%] h-80 w-[30rem] rounded-full bg-accent-secondary/10 blur-3xl" />
        <div className="absolute -top-32 right-[2%] h-72 w-[30rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-14">
          <FooterBrand />
        </div>
        <div className="border-t border-border py-10 sm:py-12">
          <FooterLinks groups={groups} />
        </div>
        <FooterBottomBar credit={credit} socials={socials} />
      </div>
    </footer>
  );
}
