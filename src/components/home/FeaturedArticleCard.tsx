import { cn } from "@/lib/cn";
import type { Article } from "@/types/article";
import { Byline, CardMedia, CardTitleLink, CategoryBadge } from "./ArticleCardParts";

type FeaturedArticleCardProps = {
  article: Article;
  className?: string;
};

/** Lead story: wide photo with the headline, standfirst and byline beneath it. */
export function FeaturedArticleCard({ article, className }: FeaturedArticleCardProps) {
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <CardMedia
        article={article}
        priority
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="aspect-video rounded-2xl"
      >
        <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
          <CategoryBadge article={article} />
        </div>
      </CardMedia>

      <div className="pt-5 sm:pt-6">
        <h2 lang={article.locale} className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.025em] text-balance text-text-primary transition-colors duration-200 group-hover:text-primary sm:text-4xl lg:text-[2.5rem]">
          <CardTitleLink article={article}>{article.title}</CardTitleLink>
        </h2>
        {article.description && (
          <p lang={article.locale} className="mt-3 max-w-[62ch] text-base leading-relaxed text-text-secondary lg:mt-4 lg:text-lg">
            {article.description}
          </p>
        )}
        <div className="mt-5">
          <Byline article={article} showAvatar />
        </div>
      </div>
    </article>
  );
}
