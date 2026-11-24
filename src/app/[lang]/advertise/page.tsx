import type { Metadata } from "next";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";
import { sectionContainer } from "@/components/home/SectionHeader";
import { FixedPageJsonLd } from "@/components/seo/FixedPageJsonLd";
import { AdvertiseForm } from "@/components/static/AdvertiseForm";
import { PageMarkdown } from "@/components/static/PageMarkdown";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { StaticSection } from "@/components/static/StaticSection";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getI18n } from "@/i18n/server";
import { resolvePage } from "@/lib/page-content";
import { getPageContent } from "@/lib/settings";

export async function generateMetadata({ params }: PageProps<"/[lang]/advertise">): Promise<Metadata> {
  return fixedPageMetadata("advertise", await localeFromParams(params));
}

const optionIcons: IconName[] = ["file-text", "layout-template", "mail", "sparkles", "rocket", "building-2", "megaphone", "users"];

// Content: Admin → Pages → Advertise. Enquiries arrive in Admin → Leads.
export default async function AdvertisePage() {
  const { locale } = await getI18n();
  const c = resolvePage(await getPageContent("advertise"), locale);
  const options = c.items("options");
  const stats = c.items("stats").filter((s) => s.value && s.label);
  const mediaKitUrl = c.text("mediaKitUrl");

  return (
    <main className="flex-1">
      <FixedPageJsonLd page="advertise" />
      <StaticPageHero
        eyebrow={c.text("heroEyebrow")}
        title={
          <>
            {c.text("heroTitle")}{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">{c.text("heroHighlight")}</span>
          </>
        }
        description={c.text("heroDescription")}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#advertise-form-title"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[0.9375rem] font-semibold text-surface-elevated shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover"
          >
            {c.text("formTitle")}
            <Icon name="arrowRight" className="size-4" />
          </a>
          {/^https?:\/\//.test(mediaKitUrl) && (
            <a
              href={mediaKitUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-surface-elevated px-6 text-[0.9375rem] font-semibold text-text-primary transition-colors hover:border-primary/40"
            >
              <Icon name="download" className="size-4" />
              {c.text("mediaKitLabel")}
            </a>
          )}
        </div>
      </StaticPageHero>

      <StaticSection
        id="options-title"
        title={c.text("optionsTitle")}
        description={c.text("optionsDescription")}
        className="pt-14 sm:pt-20"
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((option, index) => (
            <li key={index} className="rounded-2xl border border-border bg-surface-elevated p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon name={optionIcons[index % optionIcons.length]} className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">{option.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{option.body}</p>
            </li>
          ))}
        </ul>
      </StaticSection>

      <StaticSection id="audience-title" title={c.text("audienceTitle")} description={c.text("audienceDescription")}>
        {stats.length > 0 && (
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="rounded-2xl border border-border bg-surface-elevated p-6">
                <dt className="text-sm text-text-muted">{stat.label}</dt>
                <dd className="mt-1 bg-gradient-primary bg-clip-text text-3xl font-semibold tabular-nums text-transparent">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </StaticSection>

      <div className={`${sectionContainer} pt-10 pb-20 sm:pt-14 sm:pb-24`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          <section aria-labelledby="disclosure-title">
            <div className="lg:sticky lg:top-28">
              <span aria-hidden="true" className="mb-3 block h-1 w-8 rounded-full bg-gradient-primary" />
              <h2 id="disclosure-title" className="text-2xl font-semibold tracking-[-0.02em] text-text-primary sm:text-[1.875rem]">
                {c.text("disclosureTitle")}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-text-secondary [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_strong]:text-text-primary">
                <PageMarkdown>{c.text("disclosureBody")}</PageMarkdown>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="advertise-form-title"
            className="rounded-3xl border border-border bg-surface-elevated p-6 shadow-[0_24px_48px_-32px] shadow-primary/40 sm:p-8"
          >
            <h2 id="advertise-form-title" className="scroll-mt-28 text-2xl font-semibold tracking-[-0.02em] text-text-primary">
              {c.text("formTitle")}
            </h2>
            <p className="mt-2 text-sm text-text-muted">{c.text("formNote")}</p>
            <div className="mt-7">
              <AdvertiseForm options={options.map((o) => o.title)} budgets={c.list("budgets")} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
