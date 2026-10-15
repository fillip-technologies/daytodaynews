"use client";

import { exploreTopics, footerGroups, type FooterGroup, type SocialLink } from "@/config/footerNavigation";
import type { NavItem } from "@/config/navigation";
import { useI18n } from "@/i18n/client";
import { toneStyle } from "@/lib/tones";
import { FooterBottomBar, type FooterCredit } from "./FooterBottomBar";
import { FooterBrand } from "./FooterBrand";
import { FooterLinks } from "./FooterLinks";

type FooterProps = {
  /** The categories (in the page's language) for the Explore column. */
  sections?: NavItem[];
  /** "Designed & Managed by" credit from Admin → SEO → Brand & Credits, or null when off. */
  credit?: FooterCredit | null;
  /** Social profiles set in admin; empty hides the row. */
  socials?: SocialLink[];
};

export function Footer({ sections = [], credit = null, socials = [] }: FooterProps) {
  const { t } = useI18n();

  const groups: FooterGroup[] = [
    {
      id: "explore",
      title: t.footer.groups.explore,
      tone: "accent-secondary",
      links: exploreTopics.flatMap((slug) => {
        const section = sections.find((item) => item.category === slug);
        return section ? [{ label: section.label, href: section.href }] : [];
      }),
    },
    ...footerGroups.map((group) => ({
      id: group.id,
      title: t.footer.groups[group.id],
      tone: group.tone,
      links: group.links.map((link) => ({ label: t.footer.links[link.key], href: link.href })),
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
