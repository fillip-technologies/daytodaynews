"use client";

import { Icon } from "@/components/ui/Icon";

/** Smooth-scrolls to the top and returns keyboard focus to the header. */
export function BackToTop() {
  return (
    <a
      href="#"
      onClick={(event) => {
        event.preventDefault();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        document.querySelector<HTMLElement>("header a")?.focus({ preventScroll: true });
      }}
      className="group inline-flex items-center gap-1.5 rounded-full py-1 text-sm font-medium text-text-secondary transition-colors hover:text-primary outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
    >
      Back to top
      <span className="grid size-7 place-items-center rounded-full border border-border bg-surface-elevated transition-[translate,border-color,background-color,color] duration-200 group-hover:-translate-y-0.5 group-hover:border-transparent group-hover:bg-primary group-hover:text-surface-elevated motion-reduce:group-hover:translate-y-0">
        <Icon name="arrowRight" className="size-3.5 -rotate-90" />
      </span>
    </a>
  );
}
