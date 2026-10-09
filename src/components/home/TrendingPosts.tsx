import Link from "next/link";
import { CoverArt } from "@/components/blog/CoverArt";
import { Icon } from "@/components/ui/Icon";
import { getTopic } from "@/data/topics";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { toneStyle } from "@/lib/tones";
import type { Article } from "@/types/article";
import { ViewAllLink } from "./SectionHeader";

type TrendingPostsProps = {
  posts: Article[];
  title?: string;
  viewAllHref?: string;
  className?: string;
};

/** Compact ranked "most read" module; works as a sidebar or on its own. */
export function TrendingPosts({
  posts,
  title = "Trending Now",
  viewAllHref = "/trending",
  className,
}: TrendingPostsProps) {
  if (posts.length === 0) return null;

  return (
    <aside
      aria-labelledby="trending-title"
      className={cn("rounded-2xl border border-border bg-surface-elevated p-5 sm:p-6", className)}
    >
      <header className="flex items-center justify-between gap-4">
        <h2 id="trending-title" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-text-primary">
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-accent/10 text-accent">
            <Icon name="flame" className="size-[18px]" />
          </span>
          {title}
        </h2>
        {viewAllHref && <ViewAllLink label="View All" href={viewAllHref} />}
      </header>

      <ol className="mt-3 divide-y divide-border">
        {posts.map((post, i) => {
          const tone = (post.topic && getTopic(post.topic)?.tone) || post.categoryTone;
          return (
            <li key={post.href}>
              <article style={toneStyle(tone)} className="group relative flex items-start gap-3.5 py-4 last:pb-1">
                <span
                  aria-hidden="true"
                  className="w-7 shrink-0 bg-gradient-primary bg-clip-text pt-0.5 text-[1.375rem] leading-none font-semibold tracking-tight text-transparent tabular-nums"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {post.cover && (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-(color:--tone)">
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none">
                      <CoverArt cover={post.cover} compact className="size-full" />
                    </div>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(color:--tone)">
                    {post.category}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-sm leading-snug font-semibold text-text-primary transition-colors duration-200 group-hover:text-primary">
                    <Link
                      href={post.href}
                      className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-primary"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-1.5 text-xs text-text-muted">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    {post.readTime && <> · {post.readTime} min read</>}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
