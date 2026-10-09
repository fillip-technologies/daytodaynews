import { featuredArticles } from "@/data/featuredArticles";
import { FeaturedArticleCard } from "./FeaturedArticleCard";
import { SecondaryArticleCard } from "./SecondaryArticleCard";
import styles from "./Hero.module.css";

/** Homepage hero: the lead story beside two stacked secondary stories. */
export function Hero() {
  const [lead, ...secondary] = featuredArticles;
  if (!lead) return null;

  return (
    <section aria-label="Featured stories" className="relative isolate">
      <HeroGlow />

      <div className="mx-auto max-w-7xl px-4 pt-3 pb-12 sm:px-6 sm:pt-5 lg:px-8 lg:pb-16">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:h-[clamp(32rem,calc(100svh-8.5rem),40rem)] lg:grid-cols-[2fr_1fr] lg:grid-rows-2">
          <FeaturedArticleCard
            article={lead}
            className="aspect-[4/5] sm:aspect-[16/11] md:col-span-2 md:aspect-[16/9] lg:col-span-1 lg:row-span-2 lg:aspect-auto"
          />
          {secondary.slice(0, 2).map((article) => (
            <SecondaryArticleCard
              key={article.href}
              article={article}
              className="aspect-[4/3] md:aspect-[5/4] lg:aspect-auto"
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
