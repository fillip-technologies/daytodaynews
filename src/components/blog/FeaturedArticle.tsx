import Image from "next/image";
import Link from "next/link";
import { articleVisuals } from "@/components/home/ArticleVisuals";
import { Icon } from "@/components/ui/Icon";
import { getTopic } from "@/data/topics";
import { formatDate, initials } from "@/lib/format";
import { toneStyle } from "@/lib/tones";
import type { Article } from "@/types/article";
import { CoverArt } from "./CoverArt";

/** Large split card for the lead story of a listing. */
export function FeaturedArticle({ article }: { article: Article }) {
  const tone = (article.topic && getTopic(article.topic)?.tone) || article.categoryTone;
  const Visual = article.visual ? articleVisuals[article.visual] : null;

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-2 -z-10 rounded-[2rem] bg-gradient-primary opacity-20 blur-2xl sm:-inset-4"
      />
      <article
        style={toneStyle(tone)}
        className="group relative grid overflow-hidden rounded-3xl border border-border bg-surface-elevated p-2 shadow-[0_24px_48px_-32px] shadow-primary/40 transition-shadow duration-500 hover:shadow-[0_32px_64px_-32px] hover:shadow-primary/55 lg:grid-cols-[1.2fr_1fr]"
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-(color:--tone) lg:aspect-auto lg:min-h-[26rem]">
          <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none">
            {article.image ? (
              <Image
                src={article.image.src}
                alt={article.image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            ) : Visual ? (
              // The illustration keeps its detail in the upper area; crop to it.
              <div className="absolute inset-x-0 top-0 h-[150%]">
                <Visual id="featured-visual" className="size-full" />
              </div>
            ) : article.cover ? (
              <CoverArt cover={article.cover} className="size-full" />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col justify-center px-4 pt-6 pb-5 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-surface-elevated">
              <Icon name="sparkles" className="size-3.5" />
              Featured
            </span>
            <Link
              href={article.categoryHref}
              className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-(color:--tone)/10 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-(color:--tone) transition-colors hover:bg-(color:--tone)/15 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
            >
              {article.category}
            </Link>
          </div>

          <h2 className="mt-5 text-2xl leading-[1.15] font-semibold tracking-[-0.025em] text-balance text-text-primary sm:text-3xl lg:text-[2.125rem]">
            <Link
              href={article.href}
              className="outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary"
            >
              {article.title}
            </Link>
          </h2>
          {article.description && (
            <p className="mt-4 text-base leading-relaxed text-text-secondary lg:text-lg">
              {article.description}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-10 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-surface-elevated"
              >
                {initials(article.author)}
              </span>
              <p className="text-sm leading-tight text-text-muted">
                <span className="block font-medium text-text-primary">By {article.author}</span>
                <span className="mt-1 block">
                  <time dateTime={article.date}>{formatDate(article.date)}</time>
                  {article.readTime && <> · {article.readTime} min read</>}
                </span>
              </p>
            </div>
            <span
              aria-hidden="true"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary pr-2 pl-5 text-sm font-semibold text-surface-elevated shadow-md shadow-primary/25 transition-colors duration-300 group-hover:bg-primary-hover"
            >
              Read Article
              <span className="grid size-7 place-items-center rounded-full bg-surface-elevated/20 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">
                <Icon name="arrowRight" className="size-4" />
              </span>
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}
