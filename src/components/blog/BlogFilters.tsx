import Link from "next/link";
import type { MouseEvent } from "react";
import type { Topic } from "@/data/topics";
import { cn } from "@/lib/cn";
import { toneStyle, type Tone } from "@/lib/tones";

type BlogFiltersProps = {
  topics: Topic[];
  active: string | null;
  /** Filters in place; without it the chips navigate as normal links. */
  onSelect?: (category: string | null) => void;
  /** Builds the crawlable URL for each chip. */
  hrefFor: (category: string | null) => string;
};

/**
 * Category chips rendered as real links (crawlable, open-in-new-tab friendly);
 * plain clicks filter in place without a page load.
 */
export function BlogFilters({ topics, active, onSelect, hrefFor }: BlogFiltersProps) {
  const options: Array<{ value: string | null; label: string; tone: Tone }> = [
    { value: null, label: "All", tone: "primary" },
    ...topics.map((topic) => ({ value: topic.slug, label: topic.label, tone: topic.tone })),
  ];

  function handleClick(event: MouseEvent<HTMLAnchorElement>, value: string | null) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    onSelect?.(value);
  }

  return (
    <nav aria-label="Article categories">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-1 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0">
        {options.map((option) => {
          const selected = option.value === active;
          return (
            <li key={option.label} style={toneStyle(option.tone)} className="shrink-0">
              <Link
                href={hrefFor(option.value)}
                scroll={false}
                onClick={onSelect ? (event) => handleClick(event, option.value) : undefined}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap",
                  "transition-[background-color,border-color,color,box-shadow] duration-200",
                  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
                  selected
                    ? "border-transparent bg-(color:--tone) text-surface-elevated shadow-md shadow-(color:--tone)/30"
                    : "border-border bg-surface-elevated text-text-secondary hover:border-(color:--tone)/40 hover:text-(color:--tone)",
                )}
              >
                {option.value && (
                  <span
                    aria-hidden="true"
                    className={cn("size-1.5 rounded-full", selected ? "bg-surface-elevated" : "bg-(color:--tone)")}
                  />
                )}
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
