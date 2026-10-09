import type { Metadata } from "next";
import { sectionContainer } from "@/components/home/SectionHeader";
import { ContributorForm } from "@/components/static/ContributorForm";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { StaticSection } from "@/components/static/StaticSection";
import { TopicGrid, type TopicGridItem } from "@/components/static/TopicGrid";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Write for DayTodayNews",
  description: "Submit technology, AI, software, business and startup ideas to DayTodayNews.",
  alternates: { canonical: "/write-for-us" },
};

const topics: TopicGridItem[] = [
  { label: "AI & Automation", description: "Agents, workflows and real use cases", icon: "sparkles", tone: "accent-secondary" },
  { label: "Software Development", description: "Architecture, delivery and costs", icon: "layers", tone: "pink" },
  { label: "Web & App Development", description: "Frameworks, performance and UX", icon: "code", tone: "primary" },
  { label: "Business Technology", description: "Systems that help teams grow", icon: "briefcase", tone: "accent" },
  { label: "Startups", description: "Stacks, teams and early decisions", icon: "rocket", tone: "pink" },
  { label: "Hiring & Outsourcing", description: "Building and scaling tech teams", icon: "users", tone: "accent-secondary" },
  { label: "Digital Growth", description: "SEO, content and conversion", icon: "chart", tone: "accent" },
  { label: "Emerging Technology", description: "What is next, explained practically", icon: "lightbulb", tone: "primary" },
];

const goodSubmissions = [
  { title: "Original and useful", body: "A fresh angle or first-hand experience readers can't find everywhere else." },
  { title: "Well researched", body: "Claims are accurate, current and supported by reliable sources." },
  { title: "Practical and actionable", body: "Readers finish with steps, frameworks or examples they can apply." },
  { title: "Clear and easy to understand", body: "Plain language, logical structure and no unnecessary jargon." },
  { title: "Relevant to our audience", body: "Written for technology and business readers making real decisions." },
];

const beforeYouSubmit = [
  "Original content only: not published elsewhere, including your own site.",
  "No plagiarism or AI-generated text passed off as original work.",
  "No excessive promotional content or unnatural links.",
  "Proper sources and attribution where necessary.",
  "Clear structure: headings, short paragraphs and examples.",
];

export default function WriteForUsPage() {
  return (
    <main className="flex-1">
      <StaticPageHero
        eyebrow="Write for DayTodayNews"
        title={
          <>
            Have an idea{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">worth sharing?</span>
          </>
        }
        description="If you work with technology and know your subject well, we would love to hear your ideas. We are looking for practical, useful articles that help our readers make better decisions."
      />

      <StaticSection
        id="look-for-title"
        title="What We Look For"
        description="Topics our readers care about most."
        className="pt-14 sm:pt-20"
      >
        <TopicGrid items={topics} />
      </StaticSection>

      <StaticSection id="good-submissions-title" title="Good Submissions">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {goodSubmissions.map((item, i) => (
            <li key={item.title} className="rounded-2xl border border-border bg-surface-elevated p-5">
              <span className="bg-gradient-primary bg-clip-text text-2xl font-semibold tabular-nums text-transparent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-semibold text-text-primary">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{item.body}</p>
            </li>
          ))}
        </ul>
      </StaticSection>

      <div className={`${sectionContainer} pt-10 pb-20 sm:pt-14 sm:pb-24`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          <section aria-labelledby="before-submit-title">
            <div className="lg:sticky lg:top-28">
              <span aria-hidden="true" className="mb-3 block h-1 w-8 rounded-full bg-gradient-primary" />
              <h2 id="before-submit-title" className="text-2xl font-semibold tracking-[-0.02em] text-text-primary sm:text-[1.875rem]">
                Before You Submit
              </h2>
              <p className="mt-2 leading-relaxed text-text-secondary">
                Please check your pitch against these guidelines.
              </p>
              <ul className="mt-6 space-y-3.5">
                {beforeYouSubmit.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                      <Icon name="check" className="size-3.5" />
                    </span>
                    <span className="leading-relaxed text-text-primary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section
            aria-labelledby="pitch-form-title"
            className="rounded-3xl border border-border bg-surface-elevated p-6 shadow-[0_24px_48px_-32px] shadow-primary/40 sm:p-8"
          >
            <h2 id="pitch-form-title" className="text-2xl font-semibold tracking-[-0.02em] text-text-primary">
              Pitch your idea
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Share a short outline first; there is no need to send a full draft.
            </p>
            <div className="mt-7">
              <ContributorForm topics={topics.map((topic) => topic.label)} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
