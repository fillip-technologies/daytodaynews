import type { Metadata } from "next";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";
import { sectionContainer } from "@/components/home/SectionHeader";
import { FixedPageJsonLd } from "@/components/seo/FixedPageJsonLd";
import { ContactForm } from "@/components/static/ContactForm";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getI18n } from "@/i18n/server";
import { resolvePage } from "@/lib/page-content";
import { getPageContent } from "@/lib/settings";
import { toneStyle, type Tone } from "@/lib/tones";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  return fixedPageMetadata("contact", await localeFromParams(params));
}

// Card looks, in turn; the words come from Admin → Pages → Contact Us.
const channelStyles: Array<{ icon: IconName; tone: Tone }> = [
  { icon: "mail", tone: "primary" },
  { icon: "pen", tone: "accent-secondary" },
  { icon: "briefcase", tone: "accent" },
];

export default async function ContactPage() {
  const { locale } = await getI18n();
  const c = resolvePage(await getPageContent("contact"), locale);

  return (
    <main className="flex-1">
      <FixedPageJsonLd page="contact" />
      <StaticPageHero eyebrow={c.text("heroEyebrow")} title={c.text("heroTitle")} description={c.text("heroDescription")} />

      <div className={`${sectionContainer} pt-12 pb-20 sm:pt-16 sm:pb-24`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <section aria-labelledby="contact-ways-title">
            <h2 id="contact-ways-title" className="text-2xl font-semibold tracking-[-0.02em] text-text-primary">
              {c.text("helpTitle")}
            </h2>
            <p className="mt-3 leading-relaxed text-text-secondary">{c.text("helpDescription")}</p>
            <ul className="mt-8 space-y-3">
              {c.items("channels").map((channel, index) => {
                const style = channelStyles[index % channelStyles.length];
                return (
                  <li
                    key={index}
                    style={toneStyle(style.tone)}
                    className="flex gap-4 rounded-2xl border border-border bg-surface-elevated p-5"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-(color:--tone)/10 text-(color:--tone)">
                      <Icon name={style.icon} className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-text-primary">{channel.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">{channel.body}</p>
                      {channel.subject && (
                        <p className="mt-2 text-xs text-text-muted">
                          {c.text("subjectLabel")}{" "}
                          <span className="font-medium text-(color:--tone)">{channel.subject}</span>
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section
            aria-labelledby="contact-form-title"
            className="rounded-3xl border border-border bg-surface-elevated p-6 shadow-[0_24px_48px_-32px] shadow-primary/40 sm:p-8"
          >
            <h2 id="contact-form-title" className="text-2xl font-semibold tracking-[-0.02em] text-text-primary">
              {c.text("formTitle")}
            </h2>
            <p className="mt-2 text-sm text-text-muted">{c.text("formNote")}</p>
            <div className="mt-7">
              <ContactForm subjects={c.list("formSubjects")} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
