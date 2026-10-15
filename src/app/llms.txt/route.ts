import { localizePath } from "@/i18n/config";
import { getLatestArticles, getTopics } from "@/lib/articles";
import { getSiteSeo } from "@/lib/seo/site";
import { absoluteUrl, siteDeveloper } from "@/lib/seo/structured-data";

// /llms.txt (llmstxt.org): a plain summary of the publication for AI assistants
// and answer engines, built from Admin → SEO (site description, Brand & Credits),
// the categories and the latest articles. 404 while "Allow search engines" is off.
export const dynamic = "force-dynamic";

/** Keeps admin and article text on one line so it can't break the Markdown structure. */
const line = (text: string | null | undefined) => (text ?? "").replace(/\s+/g, " ").trim();

export async function GET() {
  const site = await getSiteSeo();
  if (!site.allowIndexing) return new Response("Not found", { status: 404 });

  const [topics, articles] = await Promise.all([getTopics("en"), getLatestArticles(25, "en")]);
  const url = (path: string) => absoluteUrl(site, localizePath(path, "en"));
  const developer = siteDeveloper(site);

  const sections: string[] = [`# ${line(site.siteName.en)}`];
  if (site.defaultDescription.en) sections.push(`> ${line(site.defaultDescription.en)}`);
  if (developer) {
    sections.push(
      `${line(site.siteName.en)} is ${developer.ownsSite ? "owned, designed and managed" : "designed and managed"} by [${line(developer.name)}](${developer.url}).${
        developer.description.en ? ` ${line(developer.description.en)}` : ""
      }`,
    );
  }

  sections.push(
    ["## Categories", ...topics.map((topic) => `- [${line(topic.label)}](${url(`/category/${topic.slug}`)}): ${line(topic.description)}`)].join("\n"),
  );
  if (articles.length) {
    sections.push(
      [
        "## Latest articles",
        ...articles.map((a) => `- [${line(a.title)}](${url(a.href)})${a.description ? `: ${line(a.description)}` : ""}`),
      ].join("\n"),
    );
  }
  sections.push(
    [
      "## About",
      `- [About ${line(site.siteName.en)}](${url("/about")})`,
      `- [Contact](${url("/contact")})`,
      `- [Write for us](${url("/write-for-us")})`,
      `- [RSS feed](${absoluteUrl(site, "/en/feed.xml")})`,
      ...(developer ? [`- [${line(developer.name)}](${developer.url}): designs and manages this website`] : []),
    ].join("\n"),
  );

  return new Response(`${sections.join("\n\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
