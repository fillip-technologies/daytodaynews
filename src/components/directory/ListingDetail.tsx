import Link from "@/i18n/Link";
import { sectionContainer } from "@/components/home/SectionHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { format, localizePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import type { Listing } from "@/generated/prisma";
import { directoryPath, listingPath, type ListingKind } from "@/lib/directory-config";
import { getSimilarListings, listingLines } from "@/lib/directory";
import { getSiteSeo } from "@/lib/seo/site";
import { absoluteUrl, breadcrumbList, graph, listingNode } from "@/lib/seo/structured-data";
import { directoryTexts } from "./DirectoryIndex";
import { ListingCard, ListingLogo, TierBadge } from "./ListingCard";
import { ListingEnquiryForm } from "./ListingForms";

function Facts({ items }: { items: Array<[string, string | null | undefined]> }) {
  const kept = items.filter(([, value]) => value);
  if (kept.length === 0) return null;
  return (
    <dl className="grid gap-4 rounded-2xl border border-border bg-surface-elevated p-5 sm:grid-cols-2">
      {kept.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</dt>
          <dd className="mt-1 text-sm font-medium text-text-primary">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ListBlock({ title, text }: { title: string; text: string | null }) {
  const lines = listingLines(text);
  if (lines.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-text-secondary">
            <Icon name="check" className="mt-0.5 size-4 shrink-0 text-success" />
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** One listing's page: profile, facts, enquiry form and similar listings. */
export async function ListingDetail({
  listing,
  locale,
  from,
  preview,
}: {
  listing: Listing;
  locale: Locale;
  /** The article or page the reader came from (lead attribution). */
  from?: string;
  /** Staff preview of an unapproved listing. */
  preview: boolean;
}) {
  const kind = listing.kind as ListingKind;
  const [t, site, similar] = await Promise.all([getDictionary(locale), getSiteSeo(), getSimilarListings(listing)]);
  const d = t.directory;
  const texts = directoryTexts(kind, t);
  const url = absoluteUrl(site, localizePath(listingPath(kind, listing.slug), "en"));
  const location = [listing.city, listing.country].filter(Boolean).join(", ");
  const servicesTitle = kind === "SOFTWARE" ? d.features : kind === "STARTUP" ? d.product : d.services;
  const screenshots = listingLines(listing.screenshots);

  return (
    <main className="flex-1">
      {!preview && (
        <JsonLd
          data={graph(
            listingNode(site, { ...listing, url }),
            breadcrumbList([
              { name: t.common.home, url: absoluteUrl(site, localizePath("/", locale)) },
              { name: texts.name, url: absoluteUrl(site, localizePath(directoryPath[kind], "en")) },
              { name: listing.name, url },
            ]),
          )}
        />
      )}
      <div className={`${sectionContainer} pt-10 pb-20 sm:pt-14`}>
        <nav aria-label="Breadcrumb" className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          <Link href={directoryPath[kind]} className="hover:text-text-primary">
            ← {format(d.back, { directory: texts.name })}
          </Link>
        </nav>

        {preview && (
          <p role="status" className="mt-6 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-medium text-warning">
            {t.common.draftPreview}
          </p>
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div lang="en">
            <header className="flex items-start gap-5">
              <ListingLogo name={listing.name} logoUrl={listing.logoUrl} size="lg" />
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-[-0.02em] text-text-primary sm:text-4xl">{listing.name}</h1>
                {listing.tagline && <p className="mt-2 text-lg leading-relaxed text-text-secondary">{listing.tagline}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <TierBadge tier={listing.tier} t={t} />
                  {listing.category && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{listing.category}</span>
                  )}
                  {location && (
                    <span className="inline-flex items-center gap-1 text-sm text-text-muted">
                      <Icon name="map-pin" className="size-4" />
                      {location}
                    </span>
                  )}
                </div>
                {listing.website && (
                  <a
                    href={listing.website}
                    target="_blank"
                    // Paid (Featured) listings pass no ranking credit.
                    rel={listing.tier === "FEATURED" ? "sponsored noopener" : "noopener nofollow"}
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface-elevated px-4 text-sm font-semibold text-text-primary transition-colors hover:border-primary/40"
                  >
                    {d.visitWebsite}
                    <Icon name="external-link" className="size-4" />
                  </a>
                )}
              </div>
            </header>

            {listing.description && (
              <section className="mt-10">
                <h2 className="text-lg font-semibold text-text-primary">{d.about}</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-text-secondary">{listing.description}</p>
              </section>
            )}

            <div className="mt-8">
              <Facts
                items={[
                  [d.category, listing.category],
                  [d.location, location],
                  [d.founded, listing.foundedYear ? String(listing.foundedYear) : null],
                  [d.teamSize, listing.teamSize],
                  [d.stage, listing.stage],
                  [d.funding, listing.funding],
                  [d.pricing, listing.pricingModel],
                  [d.platforms, listing.platforms],
                ]}
              />
            </div>

            <ListBlock title={servicesTitle} text={listing.services} />
            <ListBlock title={d.specialties} text={listing.specialties} />
            <ListBlock title={d.certifications} text={listing.certifications} />
            <ListBlock title={d.useCases} text={listing.useCases} />
            <ListBlock title={d.targetCustomers} text={listing.targetCustomers} />
            <ListBlock title={d.alternatives} text={listing.alternatives} />

            {screenshots.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-text-primary">{d.screenshots}</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {screenshots.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={src}
                      src={src}
                      alt={`${listing.name} screenshot`}
                      loading="lazy"
                      className="w-full rounded-xl border border-border object-cover"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside>
            <section
              aria-labelledby="enquiry-title"
              className="rounded-3xl border border-border bg-surface-elevated p-6 shadow-[0_24px_48px_-32px] shadow-primary/40 lg:sticky lg:top-28"
            >
              <h2 id="enquiry-title" className="text-xl font-semibold text-text-primary">
                {format(d.enquiryTitle, { name: listing.name })}
              </h2>
              <p className="mt-2 text-sm text-text-muted">{format(d.enquiryNote, { name: listing.name })}</p>
              <div className="mt-6">
                {preview ? null : <ListingEnquiryForm slug={listing.slug} from={from} />}
              </div>
            </section>
          </aside>
        </div>

        {similar.length > 0 && (
          <section aria-labelledby="similar-title" className="mt-16 border-t border-border pt-10">
            <h2 id="similar-title" className="text-xl font-bold text-text-primary">
              {d.similar}
            </h2>
            <div lang="en" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((item) => (
                <ListingCard key={item.slug} listing={item} t={t} />
              ))}
            </div>
          </section>
        )}

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-text-muted">{d.disclaimer}</p>
      </div>
    </main>
  );
}
