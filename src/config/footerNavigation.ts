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
export const exploreTopics = ["ai-automation", "software", "development", "business", "startups", "insights", "resources"];

/**
 * Groups after Explore; titles and labels come from the dictionary. Every link
 * goes to a page or section that exists: Editors' Picks, Trending and Topics are
 * homepage sections (a hidden section just lands on the homepage), guides are a
 * search, advertising enquiries use the contact form, and cookies are a section
 * of the privacy policy.
 */
export const footerGroups: Array<{
  id: keyof FooterText["groups"];
  tone: Tone;
  links: Array<{ key: keyof FooterText["links"]; href: string }>;
}> = [
  {
    id: "resources",
    tone: "primary",
    links: [
      { key: "latestArticles", href: "/blog" },
      { key: "editorsPicks", href: "/#editors-picks-title" },
      { key: "trending", href: "/#trending-title" },
      { key: "guides", href: "/search?q=guide" },
      { key: "topics", href: "/#topic-strip-title" },
    ],
  },
  {
    id: "company",
    tone: "pink",
    links: [
      { key: "about", href: "/about" },
      { key: "contact", href: "/contact" },
      { key: "advertise", href: "/contact" },
      { key: "writeForUs", href: "/write-for-us" },
    ],
  },
  {
    id: "legal",
    tone: "accent",
    links: [
      { key: "privacy", href: "/privacy-policy" },
      { key: "terms", href: "/terms" },
      { key: "cookies", href: "/privacy-policy#cookies" },
      { key: "disclaimer", href: "/disclaimer" },
    ],
  },
];

// Networks the footer has an icon for. The profiles themselves (which ones, in
// what order) are a list edited under Admin → SEO → Brand & Credits; "website"
// covers anything else with a globe icon.
export const socialNetworks = [
  "facebook",
  "instagram",
  "linkedin",
  "x",
  "youtube",
  "threads",
  "whatsapp",
  "telegram",
  "pinterest",
  "tiktok",
  "website",
] as const;
export type SocialNetwork = (typeof socialNetworks)[number];

/** One footer social icon: the network decides the icon, `url` is the profile. */
export type SocialLink = { network: SocialNetwork; url: string };

/** Brand names, used in the admin and in each icon's accessible name. */
export const socialNetworkNames: Record<SocialNetwork, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  youtube: "YouTube",
  threads: "Threads",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  pinterest: "Pinterest",
  tiktok: "TikTok",
  website: "Other website",
};

/** Hover color of each icon. */
export const socialTones: Record<SocialNetwork, Tone> = {
  facebook: "primary",
  instagram: "pink",
  linkedin: "primary",
  x: "accent-secondary",
  youtube: "accent",
  threads: "accent-secondary",
  whatsapp: "primary",
  telegram: "primary",
  pinterest: "accent",
  tiktok: "pink",
  website: "accent-secondary",
};
