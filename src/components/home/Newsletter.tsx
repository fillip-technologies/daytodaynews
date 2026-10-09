"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { toneColor, toneStyle } from "@/lib/tones";
import styles from "./home.module.css";
import { sectionContainer } from "./SectionHeader";

type NewsletterProps = {
  /**
   * Called with the email on submit. Not wired to a backend yet; until it is,
   * the form only confirms locally.
   */
  onSubscribe?: (email: string) => Promise<void>;
};

export function Newsletter({ onSubscribe }: NewsletterProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    if (typeof email !== "string" || !email) return;
    setStatus("submitting");
    await onSubscribe?.(email);
    setStatus("done");
  }

  return (
    <section aria-labelledby="newsletter-title" className="py-12 sm:py-16">
      <div className={sectionContainer}>
        <div
          style={toneStyle("pink")}
          className="relative isolate overflow-hidden rounded-[2rem] border border-border bg-surface-elevated px-6 py-10 sm:px-10 sm:py-12 lg:px-14"
        >
          {/* Soft pink → purple → blue atmosphere */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-br from-(color:--tone)/20 via-accent-secondary/12 to-primary/20"
          />
          <div aria-hidden="true" className="absolute -top-24 -left-16 -z-10 size-72 rounded-full bg-(color:--tone)/20 blur-3xl" />
          <div aria-hidden="true" className="absolute -right-10 -bottom-28 -z-10 size-80 rounded-full bg-primary/20 blur-3xl" />

          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-surface-elevated bg-surface-elevated/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-secondary">
                <Icon name="mail" className="size-4" />
                The weekly brief
              </p>
              <h2
                id="newsletter-title"
                className="mt-5 text-3xl leading-[1.1] font-semibold tracking-[-0.03em] text-text-primary sm:text-4xl lg:text-[2.75rem]"
              >
                Stay ahead of what&apos;s next.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
                Weekly insights on AI, software, automation and the technologies shaping modern
                businesses.
              </p>

              {status === "done" ? (
                <p role="status" className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-surface-elevated px-5 py-3 text-sm font-medium text-text-primary shadow-sm">
                  <span className="grid size-6 place-items-center rounded-full bg-success text-surface-elevated">
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                  </span>
                  Thanks for your interest! Newsletter sign-ups are opening soon.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="mt-7 flex max-w-lg flex-col gap-3 sm:flex-row">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Your email address"
                    className="h-12 w-full min-w-0 rounded-full border border-border bg-surface-elevated px-5 sm:flex-1 text-[0.9375rem] text-text-primary shadow-sm transition-[border-color,box-shadow] placeholder:text-text-muted hover:border-text-muted/40 focus:border-primary focus:shadow-[0_0_0_4px] focus:shadow-primary/15 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-[0.9375rem] font-semibold text-surface-elevated shadow-md shadow-accent/25 transition-[translate,box-shadow] duration-200 hover:-translate-y-px hover:shadow-lg hover:shadow-accent/35 disabled:opacity-70 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0"
                  >
                    Subscribe
                    <Icon
                      name="arrowRight"
                      className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                    />
                  </button>
                </form>
              )}
              <p className="mt-3 text-xs text-text-muted">Free, weekly and practical. Unsubscribe anytime.</p>
            </div>

            <NewsletterVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

const white = (opacity = 1) =>
  opacity === 1
    ? "var(--color-surface-elevated)"
    : `color-mix(in srgb, var(--color-surface-elevated) ${opacity * 100}%, transparent)`;

/** Envelope with issue cards fanning out of it. */
function NewsletterVisual() {
  const issues = [
    { x: 70, y: 60, rotate: -10, tone: toneColor["accent-secondary"], cls: styles.floatDelayed },
    { x: 196, y: 44, rotate: 8, tone: toneColor.accent, cls: styles.float },
  ];

  return (
    <svg viewBox="0 0 400 300" aria-hidden="true" className="mx-auto hidden w-full max-w-sm lg:block">
      <defs>
        <linearGradient id="nl-flap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: toneColor.primary }} />
          <stop offset="55%" style={{ stopColor: toneColor["accent-secondary"] }} />
          <stop offset="100%" style={{ stopColor: toneColor.pink }} />
        </linearGradient>
      </defs>

      {/* Issue cards */}
      {issues.map((issue) => (
        <g key={issue.x} className={issue.cls}>
          <g transform={`rotate(${issue.rotate} ${issue.x + 60} ${issue.y + 70})`}>
            <rect x={issue.x} y={issue.y} width={120} height={140} rx={14} style={{ fill: white(), filter: "drop-shadow(0 10px 14px color-mix(in srgb, var(--color-text-primary) 8%, transparent))" }} />
            <rect x={issue.x + 10} y={issue.y + 10} width={100} height={52} rx={9} style={{ fill: issue.tone }} />
            <circle cx={issue.x + 60} cy={issue.y + 36} r={12} style={{ fill: white(0.9) }} />
            <rect x={issue.x + 10} y={issue.y + 74} width={86} height={7} rx={3.5} style={{ fill: "var(--color-text-primary)" }} />
            <rect x={issue.x + 10} y={issue.y + 88} width={64} height={7} rx={3.5} style={{ fill: "var(--color-text-primary)" }} />
            <rect x={issue.x + 10} y={issue.y + 106} width={96} height={5} rx={2.5} style={{ fill: "var(--color-border)" }} />
            <rect x={issue.x + 10} y={issue.y + 118} width={72} height={5} rx={2.5} style={{ fill: "var(--color-border)" }} />
          </g>
        </g>
      ))}

      {/* Envelope */}
      <g>
        <rect x={60} y={150} width={280} height={130} rx={18} style={{ fill: white(), filter: "drop-shadow(0 16px 24px color-mix(in srgb, var(--color-text-primary) 10%, transparent))" }} />
        <path d="M60 168 L200 238 L340 168 V150 a18 18 0 0 0 -18 -18 H78 a18 18 0 0 0 -18 18 Z" transform="translate(0 18)" fill="url(#nl-flap)" opacity={0.95} />
        <path d="M60 272 L160 214 M340 272 L240 214" strokeWidth={2} style={{ stroke: "var(--color-border)" }} />
        <circle cx={200} cy={236} r={20} style={{ fill: white(), stroke: white(0.6) }} strokeWidth={4} />
        <path d="M200 224 C202 232 204 234 212 236 C204 238 202 240 200 248 C198 240 196 238 188 236 C196 234 198 232 200 224Z" style={{ fill: toneColor.accent }} />
      </g>

      {/* Chips */}
      <g className={styles.float}>
        <rect x={286} y={96} width={104} height={34} rx={17} style={{ fill: white() }} />
        <circle cx={304} cy={113} r={7} style={{ fill: "var(--color-success)" }} />
        <text x={318} y={117} fontSize={11.5} fontWeight={600} style={{ fill: "var(--color-text-primary)" }}>
          Every Friday
        </text>
      </g>
      <g className={styles.floatDelayed}>
        <rect x={10} y={180} width={36} height={36} rx={11} style={{ fill: white() }} />
        <path d="M20 205 V197 M28 205 V190 M36 205 V194" strokeWidth={3} strokeLinecap="round" style={{ stroke: toneColor.primary }} />
      </g>
    </svg>
  );
}
