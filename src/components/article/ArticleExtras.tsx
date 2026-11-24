import Link from "@/i18n/Link";
import { Icon } from "@/components/ui/Icon";
import { ListingCard } from "@/components/directory/ListingCard";
import type { Dictionary } from "@/i18n/dictionaries";
import { format } from "@/i18n/config";
import type { FaqItem, ResourceLink } from "@/lib/article-extras";
import type { CategoryCta } from "@/lib/category-cta";
import type { ListingCardData } from "@/lib/directory";
import type { Article } from "@/types/article";

// The blocks the editorial framework adds to an article page: key takeaways,
// disclosures, FAQs, downloads, the guide series, related listings and the
// category's call to action.

const sectionTitle = "text-xl font-bold tracking-tight text-text-primary sm:text-2xl";

export function KeyTakeaways({ items, t, lang }: { items: string[]; t: Dictionary; lang?: string }) {
  if (items.length === 0) return null;
  return (
    <aside aria-labelledby="key-takeaways" lang={lang} className="my-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
      <h2 id="key-takeaways" className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-primary">
        <Icon name="list-checks" className="size-4" />
        {t.article.takeaways}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 text-base leading-relaxed text-text-primary">
            <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <Icon name="check" className="size-3" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function Disclosure({
  kind,
  sponsorName,
  sponsorUrl,
  t,
}: {
  kind: "SPONSORED" | "GUEST";
  sponsorName?: string | null;
  sponsorUrl?: string | null;
  t: Dictionary;
}) {
  if (kind === "GUEST") {
    return (
      <p role="note" className="flex gap-2.5 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-secondary">
        <Icon name="pen" className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>{t.article.guestDisclosure}</span>
      </p>
    );
  }
  return (
    <div role="note" className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-text-primary">
      {sponsorName && (
        <p className="font-semibold">
          {sponsorUrl ? (
            <a href={sponsorUrl} rel="sponsored noopener" target="_blank" className="underline underline-offset-4">
              {format(t.article.sponsoredBy, { sponsor: sponsorName })}
            </a>
          ) : (
            format(t.article.sponsoredBy, { sponsor: sponsorName })
          )}
        </p>
      )}
      <p className="mt-1 text-text-secondary">{t.article.sponsoredDisclosure}</p>
    </div>
  );
}

export function FaqSection({ items, t, lang }: { items: FaqItem[]; t: Dictionary; lang?: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="faq-title" lang={lang} className="mt-12">
      <h2 id="faq-title" className={sectionTitle}>
        {t.article.faqTitle}
      </h2>
      <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-surface-elevated">
        {items.map((item, index) => (
          <details key={index} className="group px-5 py-4" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-text-primary">
              <h3 className="text-base sm:text-lg">{item.q}</h3>
              <Icon name="chevronDown" className="mt-1 size-4 shrink-0 text-text-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-text-secondary">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Downloads({ items, t }: { items: ResourceLink[]; t: Dictionary }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="downloads-title" className="mt-12">
      <h2 id="downloads-title" className={sectionTitle}>
        {t.article.downloads}
      </h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              target={item.url.startsWith("/") ? undefined : "_blank"}
              rel={item.url.startsWith("/") ? undefined : "noopener"}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-4 transition-colors hover:border-primary/40"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon name="download" className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-text-primary">{item.label}</span>
                <span className="text-xs text-text-muted">{t.article.download}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The guide series: "Part of the guide" link plus the other articles of the cluster. */
export function SeriesBlock({
  pillar,
  members,
  isPillar,
  t,
}: {
  pillar: Article | null;
  members: Article[];
  isPillar: boolean;
  t: Dictionary;
}) {
  if (!pillar && members.length === 0) return null;
  return (
    <section aria-labelledby="series-title" className="mt-12 rounded-2xl border border-border bg-surface-elevated p-6">
      {pillar && (
        <Link href={pillar.href} className="group block rounded-xl bg-primary/5 p-4 transition-colors hover:bg-primary/10">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{t.article.partOfGuide}</span>
          <span lang={pillar.locale} className="mt-1 flex items-center justify-between gap-3 font-semibold text-text-primary">
            {pillar.title}
            <Icon name="arrowRight" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}
      {members.length > 0 && (
        <>
          <h2 id="series-title" className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-text-secondary first:mt-0">
            {isPillar ? t.article.pillarSeriesTitle : t.article.seriesTitle}
          </h2>
          <ul className="mt-3 space-y-2">
            {members.map((member) => (
              <li key={member.href}>
                <Link
                  href={member.href}
                  lang={member.locale}
                  className="flex items-start gap-2 text-base font-medium text-text-primary underline-offset-4 hover:text-primary hover:underline"
                >
                  <Icon name="arrowRight" className="mt-1 size-3.5 shrink-0 text-primary" />
                  {member.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export function RelatedListings({ listings, t, from }: { listings: ListingCardData[]; t: Dictionary; from: string }) {
  if (listings.length === 0) return null;
  return (
    <section aria-labelledby="listings-title" className="mt-12">
      <h2 id="listings-title" className={sectionTitle}>
        {t.article.listingsTitle}
      </h2>
      <p className="mt-1.5 text-sm text-text-muted">{t.article.listingsNote}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {listings.map((listing) => (
          <ListingCard key={listing.slug} listing={listing} t={t} from={from} />
        ))}
      </div>
    </section>
  );
}

export function CtaBox({ cta }: { cta: CategoryCta }) {
  return (
    <aside className="mt-12 overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-surface-elevated to-accent-secondary/10 p-6 sm:p-8">
      <p className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">{cta.title}</p>
      <p className="mt-2 max-w-xl text-base leading-relaxed text-text-secondary">{cta.text}</p>
      <Link
        href={cta.href}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-surface-elevated shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover"
      >
        {cta.label}
        <Icon name="arrowRight" className="size-4" />
      </Link>
    </aside>
  );
}
