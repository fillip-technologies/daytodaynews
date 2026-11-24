import Link from "@/i18n/Link";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { sectionContainer } from "@/components/home/SectionHeader";
import { FixedPageJsonLd } from "@/components/seo/FixedPageJsonLd";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { getArticlesByType } from "@/lib/articles";

/** Sponsored Insights / Guest Contributors: every live article of that type, newest first. */
export async function ArticleTypeListing({
  type,
  locale,
  page,
}: {
  type: "SPONSORED" | "GUEST";
  locale: Locale;
  page: number;
}) {
  const [t, result] = await Promise.all([getDictionary(locale), getArticlesByType(type, page, locale)]);
  const s = t.sections;
  const texts =
    type === "SPONSORED"
      ? { key: "sponsored-insights", title: s.sponsoredTitle, highlight: s.sponsoredHighlight, intro: s.sponsoredIntro, empty: s.sponsoredEmpty, cta: s.sponsoredCta, href: "/advertise" }
      : { key: "guest-contributors", title: s.guestTitle, highlight: s.guestHighlight, intro: s.guestIntro, empty: s.guestEmpty, cta: s.guestCta, href: "/write-for-us" };
  const base = `/${texts.key}`;

  return (
    <main className="flex-1">
      <FixedPageJsonLd page={texts.key} />
      <StaticPageHero
        eyebrow={`${texts.title} ${texts.highlight}`}
        title={
          <>
            {texts.title} <span className="bg-gradient-primary bg-clip-text text-transparent">{texts.highlight}</span>
          </>
        }
        description={texts.intro}
        size="compact"
      >
        <Link
          href={texts.href}
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-surface-elevated shadow-md shadow-primary/25 transition-colors hover:bg-primary-hover"
        >
          {texts.cta}
          <Icon name="arrowRight" className="size-4" />
        </Link>
      </StaticPageHero>

      <div className={`${sectionContainer} pt-10 pb-20`}>
        {result.items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((article) => (
              <ArticleCard key={article.href} article={article} showExcerpt headingLevel="h2" />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-6 py-14 text-center text-text-muted">{texts.empty}</p>
        )}
        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          hrefFor={(p) => (p > 1 ? `${base}?page=${p}` : base)}
          className="mt-10"
        />
      </div>
    </main>
  );
}
