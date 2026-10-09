import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getTopic } from "@/data/topics";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { toneStyle, type Tone } from "@/lib/tones";
import type { Article } from "@/types/article";
import { CoverArt } from "./CoverArt";

type ArticleCardProps = {
  article: Article;
  showExcerpt?: boolean;
  /** Heading level for the title, to fit the surrounding outline. */
  headingLevel?: "h2" | "h3" | "h4";
  imageAspect?: "wide" | "classic";
  className?: string;
};

/** Standard listing card: cover image, category, title, byline and action. */
export function ArticleCard({
  article,
  showExcerpt,
  headingLevel: Heading = "h3",
  imageAspect = "wide",
  className,
}: ArticleCardProps) {
  const tone: Tone = (article.topic && getTopic(article.topic)?.tone) || article.categoryTone;

  return (
    <article
      style={toneStyle(tone)}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border bg-surface-elevated p-2",
        "shadow-[0_1px_2px] shadow-text-primary/5 transition-[translate,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-1 hover:border-(color:--tone)/30 hover:shadow-[0_22px_40px_-22px] hover:shadow-(color:--tone)/45",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-(color:--tone)",
          imageAspect === "wide" ? "aspect-[16/10]" : "aspect-[4/3]",
        )}
      >
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none">
          {article.image ? (
            <Image
              src={article.image.src}
              alt={article.image.alt}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : article.cover ? (
            <CoverArt cover={article.cover} className="size-full" />
          ) : null}
        </div>
        <Link
          href={article.categoryHref}
          className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-surface-elevated/95 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(color:--tone) shadow-sm transition-colors hover:bg-surface-elevated outline-offset-2 focus-visible:outline-2 focus-visible:outline-surface-elevated"
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-(color:--tone)" />
          {article.category}
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <Heading className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em] text-balance text-text-primary transition-colors duration-200 group-hover:text-primary">
          <Link
            href={article.href}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary"
          >
            {article.title}
          </Link>
        </Heading>
        {showExcerpt && article.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
            {article.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="min-w-0 text-xs leading-tight text-text-muted">
            <span className="block truncate font-medium text-text-secondary">By {article.author}</span>
            <span className="mt-1 block truncate">
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              {article.readTime && <> · {article.readTime} min read</>}
            </span>
          </p>
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-text-secondary transition-colors duration-300 group-hover:border-transparent group-hover:bg-(color:--tone) group-hover:text-surface-elevated"
          >
            <Icon
              name="arrowRight"
              className="size-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0 motion-reduce:transition-none"
            />
          </span>
        </div>
      </div>
    </article>
  );
}
