import { EditorsPicks } from "@/components/home/EditorsPicks";
import { ExploreTopics } from "@/components/home/ExploreTopics";
import { Hero } from "@/components/home/Hero";
import { LatestArticles, type ArticleFilter } from "@/components/home/LatestArticles";
import { Newsletter } from "@/components/home/Newsletter";
import { TrendingPosts } from "@/components/home/TrendingPosts";
import { primaryNavigation } from "@/config/navigation";
import {
  getEditorsPicks,
  getHeroArticles,
  getLatestArticles,
  getTopics,
  getTrendingArticles,
} from "@/lib/articles";

// Category tabs mirror the primary navigation.
const latestFilters: ArticleFilter[] = [
  { label: "All", value: null },
  ...primaryNavigation.map((item) => ({ label: item.label, value: item.category ?? null })),
];

export default async function Home() {
  const [topics, heroArticles, editorsPicks, latest, trending] = await Promise.all([
    getTopics(),
    getHeroArticles(),
    getEditorsPicks(),
    getLatestArticles(),
    getTrendingArticles(),
  ]);

  return (
    <main className="flex-1">
      <h1 className="sr-only">
        DayTodayNews: AI, software development and technology insights for growing businesses
      </h1>
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
