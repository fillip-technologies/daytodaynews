import type { Metadata } from "next";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";
import Link from "@/i18n/Link";
import { sectionContainer } from "@/components/home/SectionHeader";
import { FixedPageJsonLd } from "@/components/seo/FixedPageJsonLd";
import { PageMarkdown } from "@/components/static/PageMarkdown";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { StaticSection } from "@/components/static/StaticSection";
import { TopicGrid, type TopicGridItem } from "@/components/static/TopicGrid";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getI18n } from "@/i18n/server";
import { getTopics } from "@/lib/articles";
import { resolvePage } from "@/lib/page-content";
import { getSiteSeo } from "@/lib/seo/site";
import { siteDeveloper } from "@/lib/seo/structured-data";
import { getPageContent } from "@/lib/settings";
import { toneStyle, type Tone } from "@/lib/tones";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  return fixedPageMetadata("about", await localeFromParams(params));
}

// Card looks, in turn; the words come from Admin → Pages → About Us.
const principleStyles: Array<{ icon: IconName; tone: Tone }> = [
  { icon: "lightbulb", tone: "accent-secondary" },
  { icon: "pen", tone: "primary" },
  { icon: "chart", tone: "accent" },
];
const audienceStyles: Array<{ icon: IconName; tone: Tone }> = [
  { icon: "rocket", tone: "pink" },
  { icon: "code", tone: "primary" },
  { icon: "layers", tone: "accent-secondary" },
  { icon: "briefcase", tone: "accent" },
  { icon: "chart", tone: "pink" },
  { icon: "users", tone: "primary" },
];
const styleAt = <T,>(styles: T[], index: number) => styles[index % styles.length];

export default async function AboutPage() {
  const { locale } = await getI18n();
  const [values, topics, site] = await Promise.all([getPageContent("about"), getTopics(locale), getSiteSeo()]);
  const c = resolvePage(values, locale);
  const developer = siteDeveloper(site);

  const coverage: TopicGridItem[] = c.categories("coverageCategories").flatMap((slug) => {
    const topic = topics.find((item) => item.slug === slug);
    return topic
      ? [{ label: topic.label, description: topic.description, icon: topic.icon, tone: topic.tone, href: topic.href || `/category/${slug}` }]
      : [];
  });

  return (
    <main className="flex-1">
      <FixedPageJsonLd page="about" />
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
        id="why-title"
        title={c.text("whyTitle")}
        description={c.text("whyDescription")}
        className="pt-14 sm:pt-20"
      >
        <ul className="grid gap-4 md:grid-cols-3">
          {c.items("principles").map((item, index) => {
            const style = styleAt(principleStyles, index);
            return (
              <li
                key={index}
                style={toneStyle(style.tone)}
                className="rounded-2xl border border-border bg-surface-elevated p-6"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-(color:--tone)/10 text-(color:--tone)">
                  <Icon name={style.icon} className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-text-secondary">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </StaticSection>

      {coverage.length > 0 && (
        <StaticSection id="coverage-title" title={c.text("coverageTitle")} description={c.text("coverageDescription")}>
          <TopicGrid items={coverage} />
        </StaticSection>
      )}

      <StaticSection id="builders-title" title={c.text("buildersTitle")} description={c.text("buildersDescription")}>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
          {c.list("audiences").map((label, index) => {
            const style = styleAt(audienceStyles, index);
            return (
              <li
                key={index}
                style={toneStyle(style.tone)}
                className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface-elevated p-4 sm:p-5"
              >
                <span className="grid size-10 place-items-center rounded-full bg-(color:--tone)/10 text-(color:--tone)">
                  <Icon name={style.icon} className="size-5" />
                </span>
                <span className="text-sm font-semibold leading-snug text-text-primary">{label}</span>
              </li>
            );
          })}
        </ul>
      </StaticSection>

      <StaticSection id="independent-title" title={c.text("independentTitle")}>
        <div className="grid gap-8 rounded-3xl border border-border bg-surface-elevated p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div className="space-y-4 text-lg leading-8 text-text-secondary [&_a]:font-medium [&_a]:text-primary [&_strong]:text-text-primary">
            <PageMarkdown>{c.text("independentBody")}</PageMarkdown>
          </div>
          <ul className="space-y-4">
            {c.list("commitments").map((item, index) => (
              <li key={index} className="flex gap-3.5">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon name="check" className="size-4" />
                </span>
                <span className="leading-relaxed text-text-primary">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </StaticSection>

      {developer?.showOnAbout && (
        <StaticSection
          id="team-title"
          title={`${developer.creditLabel[locale] || developer.creditLabel.en} ${developer.name}`}
        >
          <div className="flex flex-col gap-6 rounded-3xl border border-border bg-surface-elevated p-6 sm:flex-row sm:items-center sm:gap-10 sm:p-10">
            {developer.logoUrl && (
              // Any address an admin enters, so a plain <img> rather than next/image (which needs known hosts).
              // eslint-disable-next-line @next/next/no-img-element
              <img src={developer.logoUrl} alt={developer.name} loading="lazy" className="h-12 w-auto shrink-0 self-start sm:h-14 sm:self-center" />
            )}
            <div className="space-y-4">
              {(developer.description[locale] || developer.description.en) && (
                <p className="text-lg leading-8 text-text-secondary">
                  {developer.description[locale] || developer.description.en}
                </p>
              )}
              <a
                href={developer.url}
                target="_blank"
                rel="noopener"
                className="group inline-flex items-center gap-1.5 rounded-md font-semibold text-primary transition-colors hover:text-text-primary outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
              >
                {c.text("teamLinkLabel")} {developer.name}
                <Icon name="arrowRight" className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </a>
            </div>
          </div>
        </StaticSection>
      )}

      <section aria-labelledby="about-cta-title" className="pt-6 pb-20 sm:pb-24">
        <div className={sectionContainer}>
          <div className="relative isolate overflow-hidden rounded-[2rem] border border-border bg-surface-elevated px-6 py-12 text-center sm:px-12">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-br from-accent-secondary/12 via-surface-elevated to-primary/12" />
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-primary text-surface-elevated shadow-lg shadow-primary/25">
              <Icon name="pen" className="size-5" />
            </span>
            <h2 id="about-cta-title" className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-text-primary sm:text-4xl">
              {c.text("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-text-secondary">{c.text("ctaDescription")}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/write-for-us"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[0.9375rem] font-semibold text-surface-elevated shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
              >
                {c.text("ctaPrimary")}
                <Icon name="arrowRight" className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-full border border-border bg-surface-elevated px-6 text-[0.9375rem] font-semibold text-text-primary transition-colors hover:border-text-muted/40 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
              >
                {c.text("ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
