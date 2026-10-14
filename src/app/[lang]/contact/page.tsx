import type { Metadata } from "next";
import { sectionContainer } from "@/components/home/SectionHeader";
import { ContactForm } from "@/components/static/ContactForm";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { Icon, type IconName } from "@/components/ui/Icon";
import { toneStyle, type Tone } from "@/lib/tones";

export const metadata: Metadata = {
  title: "Contact DayTodayNews",
  description: "Get in touch with the DayTodayNews editorial and business team.",
  alternates: { canonical: "/contact" },
};

const channels: Array<{ title: string; body: string; subject: string; icon: IconName; tone: Tone }> = [
  {
    title: "General Enquiries",
    body: "Questions about DayTodayNews, feedback on the site or anything else.",
    subject: "General enquiry",
    icon: "mail",
    tone: "primary",
  },
  {
    title: "Editorial",
    body: "Corrections, article suggestions or questions about something we published.",
    subject: "Editorial",
    icon: "pen",
    tone: "accent-secondary",
  },
  {
    title: "Partnerships",
    body: "Collaboration, sponsorship or other business opportunities.",
    subject: "Partnerships",
    icon: "briefcase",
    tone: "accent",
  },
];

export default function ContactPage() {
  return (
    <main className="flex-1">
      <StaticPageHero
        eyebrow="Contact"
        title="Let’s start a conversation."
        description="Whether you have feedback, a correction, a story idea or a partnership in mind, we would like to hear from you."
      />

      <div className={`${sectionContainer} pt-12 pb-20 sm:pt-16 sm:pb-24`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <section aria-labelledby="contact-ways-title">
            <h2 id="contact-ways-title" className="text-2xl font-semibold tracking-[-0.02em] text-text-primary">
              How can we help?
            </h2>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Use the form and pick the subject that fits best, so your message reaches the right
              person.
            </p>
            <ul className="mt-8 space-y-3">
              {channels.map((channel) => (
                <li
                  key={channel.title}
                  style={toneStyle(channel.tone)}
                  className="flex gap-4 rounded-2xl border border-border bg-surface-elevated p-5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-(color:--tone)/10 text-(color:--tone)">
                    <Icon name={channel.icon} className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-text-primary">{channel.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">{channel.body}</p>
                    <p className="mt-2 text-xs text-text-muted">
                      Subject: <span className="font-medium text-(color:--tone)">{channel.subject}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="contact-form-title"
            className="rounded-3xl border border-border bg-surface-elevated p-6 shadow-[0_24px_48px_-32px] shadow-primary/40 sm:p-8"
          >
            <h2 id="contact-form-title" className="text-2xl font-semibold tracking-[-0.02em] text-text-primary">
              Send us a message
            </h2>
            <p className="mt-2 text-sm text-text-muted">All fields are required.</p>
            <div className="mt-7">
              <ContactForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
