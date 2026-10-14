import type { Metadata } from "next";
import Link from "next/link";
import { sectionContainer } from "@/components/home/SectionHeader";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { StaticSection } from "@/components/static/StaticSection";
import { TopicGrid, type TopicGridItem } from "@/components/static/TopicGrid";
import { Icon, type IconName } from "@/components/ui/Icon";
import { categories } from "@/data/categories";
import { getTopic } from "@/data/topics";
import { toneStyle, type Tone } from "@/lib/tones";

export const metadata: Metadata = {
  title: "About DayTodayNews",
  description:
    "Learn about DayTodayNews and our approach to practical technology, AI, software, automation and business insights.",
  alternates: { canonical: "/about" },
};

const coverage: TopicGridItem[] = categories.map((category) => ({
  label: category.name,
  description: category.description,
  icon: category.icon ?? "sparkles",
  tone: getTopic(category.topic)?.tone ?? "primary",
  href: `/category/${category.slug}`,
}));

const principles: Array<{ title: string; body: string; icon: IconName; tone: Tone }> = [
  {
    title: "Practical over noise",
    body: "We focus on what you can apply: use cases, trade-offs, costs and implementation steps, rather than headlines for their own sake.",
    icon: "lightbulb",
    tone: "accent-secondary",
  },
  {
    title: "Explained clearly",
    body: "Complex topics like AI agents, architecture or outsourcing models are broken down in plain language, without unnecessary jargon.",
    icon: "pen",
    tone: "primary",
  },
  {
    title: "Built for decisions",
    body: "Articles are written to help readers compare options and choose confidently, whether that is a tool, a stack or a partner.",
    icon: "chart",
    tone: "accent",
  },
];

const audiences: Array<{ label: string; icon: IconName; tone: Tone }> = [
  { label: "Founders", icon: "rocket", tone: "pink" },
  { label: "Developers", icon: "code", tone: "primary" },
  { label: "Technology teams", icon: "layers", tone: "accent-secondary" },
  { label: "Business leaders", icon: "briefcase", tone: "accent" },
  { label: "Marketers", icon: "chart", tone: "pink" },
  { label: "Technology decision-makers", icon: "users", tone: "primary" },
];

const commitments = [
  "We aim to be accurate and to cite sources where they matter.",
  "We update articles when tools, prices or best practices change.",
  "Any sponsored or commercial content will be clearly labelled.",
];

export default function AboutPage() {
  return (
    <main className="flex-1">
      <StaticPageHero
        eyebrow="About DayTodayNews"
        title={
          <>
            Technology insights for people{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">building what&rsquo;s next.</span>
          </>
        }
        description="DayTodayNews covers practical technology: software development, AI and automation, business technology, startups and digital growth, written for the people who build and run modern teams."
      />

      <StaticSection
        id="why-title"
        title="Why DayTodayNews"
        description="There is no shortage of technology news. What is harder to find is guidance you can act on."
        className="pt-14 sm:pt-20"
      >
        <ul className="grid gap-4 md:grid-cols-3">
          {principles.map((item) => (
            <li
              key={item.title}
              style={toneStyle(item.tone)}
              className="rounded-2xl border border-border bg-surface-elevated p-6"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-(color:--tone)/10 text-(color:--tone)">
                <Icon name={item.icon} className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-text-primary">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-text-secondary">{item.body}</p>
            </li>
          ))}
        </ul>
      </StaticSection>

      <StaticSection
        id="coverage-title"
        title="Explore Our Coverage"
        description="Seven areas, one goal: helping you make better technology decisions."
      >
        <TopicGrid items={coverage} />
      </StaticSection>

      <StaticSection
        id="builders-title"
        title="Built for Builders"
        description="Our content is written for people making technology decisions, whether they write the code, fund the product or lead the team."
      >
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
          {audiences.map((item) => (
            <li
              key={item.label}
              style={toneStyle(item.tone)}
              className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface-elevated p-4 sm:p-5"
            >
              <span className="grid size-10 place-items-center rounded-full bg-(color:--tone)/10 text-(color:--tone)">
                <Icon name={item.icon} className="size-5" />
              </span>
              <span className="text-sm font-semibold leading-snug text-text-primary">{item.label}</span>
            </li>
          ))}
        </ul>
      </StaticSection>

      <StaticSection id="independent-title" title="Independent, Practical & Useful">
        <div className="grid gap-8 rounded-3xl border border-border bg-surface-elevated p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div className="space-y-4 text-lg leading-8 text-text-secondary">
            <p>
              We choose topics based on what readers need to understand, not on what is loudest this
              week. Where we compare tools, platforms or service models, we try to explain the
              trade-offs honestly so you can judge what fits your situation.
            </p>
            <p>
              DayTodayNews is a growing publication. If you spot an error or think something could be
              clearer, we would genuinely like to hear from you.
            </p>
          </div>
          <ul className="space-y-4">
            {commitments.map((item) => (
              <li key={item} className="flex gap-3.5">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon name="check" className="size-4" />
                </span>
                <span className="leading-relaxed text-text-primary">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </StaticSection>

      <section aria-labelledby="about-cta-title" className="pt-6 pb-20 sm:pb-24">
        <div className={sectionContainer}>
          <div className="relative isolate overflow-hidden rounded-[2rem] border border-border bg-surface-elevated px-6 py-12 text-center sm:px-12">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-br from-accent-secondary/12 via-surface-elevated to-primary/12" />
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-primary text-surface-elevated shadow-lg shadow-primary/25">
              <Icon name="pen" className="size-5" />
            </span>
            <h2 id="about-cta-title" className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-text-primary sm:text-4xl">
              Have an idea worth sharing?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-text-secondary">
              We welcome practical, well-researched ideas from people who work with technology every day.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/write-for-us"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[0.9375rem] font-semibold text-surface-elevated shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
              >
                Write for Us
                <Icon name="arrowRight" className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-full border border-border bg-surface-elevated px-6 text-[0.9375rem] font-semibold text-text-primary transition-colors hover:border-text-muted/40 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
