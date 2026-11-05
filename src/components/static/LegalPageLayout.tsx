import Link from "@/i18n/Link";
import type { ReactNode } from "react";
import { sectionContainer } from "@/components/home/SectionHeader";
import { FixedPageJsonLd } from "@/components/seo/FixedPageJsonLd";
import { getI18n } from "@/i18n/server";
import { formatDate } from "@/lib/format";
import { resolvePage } from "@/lib/page-content";
import { getPageContent } from "@/lib/settings";
import { PageMarkdown } from "./PageMarkdown";
import { StaticPageHero } from "./StaticPageHero";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalPageLayoutProps = {
  title: string;
  description: string;
  /** ISO date, or null while the document is still a draft. */
  lastUpdated: string | null;
  sections: LegalSection[];
};

/**
 * Marks business details that still need to be filled in (company name,
 * contact email, jurisdiction…) so they are easy to find and replace.
 */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-dashed border-accent/40 bg-accent/5 px-1.5 py-0.5 font-medium text-accent">
      [{children}]
    </span>
  );
}

/** A legal page (Privacy Policy, Terms, Disclaimer) with its content from Admin → Pages. */
export async function EditableLegalPage({ page }: { page: string }) {
  const { locale } = await getI18n();
  const content = resolvePage(await getPageContent(page), locale);
  return (
    <>
      <FixedPageJsonLd page={page} />
      <LegalPageLayout
        title={content.text("title")}
        description={content.text("description")}
        lastUpdated={content.text("lastUpdated") || null}
        sections={content.items("sections").map((section) => ({
          id: section.id,
          title: section.title,
          content: <PageMarkdown>{section.body}</PageMarkdown>,
        }))}
      />
    </>
  );
}

export async function LegalPageLayout({ title, description, lastUpdated, sections }: LegalPageLayoutProps) {
  const { locale, t } = await getI18n();
  return (
    <main className="flex-1">
      <StaticPageHero eyebrow={t.legal.eyebrow} title={title} description={description} size="compact">
        <p className="mt-5 text-sm text-text-muted">
          {t.legal.lastUpdated}{" "}
          {lastUpdated ? (
            <time dateTime={lastUpdated} className="font-medium text-text-secondary">
              {formatDate(lastUpdated, locale)}
            </time>
          ) : (
            <Placeholder>{t.legal.datePending}</Placeholder>
          )}
        </p>
      </StaticPageHero>

      <div className={`${sectionContainer} pt-10 pb-20 sm:pt-12`}>
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <nav aria-label={t.legal.onThisPage} className="hidden lg:block">
            <div className="sticky top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{t.legal.onThisPage}</p>
              <ol className="mt-4 space-y-1 border-l border-border">
                {sections.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-text-secondary transition-colors hover:border-primary hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <span className="mr-1.5 tabular-nums text-text-muted">{i + 1}.</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article className="max-w-3xl rounded-3xl border border-border bg-surface-elevated p-6 sm:p-10">
            {sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-28 border-b border-border py-8 first:pt-0 last:border-b-0 last:pb-0"
              >
                <h2
                  id={`${section.id}-title`}
                  className="flex items-baseline gap-3 text-xl font-semibold tracking-[-0.015em] text-text-primary sm:text-2xl"
                >
                  <span className="text-base tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-[0.9375rem] leading-7 text-text-secondary sm:text-base [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/30 [&_a]:underline-offset-4 [&_a:hover]:text-primary-hover [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-text-primary [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-primary [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5">
                  {section.content}
                </div>
              </section>
            ))}

            <p className="mt-10 rounded-2xl bg-background px-5 py-4 text-sm leading-relaxed text-text-secondary">
              {t.legal.questions}{" "}
              <Link href="/contact" className="font-semibold text-primary hover:text-text-primary">
                {t.legal.contactUs}
              </Link>
              .
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}
