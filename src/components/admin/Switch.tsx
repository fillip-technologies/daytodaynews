"use client";

import { cn } from "@/lib/cn";

/** On/off toggle with its label beside it. */
export function Switch({
  checked,
  disabled,
  onChange,
  label,
  title,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      title={title}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 rounded-full text-xs font-semibold text-text-secondary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        aria-hidden="true"
        className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-border")}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-surface-elevated shadow-xs transition-transform motion-reduce:transition-none",
            checked && "translate-x-4",
          )}
        />
      </span>
      {label}
    </button>
  );
}
