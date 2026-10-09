import type { IconName } from "@/components/ui/Icon";
import type { Tone } from "@/lib/tones";

export type Topic = {
  /** Matches the `category` slug in navigation config. */
  slug: string;
  label: string;
  description: string;
  href: string;
  icon: IconName;
  tone: Tone;
};

export const topics: Topic[] = [
  {
    slug: "ai-automation",
    label: "AI & Automation",
    description: "Tools, workflows & use cases",
    href: "/category/ai-automation",
    icon: "sparkles",
    tone: "accent-secondary",
  },
  {
    slug: "software",
    label: "Software Development",
    description: "Guides & best practices",
    href: "/category/software",
    icon: "layers",
    tone: "pink",
  },
  {
    slug: "development",
    label: "Development",
    description: "Web, mobile & engineering",
    href: "/category/development",
    icon: "code",
    tone: "primary",
  },
  {
    slug: "hiring-outsourcing",
    label: "Hiring & Outsourcing",
    description: "Build your technology team",
    href: "/category/hiring-outsourcing",
    icon: "users",
    tone: "accent-secondary",
  },
  {
    slug: "business",
    label: "Business",
    description: "Technology & growth",
    href: "/category/business",
    icon: "briefcase",
    tone: "accent",
  },
  {
    slug: "startups",
    label: "Startups",
    description: "Ideas & trends",
    href: "/category/startups",
    icon: "rocket",
    tone: "pink",
  },
  {
    slug: "insights",
    label: "Insights",
    description: "Analysis & perspectives",
    href: "/category/insights",
    icon: "lightbulb",
    tone: "primary",
  },
];

export type TopicSlug = (typeof topics)[number]["slug"];

export function getTopic(slug: string) {
  return topics.find((topic) => topic.slug === slug);
}
