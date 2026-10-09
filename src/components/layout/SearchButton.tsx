"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type SearchButtonProps = {
  /** `field` shows the search placeholder; `icon` is a compact square button. */
  variant?: "field" | "icon";
  placeholder?: string;
  /**
   * Opens the search experience (e.g. a command palette). Until one exists,
   * the button falls back to a link to the /search page.
   */
  onOpen?: () => void;
  className?: string;
};

export function SearchButton({
  variant = "icon",
  placeholder = "Search articles, topics…",
  onOpen,
  className,
}: SearchButtonProps) {
  const classes = cn(
    "outline-offset-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary",
    variant === "field"
      ? "group flex h-10 items-center gap-2.5 rounded-full border border-border bg-text-primary/5 px-3.5 text-sm text-text-muted hover:border-text-muted/40 hover:bg-surface-elevated hover:text-text-secondary"
      : "grid size-10 place-items-center rounded-full text-text-secondary hover:bg-text-primary/5 hover:text-text-primary",
    className,
  );

  const content =
    variant === "field" ? (
      <>
        <Icon name="search" className="size-4 shrink-0 transition-colors group-hover:text-primary" />
        <span className="truncate">{placeholder}</span>
      </>
    ) : (
      <Icon name="search" className="size-5" />
    );

  const label = variant === "icon" ? "Search" : undefined;

  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} aria-label={label} className={classes}>
        {content}
      </button>
    );
  }

  return (
    <Link href="/search" aria-label={label} className={classes}>
      {content}
    </Link>
  );
}
