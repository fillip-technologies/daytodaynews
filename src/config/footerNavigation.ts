import { topics } from "@/data/topics";
import type { Tone } from "@/lib/tones";

export type FooterLink = { label: string; href: string };

export type FooterGroup = {
  title: string;
  /** Accent for the group's marker dot. */
  tone: Tone;
  links: FooterLink[];
};

// Topics shown in the Explore column, in display order.
const exploreTopics = ["ai-automation", "software", "development", "business", "startups", "insights"];

export const footerNavigation: FooterGroup[] = [
  {
    title: "Explore",
    tone: "accent-secondary",
    links: exploreTopics.flatMap((slug) => {
      const topic = topics.find((t) => t.slug === slug);
      return topic ? [{ label: topic.label, href: topic.href }] : [];
    }),
  },
  {
    title: "Resources",
    tone: "primary",
    links: [
      { label: "Latest Articles", href: "/latest" },
      { label: "Editors' Picks", href: "/editors-picks" },
      { label: "Trending", href: "/trending" },
      { label: "Guides", href: "/guides" },
      { label: "Topics", href: "/topics" },
    ],
  },
  {
    title: "Company",
    tone: "pink",
    links: [
      { label: "About DayTodayNews", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Advertise", href: "/advertise" },
      { label: "Write for Us", href: "/write-for-us" },
    ],
  },
  {
    title: "Legal",
    tone: "accent",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];

export type SocialNetwork = "linkedin" | "x" | "instagram" | "youtube";

// TODO: replace the placeholder hrefs with the real DayTodayNews profiles.
export const socialLinks: Array<{ network: SocialNetwork; label: string; href: string; tone: Tone }> = [
  { network: "linkedin", label: "DayTodayNews on LinkedIn", href: "#", tone: "primary" },
  { network: "x", label: "DayTodayNews on X", href: "#", tone: "accent-secondary" },
  { network: "instagram", label: "DayTodayNews on Instagram", href: "#", tone: "pink" },
  { network: "youtube", label: "DayTodayNews on YouTube", href: "#", tone: "accent" },
];
