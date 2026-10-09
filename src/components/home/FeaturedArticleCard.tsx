import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Article } from "@/types/article";
import { Byline, CardMedia, CardScrim, CardTitleLink, CategoryBadge } from "./ArticleCardParts";

type FeaturedArticleCardProps = {
  article: Article;
  className?: string;
};

/** Lead story: large image-led card with title, description and CTA. */
export function FeaturedArticleCard({ article, className }: FeaturedArticleCardProps) {
  return (
    <article
      className={cn(
        "group relative isolate flex flex-col justify-between overflow-hidden rounded-3xl bg-primary",
        "shadow-[0_24px_48px_-28px] shadow-primary/40 transition-shadow duration-500",
        "hover:shadow-[0_32px_64px_-28px] hover:shadow-primary/55",
        className,
      )}
    >
      <CardMedia article={article} priority sizes="(min-width: 1024px) 66vw, 100vw" />
      <CardScrim className="via-35% to-65%" />

      <div className="p-5 sm:p-7 lg:p-8">
        <CategoryBadge article={article} />
      </div>

      <div className="p-5 pt-0 sm:p-7 sm:pt-0 lg:p-10 lg:pt-0">
        <h2 className="max-w-[20ch] text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.025em] text-balance text-surface-elevated sm:text-4xl lg:text-[2.625rem] xl:text-5xl">
          <CardTitleLink article={article}>{article.title}</CardTitleLink>
        </h2>
        {article.description && (
          <p className="mt-3 hidden max-w-[52ch] text-base leading-relaxed text-surface-elevated/85 sm:block lg:mt-4 lg:text-lg">
            {article.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Byline article={article} showAvatar />
          <span
            aria-hidden="true"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-surface-elevated pr-2 pl-5 text-sm font-semibold text-text-primary shadow-md transition-colors duration-300 group-hover:bg-accent group-hover:text-surface-elevated"
          >
            Read Full Article
            <span className="grid size-7 place-items-center rounded-full bg-text-primary/5 transition-[translate,background-color] duration-300 group-hover:translate-x-0.5 group-hover:bg-surface-elevated/20 motion-reduce:transition-none">
              <Icon name="arrowRight" className="size-4" />
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
