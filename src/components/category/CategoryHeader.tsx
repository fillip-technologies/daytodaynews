import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { Category } from "@/data/categories";
import { formatDate } from "@/lib/format";

type CategoryHeaderProps = {
  category: Category;
  articleCount: number;
  latestDate: string | null;
  /** Sibling categories for quick switching. */
  related: Category[];
};

export function CategoryHeader({ category, articleCount, latestDate, related }: CategoryHeaderProps) {
  return (
    <header>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
              <li>
                <Link href="/blog" className="text-text-muted transition-colors hover:text-primary">
                  Category
                </Link>
              </li>
              <li aria-hidden="true" className="text-text-muted/60">
                /
              </li>
              <li aria-current="page" className="text-(color:--tone)">
                {category.name}
              </li>
            </ol>
          </nav>
          <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-text-primary sm:text-5xl lg:text-[3.25rem]">
            {category.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-text-secondary">{category.description}</p>
        </div>

        <div className="flex items-center gap-4 self-start rounded-2xl border border-border bg-surface-elevated/80 p-4 pr-6 shadow-[0_18px_40px_-28px] shadow-(color:--tone)/50 backdrop-blur-sm lg:self-end">
          {category.icon && (
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-(color:--tone) text-surface-elevated shadow-lg shadow-(color:--tone)/30">
              <Icon name={category.icon} className="size-7" />
            </span>
          )}
          <p className="leading-tight">
            <span className="block text-2xl font-semibold tracking-tight text-text-primary">
              {articleCount} {articleCount === 1 ? "article" : "articles"}
            </span>
            {latestDate && (
              <span className="mt-1 block text-sm text-text-muted">
                Updated <time dateTime={latestDate}>{formatDate(latestDate)}</time>
              </span>
            )}
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <nav aria-label="Other categories" className="mt-8">
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0">
            {related.map((item) => (
              <li key={item.slug} className="shrink-0">
                <Link
                  href={`/category/${item.slug}`}
                  className="inline-flex h-9 items-center rounded-full border border-border bg-surface-elevated px-3.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary/30 hover:text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
