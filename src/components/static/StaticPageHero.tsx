import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type StaticPageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /** Extra content under the description, e.g. a "last updated" line. */
  children?: ReactNode;
  size?: "default" | "compact";
};

/** Editorial page intro shared by static and trust pages. */
export function StaticPageHero({ eyebrow, title, description, children, size = "default" }: StaticPageHeroProps) {
  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26rem] overflow-hidden">
        <div className="absolute -top-40 left-[6%] h-80 w-[36rem] rounded-full bg-accent-secondary/12 blur-3xl" />
        <div className="absolute -top-32 right-[4%] h-80 w-[30rem] rounded-full bg-primary/12 blur-3xl" />
      </div>
      <header className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <span aria-hidden="true" className="size-2 rounded-full bg-gradient-primary" />
            {eyebrow}
          </p>
          <h1
            className={cn(
              "mt-4 font-semibold tracking-[-0.035em] text-balance text-text-primary",
              size === "compact"
                ? "text-4xl leading-[1.1] sm:text-[2.75rem]"
                : "text-4xl leading-[1.05] sm:text-5xl lg:text-[3.5rem]",
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-lg leading-8 text-text-secondary">{description}</p>
          )}
          {children}
        </div>
      </header>
    </div>
  );
}
