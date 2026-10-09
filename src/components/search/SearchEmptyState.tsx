import Link from "next/link";
import { EmptyState } from "@/components/blog/EmptyState";
import { Icon } from "@/components/ui/Icon";
import type { Category } from "@/data/categories";

const buttonBase =
  "group inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary";

export function SearchEmptyState({ categories }: { categories: Category[] }) {
  return (
    <div>
      <EmptyState
        title="No articles found."
        description="Try another keyword or browse our topics."
        actions={
          <>
            <Link
              href="/search"
              className={`${buttonBase} border border-border bg-surface-elevated text-text-primary hover:border-text-muted/40`}
            >
              Clear Search
            </Link>
            <Link
              href="/blog"
              className={`${buttonBase} bg-primary text-surface-elevated shadow-md shadow-primary/25 hover:bg-primary-hover`}
            >
              Browse All Articles
              <Icon
                name="arrowRight"
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </Link>
          </>
        }
      />
      <nav aria-label="Browse topics" className="mt-6">
        <ul className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/category/${category.slug}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary/30 hover:text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
              >
                {category.icon && <Icon name={category.icon} className="size-4" />}
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
