"use client";

import Form from "next/form";
import Link from "@/i18n/Link";
import { useId } from "react";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/i18n/client";
import { localizePath } from "@/i18n/config";
import { cn } from "@/lib/cn";

type SearchButtonProps = {
  /** `field` is a compact search box; `icon` is a square button. */
  variant?: "field" | "icon";
  placeholder?: string;
  /**
   * Opens the search experience (e.g. a command palette) from the `icon`
   * variant. Until one exists, the button falls back to a link to /search.
   */
  onOpen?: () => void;
  className?: string;
};

export function SearchButton({
  variant = "icon",
  placeholder,
  onOpen,
  className,
}: SearchButtonProps) {
  const { locale, t } = useI18n();
  const inputId = useId();

  if (variant === "field") {
    // GET form to /search; works without JavaScript and navigates client-side with it.
    return (
      <Form action={localizePath("/search", locale)} role="search" className={cn("group relative", className)}>
        <label htmlFor={inputId} className="sr-only">
          {t.header.searchLabel}
        </label>
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary"
        />
        <input
          id={inputId}
          name="q"
          type="search"
          placeholder={placeholder ?? t.header.searchPlaceholder}
          autoComplete="off"
          enterKeyHint="search"
          className={cn(
            "h-10 w-full rounded-full border border-border bg-text-primary/[0.04] pr-4 pl-10 text-sm text-text-primary",
            "transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-text-muted",
            "hover:border-text-muted/40 hover:bg-surface-elevated",
            "focus:border-primary focus:bg-surface-elevated focus:shadow-[0_0_0_3px] focus:shadow-primary/15 focus:outline-none",
            "[&::-webkit-search-cancel-button]:appearance-none",
          )}
        />
      </Form>
    );
  }

  const classes = cn(
    "grid size-10 place-items-center rounded-full text-text-secondary transition-colors duration-150",
    "hover:bg-text-primary/5 hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
    className,
  );

  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} aria-label={t.header.search} className={classes}>
        <Icon name="search" className="size-5" />
      </button>
    );
  }

  return (
    <Link href="/search" aria-label={t.header.search} className={classes}>
      <Icon name="search" className="size-5" />
    </Link>
  );
}
