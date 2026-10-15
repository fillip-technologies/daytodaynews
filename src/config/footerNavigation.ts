import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Tone } from "@/lib/tones";

type FooterText = Dictionary["footer"];

export type FooterLink = { label: string; href: string };

export type FooterGroup = {
  /** Stable id for the group heading. */
  id: string;
  title: string;
  /** Accent for the group's marker dot. */
  tone: Tone;
  links: FooterLink[];
};

// Topics shown in the Explore column, in display order.
export const exploreTopics = ["ai-automation", "software", "development", "business", "startups", "insights"];

/** Groups after Explore; titles and labels come from the dictionary. */
export const footerGroups: Array<{
  id: keyof FooterText["groups"];
  tone: Tone;
  links: Array<{ key: keyof FooterText["links"]; href: string }>;
}> = [
  {
    id: "resources",
    tone: "primary",
    links: [
      { key: "latestArticles", href: "/latest" },
      { key: "editorsPicks", href: "/editors-picks" },
      { key: "trending", href: "/trending" },
      { key: "guides", href: "/guides" },
      { key: "topics", href: "/topics" },
    ],
  },
  {
    id: "company",
    tone: "pink",
    links: [
      { key: "about", href: "/about" },
      { key: "contact", href: "/contact" },
      { key: "advertise", href: "/advertise" },
      { key: "writeForUs", href: "/write-for-us" },
    ],
  },
  {
    id: "legal",
    tone: "accent",
    links: [
      { key: "privacy", href: "/privacy-policy" },
      { key: "terms", href: "/terms" },
      { key: "cookies", href: "/cookie-policy" },
      { key: "disclaimer", href: "/disclaimer" },
    ],
  },
];

export const socialNetworks = ["linkedin", "x", "instagram", "youtube"] as const;
export type SocialNetwork = (typeof socialNetworks)[number];

// The profile addresses are set under Admin → SEO → Brand & Credits; networks
// without one are hidden. Accessible names come from the dictionary (footer.social).
export const socialTones: Record<SocialNetwork, Tone> = {
  linkedin: "primary",
  x: "accent-secondary",
  instagram: "pink",
  youtube: "accent",
};
