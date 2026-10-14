import { cn } from "@/lib/cn";
import type { Article } from "@/types/article";
import { Byline, CardMedia, CardTitleLink, CategoryBadge } from "./ArticleCardParts";

type SecondaryArticleCardProps = {
  article: Article;
  className?: string;
};

/** Compact story beside the lead: photo, then headline and byline. */
export function SecondaryArticleCard({ article, className }: SecondaryArticleCardProps) {
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <CardMedia
        article={article}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="aspect-video rounded-xl"
      >
        <div className="absolute top-3 left-3">
          <CategoryBadge article={article} />
        </div>
      </CardMedia>

      <div className="pt-4">
        <h3 lang={article.locale} className="text-lg leading-snug font-semibold tracking-[-0.015em] text-balance text-text-primary transition-colors duration-200 group-hover:text-primary xl:text-xl">
          <CardTitleLink article={article}>{article.title}</CardTitleLink>
        </h3>
        <div className="mt-2.5">
          <Byline article={article} />
        </div>
      </div>
    </article>
  );
}
