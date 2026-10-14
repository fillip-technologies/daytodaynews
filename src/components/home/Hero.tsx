import type { Article } from "@/types/article";
import { featuredArticles } from "@/data/featuredArticles";
import { getI18n } from "@/i18n/server";
import { FeaturedArticleCard } from "./FeaturedArticleCard";
import { SecondaryArticleCard } from "./SecondaryArticleCard";
import styles from "./Hero.module.css";

type HeroProps = {
  articles?: Article[];
};

/** Homepage hero: the lead story beside two stacked secondary stories. */
export async function Hero({ articles }: HeroProps = {}) {
  const { t } = await getI18n();
  const displayArticles = articles && articles.length > 0 ? articles : featuredArticles;
  const [lead, ...secondary] = displayArticles;
  if (!lead) return null;

  return (
    <section aria-label={t.home.featuredStories} className="relative isolate">
      <HeroGlow />

      <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8 lg:px-8 lg:pb-16">
        {/* Lead left; on desktop the side stories sit behind column rules, newspaper-style. */}
        <div className="grid gap-10 md:grid-cols-2 md:gap-x-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-0">
          <FeaturedArticleCard
            article={lead}
            className="md:col-span-2 lg:col-span-1 lg:row-span-2 lg:pr-10"
          />
          {secondary.slice(0, 2).map((article, i) => (
            <SecondaryArticleCard
              key={article.href}
              article={article}
              className={
                i === 0
                  ? "lg:border-l lg:border-border lg:pb-8 lg:pl-10"
                  : "lg:border-t lg:border-l lg:border-border lg:pt-8 lg:pl-10"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Soft token-colored light behind the grid; the page itself stays light. */
function HeroGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className={`absolute -top-32 left-[10%] h-[26rem] w-[40rem] rounded-full bg-accent-secondary/15 blur-3xl ${styles.drift}`}
      />
      <div
        className={`absolute top-10 right-[-6%] size-[28rem] rounded-full bg-primary/15 blur-3xl ${styles.driftReverse}`}
      />
      <div
        className={`absolute bottom-0 left-[35%] h-[20rem] w-[34rem] rounded-full bg-[color-mix(in_srgb,var(--color-accent)_55%,var(--color-accent-secondary))] opacity-15 blur-3xl ${styles.drift}`}
      />
    </div>
  );
}
