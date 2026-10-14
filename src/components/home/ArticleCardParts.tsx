import Image from "next/image";
import Link from "@/i18n/Link";
import { type ReactNode } from "react";
import { format } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { formatDate, initials } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Article, CategoryTone } from "@/types/article";

// Shared building blocks for the homepage's image-led story cards.

const toneClasses: Record<CategoryTone, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  "accent-secondary": "bg-accent-secondary",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

/** Fixed-ratio photo of the article with a subtle zoom on card hover. */
export function CardMedia({
  article,
  priority,
  sizes,
  className,
  children,
}: {
  article: Article;
  priority?: boolean;
  sizes: string;
  /** Aspect ratio and radius. */
  className?: string;
  /** Overlays, e.g. the category badge. */
  children?: ReactNode;
}) {
  const imageSrc = article.image?.src || FALLBACK_IMAGE;
  const imageAlt = article.image?.alt || article.title;

  return (
    <div className={cn("relative isolate overflow-hidden bg-primary", className)}>
      <div className="absolute inset-0 -z-10 transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      </div>
      {children}
    </div>
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
      className="outline-none after:absolute after:-inset-2 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-primary"
    >
      {children}
    </Link>
  );
}

export async function Byline({ article, showAvatar }: { article: Article; showAvatar?: boolean }) {
  const { locale, t } = await getI18n();
  return (
    <div className="flex min-w-0 items-center gap-3">
      {showAvatar && (
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-surface-elevated"
        >
          {initials(article.author)}
        </span>
      )}
      <p className="min-w-0 truncate text-[0.8125rem] text-text-muted">
        <span className="font-medium text-text-primary">{format(t.common.by, { author: article.author })}</span>
        <span aria-hidden="true"> · </span>
        <time dateTime={article.date}>{formatDate(article.date, locale)}</time>
        {article.readTime && (
          <>
            <span aria-hidden="true"> · </span>
            {format(t.common.minRead, { n: article.readTime })}
          </>
        )}
      </p>
    </div>
  );
}
