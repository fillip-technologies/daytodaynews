import Link from "@/i18n/Link";
import { AdSlot } from "@/components/ads/AdSlot";
import { sectionContainer } from "@/components/home/SectionHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { localizePath, plural, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { directoryPath, submitPath, type ListingKind } from "@/lib/directory-config";
import { getDirectoryFacets, searchListings } from "@/lib/directory";
import { parsePage } from "@/lib/pagination";
import { getSiteSeo } from "@/lib/seo/site";
import { absoluteUrl, breadcrumbList, collectionNode, graph } from "@/lib/seo/structured-data";
import { ListingCard } from "./ListingCard";

export type DirectorySearchParams = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.slice(0, 120) ?? "";

/** Whether the request is a filtered or later page (kept out of search results). */
export function isFilteredDirectory(params: DirectorySearchParams) {
  return Boolean(one(params.q) || one(params.category) || one(params.country) || parsePage(params.page) > 1);
}

export function directoryTexts(kind: ListingKind, t: Awaited<ReturnType<typeof getDictionary>>) {
  const d = t.directory;
  return {
    BUSINESS: { name: d.businessName, intro: d.businessIntro, submit: d.submitBusiness },
    SOFTWARE: { name: d.softwareName, intro: d.softwareIntro, submit: d.submitSoftware },
    STARTUP: { name: d.startupName, intro: d.startupIntro, submit: d.submitStartup },
  }[kind];
}

/** A directory's index: search, filters, listings (Featured first) and the submission call to action. */
export async function DirectoryIndex({
  kind,
  locale,
  searchParams,
}: {
  kind: ListingKind;
  locale: Locale;
  searchParams: DirectorySearchParams;
}) {
  const query = one(searchParams.q);
  const category = one(searchParams.category);
  const country = one(searchParams.country);
  const page = parsePage(searchParams.page);

  const [t, site, facets, results] = await Promise.all([
    getDictionary(locale),
    getSiteSeo(),
    getDirectoryFacets(kind),
    searchListings({ kind, query, category, country, page }),
  ]);
  const texts = directoryTexts(kind, t);
  const base = directoryPath[kind];
  const filtered = Boolean(query || category || country);

  const hrefFor = (target: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    if (country) params.set("country", country);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const pageUrl = absoluteUrl(site, localizePath(base, "en"));
  const structuredData = graph(
    collectionNode(site, locale, { url: pageUrl, name: texts.name, description: texts.intro }),
    breadcrumbList([
      { name: t.common.home, url: absoluteUrl(site, localizePath("/", locale)) },
      { name: texts.name, url: pageUrl },
    ]),
  );

  const selectClass =
    "h-12 w-full rounded-xl border border-border bg-surface-elevated px-4 text-[0.9375rem] text-text-primary focus:border-primary focus:outline-none sm:w-56";

  return (
    <main className="flex-1">
      <JsonLd data={structuredData} />
      <StaticPageHero eyebrow={texts.name} title={texts.name} description={texts.intro} size="compact">
        <div className="mt-7">
          <Link
            href={submitPath(kind)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-surface-elevated shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover"
          >
            <Icon name="plus" className="size-4" />
            {texts.submit}
          </Link>
        </div>
      </StaticPageHero>

      <div className={`${sectionContainer} pt-10 pb-20`}>
        {/* Plain GET form: works without JavaScript, results are shareable links. */}
        <form action={localizePath(base, locale)} method="get" role="search" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <label className="sr-only" htmlFor="directory-q">
            {t.directory.searchLabel}
          </label>
          <input
            id="directory-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder={t.directory.searchPlaceholder}
            className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface-elevated px-4 text-[0.9375rem] text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
          {facets.categories.length > 0 && (
            <select name="category" defaultValue={category} aria-label={t.directory.allCategories} className={selectClass}>
              <option value="">{t.directory.allCategories}</option>
              {facets.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          {facets.countries.length > 0 && (
            <select name="country" defaultValue={country} aria-label={t.directory.allCountries} className={selectClass}>
              <option value="">{t.directory.allCountries}</option>
              {facets.countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-surface-elevated hover:bg-primary-hover"
          >
            <Icon name="search" className="size-4" />
            {t.directory.apply}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-muted" aria-live="polite">
            {plural(t.directory.results, results.total)}
          </p>
          {filtered && (
            <Link href={base} className="text-sm font-semibold text-primary hover:text-text-primary">
              {t.directory.clear}
            </Link>
          )}
        </div>

        <AdSlot placement="directory" locale={locale} />

        {results.items.length > 0 ? (
          <div lang="en" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.items.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} t={t} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
            <p className="text-lg font-semibold text-text-primary">{t.directory.empty}</p>
            <Link href={submitPath(kind)} className="mt-3 inline-block text-sm font-semibold text-primary hover:text-text-primary">
              {t.directory.emptyCta} →
            </Link>
          </div>
        )}

        <Pagination page={results.page} pageCount={results.pageCount} hrefFor={hrefFor} className="mt-10" />

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-text-muted">{t.directory.disclaimer}</p>
      </div>
    </main>
  );
}
