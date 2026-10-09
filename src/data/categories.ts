import type { IconName } from "@/components/ui/Icon";

export type Category = {
  /** URL slug: /category/[slug]. */
  slug: string;
  /** Topic slug that articles are tagged with (see data/topics). */
  topic: string;
  name: string;
  description: string;
  icon?: IconName;
  seoTitle: string;
  seoDescription: string;
  /** Legacy slugs that permanently redirect here. */
  aliases?: string[];
};

export const categories: Category[] = [
  {
    slug: "ai-automation",
    topic: "ai-automation",
    name: "AI & Automation",
    description:
      "Practical insights, use cases and strategies for applying AI and automation to modern businesses.",
    icon: "sparkles",
    seoTitle: "AI & Automation Insights — DayTodayNews",
    seoDescription:
      "Explore practical insights on AI automation, AI agents, workflows, integrations and business use cases.",
  },
  {
    slug: "software-development",
    topic: "software",
    name: "Software Development",
    description:
      "Guides, costs and best practices for planning, building and scaling custom software.",
    icon: "layers",
    seoTitle: "Software Development Guides — DayTodayNews",
    seoDescription:
      "Guides on custom software development: choosing partners, estimating costs, architecture and delivery best practices.",
    aliases: ["software"],
  },
  {
    slug: "development",
    topic: "development",
    name: "Development",
    description:
      "Web and application development: frameworks, performance and modern engineering practice.",
    icon: "code",
    seoTitle: "Web & App Development Insights — DayTodayNews",
    seoDescription:
      "Insights on web and application development, from React and Next.js to performance, Core Web Vitals and project costs.",
  },
  {
    slug: "hiring-outsourcing",
    topic: "hiring-outsourcing",
    name: "Hiring & Outsourcing",
    description:
      "How to find, hire and manage developers and technology partners that fit your team.",
    icon: "users",
    seoTitle: "Hiring & Outsourcing Developers — DayTodayNews",
    seoDescription:
      "Practical guides to hiring developers, staff augmentation and outsourcing software development to India.",
  },
  {
    slug: "business",
    topic: "business",
    name: "Business",
    description:
      "Technology strategy, costs and growth for founders and business leaders.",
    icon: "briefcase",
    seoTitle: "Business Technology Insights — DayTodayNews",
    seoDescription:
      "Business technology insights on automation ROI, digital growth, lead generation and technology investment decisions.",
  },
  {
    slug: "startups",
    topic: "startups",
    name: "Startups",
    description:
      "Stacks, team models and practical technology decisions for early-stage companies.",
    icon: "rocket",
    seoTitle: "Startup Technology Insights — DayTodayNews",
    seoDescription:
      "Technology decisions for startups: choosing a stack, building a team and shipping products efficiently.",
  },
  {
    slug: "insights",
    topic: "insights",
    name: "Insights",
    description:
      "Analysis, comparisons and perspectives on the technologies shaping modern teams.",
    icon: "lightbulb",
    seoTitle: "Technology Analysis & Insights — DayTodayNews",
    seoDescription:
      "Analysis and comparisons of the tools, platforms and trends shaping modern technology teams.",
  },
];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

/** Canonical category for a legacy alias slug, if any. */
export function getCategoryByAlias(slug: string) {
  return categories.find((category) => category.aliases?.includes(slug));
}

export function getCategoryByTopic(topic: string) {
  return categories.find((category) => category.topic === topic);
}
