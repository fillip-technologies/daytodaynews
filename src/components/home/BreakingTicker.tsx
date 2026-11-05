import type { CSSProperties } from "react";
import Link from "@/i18n/Link";
import { getI18n } from "@/i18n/server";
import { cn } from "@/lib/cn";
import type { Article } from "@/types/article";
import styles from "./home.module.css";
import { sectionContainer } from "./SectionHeader";

/** Seconds each headline gets on screen, which sets the scroll speed. */
const SECONDS_PER_HEADLINE = 7;

/**
 * Strip of headlines scrolling right to left. The list runs twice so the loop
 * is seamless; the second copy is hidden from assistive tech and the keyboard.
 * Hover or focus pauses it; with reduced motion it's a still row that scrolls by hand.
 */
export async function BreakingTicker({ title, articles }: { title?: string; articles: Article[] }) {
  if (articles.length === 0) return null;
  const { locale, t } = await getI18n();
  const label = title || t.home.breaking;

  const headlines = (copy: boolean) =>
    articles.map((article) => (
      <li key={article.href} className="flex shrink-0 items-center gap-3 pr-8">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
        <Link
          href={article.href}
          tabIndex={copy ? -1 : undefined}
          lang={article.locale && article.locale !== locale ? article.locale : undefined}
          className="rounded-sm text-sm font-medium whitespace-nowrap text-text-primary transition-colors hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
        >
          {article.title}
        </Link>
      </li>
    ));

  return (
    <section aria-label={label} className="border-b border-border bg-surface-elevated">
      <div className={cn(sectionContainer, "flex h-11 items-center gap-4")}>
        <p className="flex shrink-0 items-center gap-2 rounded-md bg-accent px-2.5 py-1 text-[0.6875rem] font-bold tracking-[0.12em] text-surface-elevated uppercase">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-surface-elevated motion-safe:animate-pulse" />
          {label}
        </p>
        <div className={cn("min-w-0 flex-1", styles.tickerWindow)}>
          <div
            style={{ "--ticker-duration": `${articles.length * SECONDS_PER_HEADLINE}s` } as CSSProperties}
            className={cn("flex w-max", styles.ticker)}
          >
            <ul className="flex">{headlines(false)}</ul>
            <ul aria-hidden="true" className="flex">
              {headlines(true)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
