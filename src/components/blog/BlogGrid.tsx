import type { RefObject } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Article } from "@/types/article";
import { ArticleCard } from "./ArticleCard";

type BlogGridProps = {
  articles: Article[];
  total: number;
  onLoadMore?: () => void;
  listRef?: RefObject<HTMLUListElement | null>;
  className?: string;
};

export function BlogGrid({ articles, total, onLoadMore, listRef, className }: BlogGridProps) {
  const remaining = total - articles.length;

  return (
    <div className={className}>
      <ul ref={listRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {articles.map((article) => (
          <li key={article.id ?? article.href}>
            <ArticleCard article={article} showExcerpt />
          </li>
        ))}
      </ul>

      {onLoadMore && remaining > 0 && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            className="group inline-flex h-12 items-center gap-2 rounded-full border border-border bg-surface-elevated px-6 text-[0.9375rem] font-semibold text-text-primary shadow-sm transition-[border-color,box-shadow,color] duration-200 hover:border-primary/30 hover:text-primary hover:shadow-md hover:shadow-primary/10 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
          >
            Load More
            <span className="text-sm font-medium text-text-muted">({remaining})</span>
            <Icon
              name="arrowRight"
              className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </button>
        </div>
      )}
    </div>
  );
}
