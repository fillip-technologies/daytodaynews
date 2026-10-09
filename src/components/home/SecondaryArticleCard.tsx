import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Article } from "@/types/article";
import { Byline, CardMedia, CardScrim, CardTitleLink, CategoryBadge } from "./ArticleCardParts";

type SecondaryArticleCardProps = {
  article: Article;
  className?: string;
};

/** Compact image-led card for the stories beside the lead. */
export function SecondaryArticleCard({ article, className }: SecondaryArticleCardProps) {
  return (
    <article
      className={cn(
        "group relative isolate flex flex-col justify-between overflow-hidden rounded-3xl bg-primary",
        "shadow-[0_18px_36px_-24px] shadow-primary/35 transition-shadow duration-500",
        "hover:shadow-[0_26px_48px_-24px] hover:shadow-primary/50",
        className,
      )}
    >
      <CardMedia article={article} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
      <CardScrim className="via-40% to-75%" />

      <div className="p-5">
        <CategoryBadge article={article} />
      </div>

      <div className="flex items-end justify-between gap-4 p-5 pt-0">
        <div className="min-w-0">
          <h3 className="text-lg leading-snug font-semibold tracking-[-0.015em] text-balance text-surface-elevated sm:text-xl lg:text-lg xl:text-[1.3125rem]">
            <CardTitleLink article={article}>{article.title}</CardTitleLink>
          </h3>
          <div className="mt-2.5">
            <Byline article={article} />
          </div>
        </div>
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-elevated text-text-primary shadow-md transition-colors duration-300 group-hover:bg-accent group-hover:text-surface-elevated"
        >
          <Icon
            name="arrowRight"
            className="size-[18px] -rotate-45 transition-transform duration-300 group-hover:rotate-0 motion-reduce:transition-none"
          />
        </span>
      </div>
    </article>
  );
}
