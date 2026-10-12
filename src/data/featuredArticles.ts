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
    image: {
      src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      alt: "How AI Automation Can Transform Business Operations in 2026",
    },
  },
  {
    title: "10 Real-World Use Cases of AI Agents in Modern Businesses",
    href: "/articles/ai-agents-business-use-cases",
    category: "Business",
    categoryHref: "/category/business",
    categoryTone: "accent",
    author: "Shruti Singh",
    date: "2026-12-10",
    readTime: 6,
    image: {
      src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
      alt: "10 Real-World Use Cases of AI Agents in Modern Businesses",
    },
  },
  {
    title: "How to Choose the Right Software Development Partner in India",
    href: "/articles/choose-software-development-partner-india",
    category: "Development",
    categoryHref: "/category/development",
    categoryTone: "primary",
    author: "Shruti Singh",
    date: "2026-12-08",
    readTime: 7,
    image: {
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      alt: "How to Choose the Right Software Development Partner in India",
    },
  },
];
