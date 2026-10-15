import { localeTags, localizePath, type Locale } from "@/i18n/config";
import type { SiteSeo } from "./site-config";

// schema.org structured data (JSON-LD), built from Admin → SEO. It tells search
// engines and AI assistants who publishes DayTodayNews, who designs and manages
// it, and what each article and category page is. Every page carries the site
// graph (layout); article and category pages add their own nodes, linked by @id.

type Node = Record<string, unknown>;

/** Absolute URL for a site path ("/en/about") or an already absolute URL. */
export function absoluteUrl(site: SiteSeo, pathOrUrl: string) {
  return new URL(pathOrUrl, site.siteUrl).toString();
}

/** The company credited for designing and managing the site, when one is set. */
export function siteDeveloper(site: SiteSeo) {
  const { name, url } = site.developer;
  return name && url ? site.developer : null;
}

const websiteId = (site: SiteSeo) => `${site.siteUrl}/#website`;
const publisherId = (site: SiteSeo) => `${site.siteUrl}/#publisher`;
// Keyed to the company's own domain, so its pages and ours describe one entity.
const developerId = (url: string) => `${new URL(url).origin}/#organization`;

const imageObject = (site: SiteSeo, url: string) => (url ? { "@type": "ImageObject", url: absoluteUrl(site, url) } : undefined);

const listOrUndefined = (list: string[]) => (list.length ? [...new Set(list)] : undefined);

export function graph(...nodes: Node[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** The publication, enough to stand alone where an article names its publisher. */
function publisherRef(site: SiteSeo, locale: Locale): Node {
  return {
    "@type": "NewsMediaOrganization",
    "@id": publisherId(site),
    name: site.siteName[locale],
    url: absoluteUrl(site, localizePath("/", locale)),
    logo: imageObject(site, site.publisher.logoUrl),
  };
}

/** Publisher, developer and website: on every public page. */
export function siteGraph(site: SiteSeo, locale: Locale) {
  const developer = siteDeveloper(site);
  const devRef = developer ? { "@id": developerId(developer.url) } : undefined;
  const { publisher } = site;

  const nodes: Node[] = [
    {
      ...publisherRef(site, locale),
      description: site.defaultDescription[locale] || undefined,
      email: publisher.email || undefined,
      foundingDate: publisher.foundingDate || undefined,
      sameAs: listOrUndefined([...Object.values(publisher.socials).filter(Boolean), ...publisher.sameAs]),
      publishingPrinciples: absoluteUrl(site, localizePath("/about", "en")),
      parentOrganization: developer?.ownsSite ? devRef : undefined,
    },
    {
      "@type": "WebSite",
      "@id": websiteId(site),
      url: absoluteUrl(site, localizePath("/", locale)),
      name: site.siteName[locale],
      description: site.defaultDescription[locale] || undefined,
      inLanguage: localeTags[locale],
      publisher: { "@id": publisherId(site) },
      creator: devRef,
      maintainer: devRef,
    },
  ];

  if (developer) {
    nodes.push({
      "@type": "Organization",
      "@id": developerId(developer.url),
      name: developer.name,
      url: developer.url,
      logo: imageObject(site, developer.logoUrl),
      description: developer.description[locale] || developer.description.en || undefined,
      sameAs: listOrUndefined(developer.sameAs),
      subOrganization: developer.ownsSite ? { "@id": publisherId(site) } : undefined,
    });
  }

  return graph(...nodes);
}

export function breadcrumbList(items: Array<{ name: string; url: string }>): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type ArticleSchemaInput = {
  /** Absolute canonical URL. */
  url: string;
  title: string;
  description?: string | null;
  image?: string | null;
  publishedAt: Date;
  updatedAt: Date;
  authorName: string;
  section: string;
  keywords?: string[];
  /** Language the article text is in. */
  textLocale: Locale;
};

/** NewsArticle (or the type chosen in admin) for an article page. */
export function articleNode(site: SiteSeo, locale: Locale, article: ArticleSchemaInput): Node {
  return {
    "@type": site.publisher.articleType,
    "@id": `${article.url}#article`,
    headline: article.title,
    description: article.description || undefined,
    image: article.image ? [absoluteUrl(site, article.image)] : undefined,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: [{ "@type": "Person", name: article.authorName }],
    publisher: publisherRef(site, locale),
    mainEntityOfPage: { "@type": "WebPage", "@id": article.url },
    isPartOf: { "@id": websiteId(site) },
    articleSection: article.section,
    keywords: article.keywords?.length ? article.keywords.join(", ") : undefined,
    inLanguage: localeTags[article.textLocale],
    isAccessibleForFree: true,
  };
}

/** A category listing page. */
export function collectionNode(
  site: SiteSeo,
  locale: Locale,
  page: { url: string; name: string; description?: string | null },
): Node {
  return {
    "@type": "CollectionPage",
    "@id": page.url,
    url: page.url,
    name: page.name,
    description: page.description || undefined,
    inLanguage: localeTags[locale],
    isPartOf: { "@id": websiteId(site) },
    publisher: { "@id": publisherId(site) },
  };
}
