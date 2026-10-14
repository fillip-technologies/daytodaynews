import Link from "@/i18n/Link";
import { Icon } from "@/components/ui/Icon";
import type { Category } from "@/data/categories";
import { format, plural } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { formatDate } from "@/lib/format";

type CategoryHeaderProps = {
  category: Category;
  articleCount: number;
  latestDate: string | null;
};

export async function CategoryHeader({ category, articleCount, latestDate }: CategoryHeaderProps) {
  const { locale, t } = await getI18n();
  return (
    <header>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
              <li>
                <Link href="/blog" className="text-text-muted transition-colors hover:text-primary">
                  {t.category.breadcrumb}
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
              {plural(t.common.articles, articleCount)}
            </span>
            {latestDate && (
              <span className="mt-1 block text-sm text-text-muted">
                <time dateTime={latestDate}>{format(t.category.updated, { date: formatDate(latestDate, locale) })}</time>
              </span>
            )}
          </p>
        </div>
      </div>
    </header>
  );
}
