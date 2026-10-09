import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

type EmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Custom actions (e.g. links) in place of the default button. */
  actions?: ReactNode;
};

export function EmptyState({
  title = "No articles found.",
  description = "Try a different search or category.",
  actionLabel = "Clear Filters",
  onAction,
  actions,
}: EmptyStateProps) {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-dashed border-border bg-surface-elevated px-6 py-16 text-center">
      <div aria-hidden="true" className="absolute top-0 left-1/2 -z-10 h-40 w-96 -translate-x-1/2 rounded-full bg-accent-secondary/10 blur-3xl" />
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-primary text-surface-elevated shadow-lg shadow-primary/25">
        <Icon name="search" className="size-6" />
      </span>
      <p className="mt-5 text-lg font-semibold text-text-primary">{title}</p>
      <p className="mt-1.5 text-text-secondary">{description}</p>
      {actions ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className="group mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface-elevated px-5 text-sm font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
        >
          {actionLabel}
          <Icon
            name="arrowRight"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </button>
      )}
    </div>
  );
}
