"use client";

import { useRef } from "react";
import { Icon } from "@/components/ui/Icon";

type BlogSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function BlogSearch({
  value,
  onChange,
  placeholder = "Search articles, topics, technologies...",
}: BlogSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form role="search" onSubmit={(event) => event.preventDefault()} className="group relative">
      <label htmlFor="blog-search" className="sr-only">
        Search articles
      </label>
      <Icon
        name="search"
        className="pointer-events-none absolute top-1/2 left-4.5 size-5 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary"
      />
      <input
        ref={inputRef}
        id="blog-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            onChange("");
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={`h-14 w-full rounded-full border border-border bg-surface-elevated pl-12 text-base ${value ? "pr-14" : "pr-5"} text-text-primary shadow-[0_8px_24px_-18px] shadow-primary/40 transition-[border-color,box-shadow] placeholder:text-text-muted hover:border-text-muted/40 focus:border-primary focus:shadow-[0_0_0_4px] focus:shadow-primary/15 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none`}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-text-primary/5 text-text-secondary transition-colors hover:bg-text-primary/10 hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Icon name="close" className="size-4" />
        </button>
      )}
    </form>
  );
}
