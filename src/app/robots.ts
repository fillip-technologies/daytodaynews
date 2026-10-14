import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getSiteSeo } from "@/lib/seo/site";

// /robots.txt, driven by Admin → SEO. With "Allow search engines" off it blocks
// everything (useful for staging); otherwise it keeps crawlers out of the admin,
// the API and search-result pages, plus any paths the admin lists.
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteSeo();

  if (!site.allowIndexing) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          ...locales.map((l) => `/${l}/search`),
          ...site.robotsDisallow,
        ],
      },
    ],
    sitemap: new URL("/sitemap.xml", site.siteUrl).toString(),
  };
}
