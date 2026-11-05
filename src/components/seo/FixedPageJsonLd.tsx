import { getI18n } from "@/i18n/server";
import { fixedPageGraph } from "@/lib/seo/page-metadata";
import { JsonLd } from "./JsonLd";

/** The page's own structured data (e.g. AboutPage + breadcrumb), from Admin → SEO → Pages. */
export async function FixedPageJsonLd({ page }: { page: string }) {
  const { locale } = await getI18n();
  const data = await fixedPageGraph(page, locale);
  return data ? <JsonLd data={data} /> : null;
}
