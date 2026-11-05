import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@/components/layout/Analytics";
import { BrandProvider } from "@/components/layout/BrandProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { I18nProvider } from "@/i18n/client";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { getSiteNavigation } from "@/lib/navigation";
import { getSiteLinks } from "@/lib/settings";
import { localizeLinks, localizeText } from "@/lib/site-links";
import { localeFromParams } from "@/lib/seo/page-metadata";
import { getSiteSeo } from "@/lib/seo/site";
import { siteDeveloper, siteGraph } from "@/lib/seo/structured-data";
import { fontVariables } from "../fonts";
import "../globals.css";

// Prerender every static page in both languages. Unknown prefixes never reach
// this layout: the proxy (src/middleware.ts) redirects them under /en.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Site-wide tags from Admin → SEO. Pages add their own title, description,
// canonical and social tags through lib/seo/metadata.
export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const site = await getSiteSeo();
  return {
    metadataBase: new URL(site.siteUrl),
    title: { default: site.defaultTitle[locale], template: site.titleTemplate[locale] },
    description: site.defaultDescription[locale] || undefined,
    applicationName: site.siteName[locale],
    publisher: site.siteName[locale],
    creator: siteDeveloper(site)?.name,
    robots: site.allowIndexing ? undefined : { index: false, follow: false },
    verification: {
      google: site.verification.google || undefined,
      other: site.verification.bing ? { "msvalidate.01": site.verification.bing } : undefined,
    },
  };
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [navigation, site, dictionary, links] = await Promise.all([
    getSiteNavigation(lang),
    getSiteSeo(),
    getDictionary(lang),
    getSiteLinks(),
  ]);
  const footerLinks = {
    exploreTitle: localizeText(links.exploreTitle, lang),
    exploreCategories: links.exploreCategories,
    groups: links.footerGroups.map((group) => ({
      title: localizeText(group.title, lang),
      links: localizeLinks(group.links, lang),
    })),
  };
  const { publisher } = site;
  const logo = {
    src: publisher.logoUrl,
    width: publisher.logoWidth,
    height: publisher.logoHeight,
    ...publisher.logoSize,
  };
  const developer = siteDeveloper(site);
  const credit = developer?.showInFooter
    ? {
        label: developer.creditLabel[lang],
        name: developer.name,
        url: developer.url,
        logoUrl: developer.logoUrl,
        logoHeight: developer.logoHeight,
      }
    : null;

  return (
    <html lang={lang} className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <JsonLd data={siteGraph(site, lang)} />
        <I18nProvider locale={lang} dictionary={dictionary}>
          <BrandProvider logo={logo}>
            <Header items={navigation.header} utilityLinks={localizeLinks(links.utility, lang)} />
            {children}
            <Footer
              sections={navigation.sections}
              links={footerLinks}
              credit={credit}
              socials={publisher.socials}
            />
          </BrandProvider>
        </I18nProvider>
        <Analytics gaId={site.analytics.gaId} gtmId={site.analytics.gtmId} />
      </body>
    </html>
  );
}
