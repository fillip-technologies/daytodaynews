import type { Metadata } from "next";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";
import { sectionContainer } from "@/components/home/SectionHeader";
import { FixedPageJsonLd } from "@/components/seo/FixedPageJsonLd";
import { ContributorForm } from "@/components/static/ContributorForm";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { StaticSection } from "@/components/static/StaticSection";
import { TopicGrid, type TopicGridItem } from "@/components/static/TopicGrid";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getI18n } from "@/i18n/server";
import { resolvePage } from "@/lib/page-content";
import { getPageContent } from "@/lib/settings";
import type { Tone } from "@/lib/tones";

export async function generateMetadata({ params }: PageProps<"/[lang]/write-for-us">): Promise<Metadata> {
  return fixedPageMetadata("write-for-us", await localeFromParams(params));
}

// Topic card looks, in turn; the words come from Admin → Pages → Write for Us.
const topicStyles: Array<{ icon: IconName; tone: Tone }> = [
  { icon: "sparkles", tone: "accent-secondary" },
  { icon: "layers", tone: "pink" },
  { icon: "code", tone: "primary" },
  { icon: "briefcase", tone: "accent" },
  { icon: "rocket", tone: "pink" },
  { icon: "users", tone: "accent-secondary" },
  { icon: "chart", tone: "accent" },
  { icon: "lightbulb", tone: "primary" },
];

export default async function WriteForUsPage() {
  const { locale } = await getI18n();
  const c = resolvePage(await getPageContent("write-for-us"), locale);
  const topics: TopicGridItem[] = c.items("topics").map((topic, index) => ({
    label: topic.label,
    description: topic.description || undefined,
    ...topicStyles[index % topicStyles.length],
  }));

  return (
    <main className="flex-1">
      <FixedPageJsonLd page="write-for-us" />
      <StaticPageHero
        eyebrow={c.text("heroEyebrow")}
        title={
          <>
            {c.text("heroTitle")}{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">{c.text("heroHighlight")}</span>
          </>
        }
        description={c.text("heroDescription")}
      />

      <StaticSection
        id="look-for-title"
        title={c.text("lookForTitle")}
        description={c.text("lookForDescription")}
        className="pt-14 sm:pt-20"
      >
        <TopicGrid items={topics} />
      </StaticSection>

      <StaticSection id="good-submissions-title" title={c.text("goodTitle")}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {c.items("goodItems").map((item, i) => (
            <li key={i} className="rounded-2xl border border-border bg-surface-elevated p-5">
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
                {c.text("beforeTitle")}
              </h2>
              <p className="mt-2 leading-relaxed text-text-secondary">{c.text("beforeDescription")}</p>
              <ul className="mt-6 space-y-3.5">
                {c.list("beforeList").map((item, index) => (
                  <li key={index} className="flex gap-3">
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
              {c.text("pitchTitle")}
            </h2>
            <p className="mt-2 text-sm text-text-muted">{c.text("pitchNote")}</p>
            <div className="mt-7">
              <ContributorForm topics={topics.map((topic) => topic.label)} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
