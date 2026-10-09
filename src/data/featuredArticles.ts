import type { Article } from "@/types/article";

/** Homepage hero: the first item is the lead story, the rest are secondary. */
export const featuredArticles: Article[] = [
  {
    title: "How AI Automation Can Transform Business Operations in 2026",
    href: "/articles/ai-automation-business-operations-2026",
    description:
      "A practical guide to real use cases, implementation steps and ROI for growing businesses.",
    category: "AI & Automation",
    categoryHref: "/category/ai-automation",
    categoryTone: "accent-secondary",
    author: "Shruti Singh",
    date: "2026-12-12",
    readTime: 8,
    visual: "ai-operations",
  },
  {
    title: "10 Real-World Use Cases of AI Agents in Modern Businesses",
    href: "/articles/ai-agents-business-use-cases",
    category: "Business",
    categoryHref: "/category/business",
    categoryTone: "accent",
    author: "Shruti Singh",
    date: "2026-12-10",
    visual: "ai-agents",
  },
  {
    title: "How to Choose the Right Software Development Partner in India",
    href: "/articles/choose-software-development-partner-india",
    category: "Development",
    categoryHref: "/category/development",
    categoryTone: "primary",
    author: "Shruti Singh",
    date: "2026-12-08",
    visual: "dev-workspace",
  },
];
