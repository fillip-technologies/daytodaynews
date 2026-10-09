import type { Article, CoverSpec } from "@/types/article";
import { getTopic } from "./topics";

// Static seed content. The page reads it through lib/articles, so it can be
// swapped for API/database data without touching the UI.

type PostInput = {
  title: string;
  slug: string;
  topic: string;
  description?: string;
  date: string;
  readTime: number;
  cover: CoverSpec;
  author?: string;
};

function post({ slug, topic: topicSlug, author = "Shruti Singh", ...rest }: PostInput): Article {
  const topic = getTopic(topicSlug);
  if (!topic) throw new Error(`Unknown topic "${topicSlug}"`);
  return {
    ...rest,
    href: `/articles/${slug}`,
    author,
    topic: topic.slug,
    category: topic.label,
    categoryHref: topic.href,
    // Legacy 3-tone field; listing cards read the topic's tone instead.
    categoryTone: topic.tone === "pink" ? "accent-secondary" : topic.tone,
  };
}

export const editorsPicks: Article[] = [
  post({
    title: "n8n Automation: Use Cases, Architecture and Costs",
    slug: "n8n-automation-use-cases-architecture-costs",
    topic: "ai-automation",
    date: "2026-12-05",
    readTime: 11,
    cover: { pattern: "nodes", tones: ["accent-secondary", "pink"], icon: "sparkles" },
  }),
  post({
    title: "Custom Software Development in 2026: Complete Guide",
    slug: "custom-software-development-guide-2026",
    topic: "software",
    date: "2026-12-03",
    readTime: 14,
    cover: { pattern: "stack", tones: ["pink", "accent"], icon: "layers" },
  }),
  post({
    title: "How to Hire and Manage Dedicated Developers in India",
    slug: "hire-manage-dedicated-developers-india",
    topic: "hiring-outsourcing",
    date: "2026-11-28",
    readTime: 9,
    cover: { pattern: "people", tones: ["primary", "accent-secondary"], icon: "users" },
  }),
  post({
    title: "AI for Startups: Practical Strategies for Faster Growth",
    slug: "ai-for-startups-growth-strategies",
    topic: "business",
    date: "2026-11-25",
    readTime: 7,
    cover: { pattern: "bars", tones: ["accent", "pink"], icon: "rocket" },
  }),
];

export const latestArticles: Article[] = [
  post({
    title: "AI Agents for Business: Practical Use Cases Beyond Chatbots",
    slug: "ai-agents-business-use-cases-beyond-chatbots",
    topic: "ai-automation",
    description:
      "Where autonomous agents already save hours in sales, finance and operations — and where they still fall short.",
    date: "2026-12-11",
    readTime: 8,
    cover: { pattern: "orbit", tones: ["accent-secondary", "primary"], icon: "sparkles" },
  }),
  post({
    title: "Top Web Development Trends for 2026",
    slug: "web-development-trends-2026",
    topic: "development",
    description:
      "From server components to edge rendering: the shifts shaping how modern web products are built.",
    date: "2026-12-09",
    readTime: 7,
    cover: { pattern: "code", tones: ["primary", "accent-secondary"], icon: "code" },
  }),
  post({
    title: "How AI Automation Improves Team Productivity",
    slug: "ai-automation-team-productivity",
    topic: "business",
    description:
      "Practical ways teams reclaim time from repetitive work, with metrics you can track from week one.",
    date: "2026-12-07",
    readTime: 6,
    cover: { pattern: "bars", tones: ["accent", "accent-secondary"], icon: "chart" },
  }),
  post({
    title: "Technology Stack for Early-Stage Startups in 2026",
    slug: "startup-technology-stack-2026",
    topic: "startups",
    description:
      "A pragmatic stack for shipping fast without painting yourself into a corner as you scale.",
    date: "2026-12-05",
    readTime: 9,
    cover: { pattern: "stack", tones: ["pink", "primary"], icon: "rocket" },
  }),
  post({
    title: "AI vs Traditional Automation: What's the Difference?",
    slug: "ai-vs-traditional-automation",
    topic: "insights",
    description:
      "Rules-based workflows and AI-driven automation solve different problems. Here's how to choose.",
    date: "2026-12-03",
    readTime: 6,
    cover: { pattern: "waves", tones: ["primary", "pink"], icon: "lightbulb" },
  }),
  post({
    title: "Complete Guide to IT Staff Augmentation in India",
    slug: "it-staff-augmentation-india-guide",
    topic: "hiring-outsourcing",
    description:
      "Costs, engagement models and the questions to ask before extending your team with remote engineers.",
    date: "2026-12-01",
    readTime: 12,
    cover: { pattern: "people", tones: ["accent-secondary", "accent"], icon: "users" },
  }),
  post({
    title: "Microservices vs Monolith: Choosing the Right Architecture in 2026",
    slug: "microservices-vs-monolith-2026",
    topic: "software",
    description:
      "Team size, deployment needs and domain complexity decide the answer more than trends do.",
    date: "2026-11-29",
    readTime: 10,
    cover: { pattern: "grid", tones: ["primary", "accent"], icon: "layers" },
  }),
  post({
    title: "How Much Does It Cost to Build a Custom Web App in 2026?",
    slug: "custom-web-app-cost-2026",
    topic: "development",
    description:
      "A transparent breakdown of the scope, team and timeline decisions that drive web app budgets.",
    date: "2026-11-27",
    readTime: 8,
    cover: { pattern: "orbit", tones: ["pink", "accent"], icon: "code" },
  }),
  post({
    title: "What CTOs Should Know About AI Governance in 2026",
    slug: "cto-guide-ai-governance-2026",
    topic: "insights",
    description:
      "Policies, risk controls and ownership models for teams moving AI from pilots into production.",
    date: "2026-11-24",
    readTime: 7,
    cover: { pattern: "nodes", tones: ["primary", "accent-secondary"], icon: "lightbulb" },
  }),
];

/** Ranked most-read list. */
export const trendingArticles: Article[] = [
  post({
    title: "25 Business Processes You Can Automate With AI in 2026",
    slug: "business-processes-to-automate-with-ai-2026",
    topic: "ai-automation",
    date: "2026-11-20",
    readTime: 10,
    cover: { pattern: "bars", tones: ["accent-secondary", "accent"], icon: "sparkles" },
  }),
  post({
    title: "n8n vs Make vs Zapier for Business Automation",
    slug: "n8n-vs-make-vs-zapier",
    topic: "ai-automation",
    date: "2026-11-18",
    readTime: 9,
    cover: { pattern: "nodes", tones: ["pink", "primary"], icon: "sparkles" },
  }),
  post({
    title: "How Much Does AI Automation Cost in 2026?",
    slug: "ai-automation-cost-2026",
    topic: "business",
    date: "2026-11-15",
    readTime: 8,
    cover: { pattern: "waves", tones: ["accent", "pink"], icon: "chart" },
  }),
  post({
    title: "AI Automation for Customer Support: Practical Use Cases",
    slug: "ai-automation-customer-support",
    topic: "ai-automation",
    date: "2026-11-12",
    readTime: 7,
    cover: { pattern: "orbit", tones: ["primary", "pink"], icon: "sparkles" },
  }),
  post({
    title: "How to Choose a Software Development Company in India",
    slug: "choose-software-development-company-india",
    topic: "software",
    date: "2026-11-10",
    readTime: 9,
    cover: { pattern: "people", tones: ["accent-secondary", "primary"], icon: "users" },
  }),
];

/* ------------------------------------------------------------------------ */
/* Blog listing (/blog). Articles live at /blog/[slug].                     */
/* ------------------------------------------------------------------------ */

type BlogPostInput = PostInput & { featured?: boolean; visual?: Article["visual"] };

function blogPost({ featured, visual, ...input }: BlogPostInput): Article {
  return {
    ...post(input),
    id: input.slug,
    slug: input.slug,
    href: `/blog/${input.slug}`,
    featured,
    visual,
  };
}

export const blogArticles: Article[] = [
  blogPost({
    title: "How AI Automation Can Reduce Manual Work in Growing Businesses",
    slug: "ai-automation-reduce-manual-work",
    topic: "ai-automation",
    description:
      "A practical look at the business processes that can be automated with AI and how teams can measure the impact.",
    date: "2026-12-14",
    readTime: 9,
    featured: true,
    visual: "ai-operations",
    cover: { pattern: "orbit", tones: ["accent-secondary", "pink"], icon: "sparkles" },
  }),
  blogPost({
    title: "25 Business Processes You Can Automate With AI in 2026",
    slug: "business-processes-to-automate-with-ai-2026",
    topic: "ai-automation",
    description:
      "From invoice approvals to lead routing: a department-by-department list of automations worth piloting this year.",
    date: "2026-12-11",
    readTime: 12,
    cover: { pattern: "bars", tones: ["accent-secondary", "accent"], icon: "sparkles" },
  }),
  blogPost({
    title: "AI Agents for Business: Practical Use Cases Beyond Chatbots",
    slug: "ai-agents-business-use-cases",
    topic: "ai-automation",
    description:
      "Where autonomous agents already save hours in sales, finance and operations — and where they still fall short.",
    date: "2026-12-09",
    readTime: 8,
    cover: { pattern: "nodes", tones: ["primary", "accent-secondary"], icon: "sparkles" },
  }),
  blogPost({
    title: "AI Workflow Automation With n8n: Use Cases, Architecture and Costs",
    slug: "n8n-ai-workflow-automation",
    topic: "ai-automation",
    description:
      "How teams structure n8n workflows, where AI steps fit in, and what self-hosting really costs to run.",
    date: "2026-12-07",
    readTime: 11,
    cover: { pattern: "grid", tones: ["pink", "accent-secondary"], icon: "layers" },
  }),
  blogPost({
    title: "n8n vs Make vs Zapier for Business Automation",
    slug: "n8n-vs-make-vs-zapier",
    topic: "insights",
    description:
      "An honest comparison of pricing, flexibility, AI features and governance for growing teams.",
    date: "2026-12-05",
    readTime: 9,
    cover: { pattern: "waves", tones: ["primary", "pink"], icon: "chart" },
  }),
  blogPost({
    title: "How Much Does AI Automation Cost in 2026?",
    slug: "ai-automation-cost-2026",
    topic: "business",
    description:
      "Build, platform and running costs broken down, with the ROI questions to answer before you commit.",
    date: "2026-12-03",
    readTime: 8,
    cover: { pattern: "bars", tones: ["accent", "pink"], icon: "chart" },
  }),
  blogPost({
    title: "How to Choose a Software Development Company in India",
    slug: "choose-software-development-company-india",
    topic: "software",
    description:
      "The evaluation criteria, red flags and contract terms that separate reliable partners from risky ones.",
    date: "2026-12-01",
    readTime: 10,
    cover: { pattern: "people", tones: ["accent-secondary", "primary"], icon: "layers" },
  }),
  blogPost({
    title: "Software Development Outsourcing to India: Complete 2026 Buyer's Guide",
    slug: "software-outsourcing-india-buyers-guide",
    topic: "hiring-outsourcing",
    description:
      "Engagement models, realistic budgets, time-zone planning and how to keep quality high across borders.",
    date: "2026-11-28",
    readTime: 15,
    cover: { pattern: "orbit", tones: ["primary", "accent"], icon: "users" },
  }),
  blogPost({
    title: "How Much Does Custom Software Development Cost in India?",
    slug: "custom-software-development-cost-india",
    topic: "software",
    description:
      "Typical price ranges by project type, team composition and the scope decisions that move the number most.",
    date: "2026-11-26",
    readTime: 9,
    cover: { pattern: "stack", tones: ["pink", "primary"], icon: "layers" },
  }),
  blogPost({
    title: "How to Hire React and Next.js Developers in India",
    slug: "hire-react-nextjs-developers-india",
    topic: "hiring-outsourcing",
    description:
      "Skills to test, interview questions that work and what senior React and Next.js talent costs today.",
    date: "2026-11-24",
    readTime: 8,
    cover: { pattern: "code", tones: ["accent-secondary", "primary"], icon: "users" },
  }),
  blogPost({
    title: "Dedicated Developer vs Freelancer vs Software Agency",
    slug: "dedicated-developer-vs-freelancer-vs-agency",
    topic: "startups",
    description:
      "Which hiring model fits your stage, budget and product risk — with a simple decision framework.",
    date: "2026-11-21",
    readTime: 7,
    cover: { pattern: "people", tones: ["pink", "accent"], icon: "rocket" },
  }),
  blogPost({
    title: "React vs Next.js for Business Web Applications",
    slug: "react-vs-nextjs-business-web-apps",
    topic: "development",
    description:
      "Rendering, SEO, performance and hosting trade-offs explained for product and engineering leaders.",
    date: "2026-11-19",
    readTime: 8,
    cover: { pattern: "code", tones: ["primary", "pink"], icon: "code" },
  }),
  blogPost({
    title: "How Much Does a Web Application Cost in 2026?",
    slug: "web-application-cost-2026",
    topic: "development",
    description:
      "A transparent breakdown of the features, integrations and team choices that drive web app budgets.",
    date: "2026-11-17",
    readTime: 9,
    cover: { pattern: "stack", tones: ["accent", "accent-secondary"], icon: "code" },
  }),
  blogPost({
    title: "How to Improve Core Web Vitals Without Sacrificing Website Design",
    slug: "improve-core-web-vitals-without-sacrificing-design",
    topic: "development",
    description:
      "Practical fixes for LCP, INP and CLS that keep rich visuals, animations and brand design intact.",
    date: "2026-11-14",
    readTime: 10,
    cover: { pattern: "waves", tones: ["accent-secondary", "primary"], icon: "chart" },
  }),
  blogPost({
    title: "How to Turn Website Traffic Into Qualified Sales Leads",
    slug: "turn-website-traffic-into-qualified-leads",
    topic: "business",
    description:
      "Content, offers and follow-up workflows that convert B2B visitors into conversations with buyers.",
    date: "2026-11-11",
    readTime: 7,
    cover: { pattern: "nodes", tones: ["accent", "primary"], icon: "briefcase" },
  }),
];
