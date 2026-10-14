import type { Metadata } from "next";
import { EditorsPicks } from "@/components/home/EditorsPicks";
import { ExploreTopics } from "@/components/home/ExploreTopics";
import { Hero } from "@/components/home/Hero";
import { LatestArticles, type ArticleFilter } from "@/components/home/LatestArticles";
import { Newsletter } from "@/components/home/Newsletter";
import { TrendingPosts } from "@/components/home/TrendingPosts";
import { primaryNavigation } from "@/config/navigation";
import { getI18n } from "@/i18n/server";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";
import {
  getEditorsPicks,
  getHeroArticles,
  getLatestArticles,
  getTopics,
  getTrendingArticles,
} from "@/lib/articles";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  return fixedPageMetadata("home", await localeFromParams(params));
}

export default async function Home() {
  const { locale, t } = await getI18n();
  const [topics, heroArticles, editorsPicks, latest, trending] = await Promise.all([
    getTopics(locale),
    getHeroArticles(locale),
    getEditorsPicks(4, locale),
    getLatestArticles(9, locale),
    getTrendingArticles(5, locale),
  ]);

  // Category tabs mirror the primary navigation, named in the page's language.
  const latestFilters: ArticleFilter[] = [
    { label: t.home.all, value: null },
    ...primaryNavigation.map((item) => ({
      label: topics.find((topic) => topic.slug === item.category)?.label ?? item.label,
      value: item.category ?? null,
    })),
  ];

  return (
    <main className="flex-1">
      <h1 className="sr-only">{t.home.heading}</h1>
      <Hero articles={heroArticles} />
      <ExploreTopics topics={topics} />
      <EditorsPicks articles={editorsPicks} />
      <LatestArticles
        articles={latest}
        filters={latestFilters}
        sidebar={<TrendingPosts posts={trending} />}
      />
      <Newsletter />
    </main>
  );
}
