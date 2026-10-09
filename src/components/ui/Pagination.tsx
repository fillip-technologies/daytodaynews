import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type PaginationProps = {
  page: number;
  pageCount: number;
  /** URL for a given 1-based page. */
  hrefFor: (page: number) => string;
  className?: string;
};

/** Page numbers to show: first, last and a window around the current page. */
function pageItems(page: number, pageCount: number): Array<number | "gap"> {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["gap" as const, p] : [p]));
}

const itemClass =
  "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-medium transition-colors duration-200 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary";

/** Link-based pagination: crawlable, works without JavaScript. */
export function Pagination({ page, pageCount, hrefFor, className }: PaginationProps) {
  if (pageCount <= 1) return null;

  const edge = (target: number, label: string, direction: "prev" | "next") => {
    const disabled = target < 1 || target > pageCount;
    const content = (
      <>
        {direction === "prev" && <Icon name="arrowRight" className="size-4 rotate-180" />}
        <span className="hidden sm:inline">{label}</span>
        {direction === "next" && <Icon name="arrowRight" className="size-4" />}
      </>
    );
    return disabled ? (
      <span aria-disabled="true" className={cn(itemClass, "flex gap-1.5 text-text-muted/60")}>
        {content}
      </span>
    ) : (
      <Link
        href={hrefFor(target)}
        rel={direction}
        aria-label={`${label} page`}
        className={cn(itemClass, "flex gap-1.5 border border-border bg-surface-elevated text-text-secondary hover:border-primary/30 hover:text-primary")}
      >
        {content}
      </Link>
    );
  };

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1.5 sm:gap-2", className)}>
      {edge(page - 1, "Previous", "prev")}
      <ul className="flex items-center gap-1 sm:gap-1.5">
        {pageItems(page, pageCount).map((item, i) =>
          item === "gap" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-text-muted">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  itemClass,
                  item === page
                    ? "bg-primary text-surface-elevated shadow-md shadow-primary/25"
                    : "text-text-secondary hover:bg-text-primary/5 hover:text-text-primary",
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ul>
      {edge(page + 1, "Next", "next")}
    </nav>
  );
}
