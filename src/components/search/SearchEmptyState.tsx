import Link from "@/i18n/Link";
import { EmptyState } from "@/components/blog/EmptyState";
import { Icon } from "@/components/ui/Icon";
import type { Topic } from "@/data/topics";
import { getI18n } from "@/i18n/server";

const buttonBase =
  "group inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary";

export async function SearchEmptyState({ topics }: { topics: Topic[] }) {
  const { t } = await getI18n();
  return (
    <div>
      <EmptyState
        title={t.blog.emptyTitle}
        description={t.search.emptyDescription}
        actions={
          <>
            <Link
              href="/search"
              className={`${buttonBase} border border-border bg-surface-elevated text-text-primary hover:border-text-muted/40`}
            >
              {t.search.clearSearch}
            </Link>
            <Link
              href="/blog"
              className={`${buttonBase} bg-primary text-surface-elevated shadow-md shadow-primary/25 hover:bg-primary-hover`}
            >
              {t.search.browseAll}
              <Icon
                name="arrowRight"
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </Link>
          </>
        }
      />
      <nav aria-label={t.search.browseTopics} className="mt-6">
        <ul className="flex flex-wrap justify-center gap-2">
          {topics.map((topic) => (
            <li key={topic.slug}>
              <Link
                href={topic.href || `/category/${topic.slug}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary/30 hover:text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
              >
                {topic.icon && <Icon name={topic.icon} className="size-4" />}
                {topic.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
