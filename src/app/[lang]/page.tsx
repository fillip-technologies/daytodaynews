import type { Metadata } from "next";
import { Fragment } from "react";
import { BreakingTicker } from "@/components/home/BreakingTicker";
import { CategoryBlock } from "@/components/home/CategoryBlock";
import { EditorsPicks } from "@/components/home/EditorsPicks";
import { LatestArticles } from "@/components/home/LatestArticles";
import { Newsletter } from "@/components/home/Newsletter";
import { TopicStrip } from "@/components/home/TopicStrip";
import { TopStories } from "@/components/home/TopStories";
import { TrendingPosts } from "@/components/home/TrendingPosts";
import { getI18n } from "@/i18n/server";
import { getArticleSummaries, getTopics } from "@/lib/articles";
import type { HomeSection, HomeText } from "@/lib/homepage";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";
import { getHomepage } from "@/lib/settings";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  return fixedPageMetadata("home", await localeFromParams(params));
}

/** The front page, exactly as laid out under Admin → Homepage. */
export default async function Home() {
  const { locale, t } = await getI18n();
  const [{ sections }, articles, topics] = await Promise.all([
    getHomepage(),
    getArticleSummaries(locale),
    getTopics(locale),
  ]);

  // Only published stories are listed, so unpublished picks drop out here.
  const bySlug = new Map(articles.flatMap((article) => (article.slug ? [[article.slug, article] as const] : [])));
  const pick = (slugs: string[]) => slugs.flatMap((slug) => bySlug.get(slug) ?? []);
  const topicBySlug = new Map(topics.map((topic) => [topic.slug, topic]));
  // The admin's wording in this language; undefined falls back to each section's default.
  const text = (value: HomeText) => (locale === "hi" ? value.hi : value.en) || undefined;

  function render(section: HomeSection) {
    switch (section.type) {
      case "ticker":
        return <BreakingTicker title={text(section.title)} articles={pick(section.articles)} />;
      case "top":
        return (
          <TopStories
            title={text(section.title)}
            articles={pick(section.articles)}
            headlinesTitle={text(section.sideTitle)}
            headlines={pick(section.sideArticles)}
          />
        );
      case "topics":
        return (
          <TopicStrip
            title={text(section.title)}
            topics={section.categories.flatMap((slug) => topicBySlug.get(slug) ?? [])}
          />
        );
      case "category": {
        const topic = topicBySlug.get(section.categories[0]);
        if (!topic) return null;
        return (
          <CategoryBlock
            id={`home-${section.id}`}
            title={text(section.title) ?? topic.label}
            href={topic.href || `/category/${topic.slug}`}
            icon={topic.icon}
            tone={topic.tone}
            articles={pick(section.articles)}
          />
        );
      }
      case "editorsPicks":
        return (
          <EditorsPicks
            title={text(section.title)}
            description={text(section.description)}
            articles={pick(section.articles)}
          />
        );
      case "latest": {
        const trending = pick(section.sideArticles);
        return (
          <LatestArticles
            title={text(section.title)}
            articles={pick(section.articles)}
            sidebar={
              trending.length > 0 ? (
                <TrendingPosts posts={trending} title={text(section.sideTitle)} viewAllHref="" />
              ) : undefined
            }
          />
        );
      }
      case "newsletter":
        return <Newsletter title={text(section.title)} description={text(section.description)} />;
    }
  }

  return (
    <main className="flex-1">
      <h1 className="sr-only">{t.home.heading}</h1>
      {sections
        .filter((section) => section.enabled)
        .map((section) => (
          <Fragment key={section.id}>{render(section)}</Fragment>
        ))}
    </main>
  );
}
