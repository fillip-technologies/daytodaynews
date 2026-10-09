import Image from "next/image";
import Link from "next/link";
import { useId, type ReactNode } from "react";
import { formatDate, initials } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Article, CategoryTone } from "@/types/article";
import { articleVisuals } from "./ArticleVisuals";

// Shared building blocks for image-led article cards.

const toneClasses: Record<CategoryTone, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  "accent-secondary": "bg-accent-secondary",
};

/** Photo or built-in illustration, with a subtle zoom on card hover. */
export function CardMedia({
  article,
  priority,
  sizes,
}: {
  article: Article;
  priority?: boolean;
  sizes: string;
}) {
  const id = useId().replace(/:/g, "");
  const Visual = article.visual ? articleVisuals[article.visual] : null;

  return (
    <div className="absolute inset-0 -z-10 transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none">
      {article.image ? (
        <Image
          src={article.image.src}
          alt={article.image.alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : Visual ? (
        <Visual id={`v${id}`} className="size-full" />
      ) : (
        <div className="size-full bg-gradient-primary" />
      )}
    </div>
  );
}

/** Bottom-up scrim so white text stays readable; the top stays full color. */
export function CardScrim({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 -z-10 bg-linear-to-t from-text-primary/85 via-text-primary/30 to-transparent",
        className,
      )}
    />
  );
}

export function CategoryBadge({ article }: { article: Article }) {
  return (
    <Link
      href={article.categoryHref}
      className={cn(
        "relative z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-surface-elevated shadow-sm",
        "transition-transform duration-200 hover:-translate-y-px outline-offset-2 focus-visible:outline-2 focus-visible:outline-surface-elevated",
        toneClasses[article.categoryTone],
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-surface-elevated" />
      {article.category}
    </Link>
  );
}

/** Title link stretched over the whole card, so the card is one click target. */
export function CardTitleLink({ article, children }: { article: Article; children: ReactNode }) {
  return (
    <Link
      href={article.href}
      className="outline-none after:absolute after:inset-0 after:rounded-[inherit] focus-visible:after:outline-2 focus-visible:after:-outline-offset-4 focus-visible:after:outline-surface-elevated"
    >
      {children}
    </Link>
  );
}

export function Byline({ article, showAvatar }: { article: Article; showAvatar?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {showAvatar && (
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-surface-elevated ring-2 ring-surface-elevated/40"
        >
          {initials(article.author)}
        </span>
      )}
      <p className="min-w-0 truncate text-[0.8125rem] text-surface-elevated/80">
        <span className="font-medium text-surface-elevated">By {article.author}</span>
        <span aria-hidden="true"> · </span>
        <time dateTime={article.date}>{formatDate(article.date)}</time>
        {article.readTime && (
          <>
            <span aria-hidden="true"> · </span>
            {article.readTime} min read
          </>
        )}
      </p>
    </div>
  );
}
