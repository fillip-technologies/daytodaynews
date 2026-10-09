"use client";

import Form from "next/form";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type SearchInputProps = {
  defaultValue?: string;
  /** Kept as a hidden field so a new query stays within the category. */
  category?: string | null;
  placeholder?: string;
};

/** GET form to /search; works without JavaScript and navigates client-side with it. */
export function SearchInput({
  defaultValue = "",
  category,
  placeholder = "Search articles, topics, technologies...",
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Form action="/search" role="search" className="group relative">
      <label htmlFor="site-search" className="sr-only">
        Search DayTodayNews
      </label>
      <Icon
        name="search"
        className="pointer-events-none absolute top-1/2 left-4.5 size-5 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary"
      />
      <input
        ref={inputRef}
        id="site-search"
        name="q"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className={`h-16 w-full rounded-full border border-border bg-surface-elevated pl-12 text-base text-text-primary shadow-[0_10px_30px_-20px] shadow-primary/50 transition-[border-color,box-shadow] placeholder:text-text-muted hover:border-text-muted/40 focus:border-primary focus:shadow-[0_0_0_4px] focus:shadow-primary/15 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none ${value ? "pr-40 sm:pr-44" : "pr-30 sm:pr-32"}`}
      />
      {category && <input type="hidden" name="category" value={category} />}

      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1.5">
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search text"
            className="grid size-9 place-items-center rounded-full bg-text-primary/5 text-text-secondary transition-colors hover:bg-text-primary/10 hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Icon name="close" className="size-4" />
          </button>
        )}
        <button
          type="submit"
          className="group/btn inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-surface-elevated shadow-md shadow-primary/25 transition-colors duration-200 hover:bg-primary-hover outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary sm:px-6"
        >
          Search
          <Icon
            name="arrowRight"
            className="hidden size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 sm:block motion-reduce:transition-none"
          />
        </button>
      </div>
    </Form>
  );
}
