import Link from "@/i18n/Link";
import { sectionContainer } from "@/components/home/SectionHeader";
import { FixedPageJsonLd } from "@/components/seo/FixedPageJsonLd";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import type { ListingKind } from "@/lib/directory-config";
import { directoryTexts } from "./DirectoryIndex";
import { ListingSubmitForm } from "./ListingForms";

/** List your business / Submit a tool / Submit your startup, with the free and premium options. */
export async function DirectorySubmit({ kind, locale, seoPage }: { kind: ListingKind; locale: Locale; seoPage: string }) {
  const t = await getDictionary(locale);
  const d = t.directory;
  const texts = directoryTexts(kind, t);
  const title = { BUSINESS: d.submitTitleBusiness, SOFTWARE: d.submitTitleSoftware, STARTUP: d.submitTitleStartup }[kind];
  const plans = [
    { name: d.planBasic, text: d.planBasicText, icon: "check" },
    { name: d.planVerified, text: d.planVerifiedText, icon: "badge-check" },
    { name: d.planFeatured, text: d.planFeaturedText, icon: "star" },
  ];

  return (
    <main className="flex-1">
      <FixedPageJsonLd page={seoPage} />
      <StaticPageHero eyebrow={texts.name} title={title} description={d.submitIntro} size="compact" />

      <div className={`${sectionContainer} pt-10 pb-20`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-14">
          <section aria-labelledby="plans-title">
            <div className="lg:sticky lg:top-28">
              <h2 id="plans-title" className="text-2xl font-semibold tracking-[-0.02em] text-text-primary">
                {d.plansTitle}
              </h2>
              <ul className="mt-6 space-y-3">
                {plans.map((plan) => (
                  <li key={plan.name} className="flex gap-3 rounded-2xl border border-border bg-surface-elevated p-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon name={plan.icon} className="size-4" />
                    </span>
                    <span>
                      <span className="block font-semibold text-text-primary">{plan.name}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-text-secondary">{plan.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/advertise"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-text-primary"
              >
                {d.planContact}
                <Icon name="arrowRight" className="size-4" />
              </Link>
              <p className="mt-8 text-xs leading-relaxed text-text-muted">{d.disclaimer}</p>
            </div>
          </section>

          <section
            aria-label={title}
            lang="en"
            className="rounded-3xl border border-border bg-surface-elevated p-6 shadow-[0_24px_48px_-32px] shadow-primary/40 sm:p-8"
          >
            <ListingSubmitForm kind={kind} />
          </section>
        </div>
      </div>
    </main>
  );
}
