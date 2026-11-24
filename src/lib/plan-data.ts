// The 36 core articles of the 90-day plan (10 Nov 2026 – 7 Feb 2027), as
// imported into Admin → Editorial Plan. Where the site already has an article
// on the same search intent, the plan says to update and consolidate it instead
// of publishing a duplicate: those rows are REFRESH items pointing at the
// existing article. Three a week, published Wednesday, Thursday and Saturday.

export type PlanSeed = {
  number: number;
  title: string;
  focusKeyword: string;
  category: string;
  wordTarget: number;
  month: 1 | 2 | 3;
  /** Existing article to refresh instead of writing a new one. */
  refresh?: string;
  notes?: string;
};

export const PLAN_START = "2026-11-11";

export const planSeeds: PlanSeed[] = [
  // Month 1 — Build topical authority (AI, automation, software technology)
  { number: 1, month: 1, title: "AI Workflow Automation: Complete Guide for Businesses", focusKeyword: "AI workflow automation", category: "AI & Automation", wordTarget: 2200, refresh: "n8n-ai-workflow-automation", notes: "Merge 'n8n Automation: Use Cases, Architecture and Costs' into this article and redirect it (Admin → Redirects)." },
  { number: 2, month: 1, title: "AI Agents vs Chatbots: Differences, Use Cases and Business Benefits", focusKeyword: "AI agents vs chatbots", category: "AI & Automation", wordTarget: 1800, refresh: "ai-agents-business-use-cases" },
  { number: 3, month: 1, title: "Business Process Automation: 25 Processes Businesses Can Automate", focusKeyword: "business process automation", category: "AI & Automation", wordTarget: 2200 },
  { number: 4, month: 1, title: "How to Build an AI Agent for Your Business: A Practical Guide", focusKeyword: "how to build an AI agent", category: "AI & Automation", wordTarget: 2000 },
  { number: 5, month: 1, title: "Best AI Automation Tools for Small and Medium Businesses", focusKeyword: "AI automation tools", category: "AI & Automation", wordTarget: 2200, notes: "Link to and from 'n8n vs Make vs Zapier' (different intent: a comparison of three tools)." },
  { number: 6, month: 1, title: "AI Automation for Customer Support: Use Cases and Implementation", focusKeyword: "AI customer support automation", category: "AI & Automation", wordTarget: 1800, refresh: "ai-automation-customer-support" },
  { number: 7, month: 1, title: "AI Automation for Sales: Lead Generation, Follow-ups and CRM", focusKeyword: "AI sales automation", category: "Business Technology", wordTarget: 1900 },
  { number: 8, month: 1, title: "AI Automation for HR and Recruitment: A Complete Guide", focusKeyword: "AI automation for HR", category: "AI & Automation", wordTarget: 1800 },
  { number: 9, month: 1, title: "AI in Accounting and Finance: Applications, Benefits and Risks", focusKeyword: "AI in accounting", category: "Industry Technology", wordTarget: 1800 },
  { number: 10, month: 1, title: "AI Automation Cost: Development, Integration and Maintenance", focusKeyword: "AI automation cost", category: "Business Technology", wordTarget: 2000, refresh: "ai-automation-cost-2026" },
  { number: 11, month: 1, title: "AI vs RPA: Which Automation Technology Should Businesses Choose?", focusKeyword: "AI vs RPA", category: "AI & Automation", wordTarget: 1800, refresh: "ai-vs-traditional-automation" },
  { number: 12, month: 1, title: "AI Governance for Businesses: Security, Privacy and Compliance", focusKeyword: "AI governance", category: "AI & Automation", wordTarget: 2000, refresh: "cto-guide-ai-governance-2026" },

  // Month 2 — Software, SaaS and startup authority
  { number: 13, month: 2, title: "Custom Software Development: Complete Business Guide", focusKeyword: "custom software development", category: "Software & IT", wordTarget: 2500, refresh: "custom-software-development-guide-2026" },
  { number: 14, month: 2, title: "Custom Software Development Cost: Complete Pricing Guide", focusKeyword: "custom software development cost", category: "Software & IT", wordTarget: 2200, refresh: "custom-software-development-cost-india", notes: "Make it global (not India-only); keep India as one region in the comparison." },
  { number: 15, month: 2, title: "SaaS vs Custom Software: Which Is Better for Your Business?", focusKeyword: "SaaS vs custom software", category: "Software & IT", wordTarget: 1900 },
  { number: 16, month: 2, title: "ERP vs CRM: Differences, Features and Business Applications", focusKeyword: "ERP vs CRM", category: "Software & IT", wordTarget: 1800 },
  { number: 17, month: 2, title: "How to Choose a Software Development Company", focusKeyword: "software development company", category: "Software & IT", wordTarget: 2200, refresh: "choose-software-development-company-india", notes: "Make it global; link to the Business Directory (software development companies)." },
  { number: 18, month: 2, title: "Offshore vs Onshore Software Development: Cost and Benefits", focusKeyword: "offshore software development", category: "Software & IT", wordTarget: 2000, notes: "Link to 'Software Development Outsourcing to India' as a supporting article." },
  { number: 19, month: 2, title: "Web Application vs Website: Differences and Business Use Cases", focusKeyword: "web application vs website", category: "Software & IT", wordTarget: 1700, notes: "Consolidate the two web-app cost articles (custom-web-app-cost-2026 / web-application-cost-2026) into one and redirect the other." },
  { number: 20, month: 2, title: "Mobile App Development Cost: Complete Business Guide", focusKeyword: "mobile app development cost", category: "Software & IT", wordTarget: 2000 },
  { number: 21, month: 2, title: "API Integration: Business Benefits, Process and Costs", focusKeyword: "API integration", category: "Software & IT", wordTarget: 1800 },
  { number: 22, month: 2, title: "Cloud vs On-Premise Software: Which Is Right for Your Business?", focusKeyword: "cloud vs on premise software", category: "Software & IT", wordTarget: 1900 },
  { number: 23, month: 2, title: "How to Build a SaaS Product: From Idea to Launch", focusKeyword: "how to build a SaaS product", category: "Startups", wordTarget: 2300 },
  { number: 24, month: 2, title: "MVP Development: Cost, Process and Technology Stack", focusKeyword: "MVP development", category: "Startups", wordTarget: 2000, notes: "Link to 'Technology Stack for Early-Stage Startups in 2026'." },

  // Month 3 — Commercial discovery, industry use cases and global reach
  { number: 25, month: 3, title: "25 Best Business Automation Ideas for Small Businesses", focusKeyword: "business automation ideas", category: "Business Growth", wordTarget: 2000 },
  { number: 26, month: 3, title: "Digital Transformation for Small Businesses: Complete Guide", focusKeyword: "digital transformation for small business", category: "Business Growth", wordTarget: 2200 },
  { number: 27, month: 3, title: "How to Generate B2B Leads Through Your Website", focusKeyword: "B2B lead generation", category: "Business Growth", wordTarget: 1900, refresh: "turn-website-traffic-into-qualified-leads" },
  { number: 28, month: 3, title: "Best CRM Software for Small Businesses: Features and Selection", focusKeyword: "CRM software for small business", category: "Software & IT", wordTarget: 2200, notes: "Link to the Software Directory (CRM)." },
  { number: 29, month: 3, title: "AI in Healthcare: Applications, Benefits and Challenges", focusKeyword: "AI in healthcare", category: "Industry Technology", wordTarget: 2000 },
  { number: 30, month: 3, title: "AI in Education: Applications and Future Opportunities", focusKeyword: "AI in education", category: "Industry Technology", wordTarget: 1900 },
  { number: 31, month: 3, title: "Smart Manufacturing: Industrial Automation and Industry 4.0", focusKeyword: "smart manufacturing", category: "Industry Technology", wordTarget: 2000 },
  { number: 32, month: 3, title: "How to Start a Software Company: Business Model and Growth", focusKeyword: "how to start a software company", category: "Startups", wordTarget: 2200 },
  { number: 33, month: 3, title: "How to Find Technology Partners for Your Business", focusKeyword: "technology partners", category: "Business Opportunities", wordTarget: 1800 },
  { number: 34, month: 3, title: "How to Choose an IT Services Company: Complete Checklist", focusKeyword: "IT services company", category: "Software & IT", wordTarget: 2000 },
  { number: 35, month: 3, title: "Global SaaS Market: Business Models, Opportunities and Trends", focusKeyword: "SaaS business opportunities", category: "Startups", wordTarget: 2000 },
  { number: 36, month: 3, title: "How to List Your Business in Online Business Directories", focusKeyword: "online business directory", category: "Business Opportunities", wordTarget: 1800, notes: "Link to the Business Directory submission page." },
];

/** Extra plan items from the plan's other sections (pillar guide, research resources). */
export const planExtras: Array<Omit<PlanSeed, "number"> & { number: number }> = [
  { number: 37, month: 1, title: "AI Automation for Business: Complete Guide (pillar)", focusKeyword: "AI automation for business", category: "AI & Automation", wordTarget: 3000, notes: "Pillar guide of the AI automation cluster (plan section 7). Mark it as a pillar; articles 1–12 link to it." },
  { number: 38, month: 3, title: "Research resource 1 (e.g. Software Development Cost Benchmark Report)", focusKeyword: "software development cost benchmark", category: "Software & IT", wordTarget: 2500, notes: "Plan target: 2 original research resources in 90 days." },
  { number: 39, month: 3, title: "Research resource 2 (e.g. Business Automation Trends Report)", focusKeyword: "business automation trends", category: "AI & Automation", wordTarget: 2500, notes: "Plan target: 2 original research resources in 90 days." },
];

/** Due date of plan item n: three a week (Wed, Thu, Sat) from PLAN_START. */
export function planDueDate(number: number): Date {
  const week = Math.floor((number - 1) / 3);
  const slot = (number - 1) % 3;
  const offset = [0, 1, 3][slot] + week * 7;
  const date = new Date(`${PLAN_START}T09:00:00+05:30`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}

/** The plan's per-article SEO checklist (section 5, "SEO requirements for every article"). */
export const planChecklist = [
  ["intent", "One search intent and focus keyword"],
  ["secondary", "Secondary keywords"],
  ["h1", "One descriptive H1"],
  ["headings", "H2/H3 structure"],
  ["meta", "SEO title & meta description"],
  ["slug", "Descriptive slug"],
  ["image", "Original featured image"],
  ["internal", "3–5 internal links"],
  ["external", "Authoritative sources"],
  ["date", "Publication date"],
  ["updated", "Updated date (refresh)"],
  ["schema", "Article structured data"],
  ["alt", "Image alt text"],
  ["faq", "FAQs"],
  ["factcheck", "Human fact-check"],
  ["cta", "CTA / directory links"],
] as const;
