"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";

// Shared building blocks of the admin content editors (Pages, Links & Footer,
// Site Text): the same inputs, buttons, notices and save bar.

export const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-background px-3 text-xs text-text-primary focus:border-primary focus:outline-none";
export const labelClass = "text-[11px] font-semibold text-text-secondary";
export const smallButtonClass =
  "grid size-7 shrink-0 place-items-center rounded-md text-[11px] text-text-muted transition-colors hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30";
export const primaryButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-surface-elevated transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-elevated px-4 text-xs font-semibold text-text-secondary transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50";

export type Notice = { kind: "success" | "error"; text: string } | null;
export type BilingualText = { en: string; hi: string };

export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function NoticeBox({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <p
      role={notice.kind === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border p-3.5 text-xs font-medium",
        notice.kind === "error"
          ? "border-error/30 bg-error/10 text-error"
          : "border-success/30 bg-success/10 text-success",
      )}
    >
      {notice.text}
    </p>
  );
}

/** English and Hindi inputs side by side; `rows` turns them into text areas. */
export function TextPair({
  label,
  value,
  onChange,
  placeholder,
  rows,
  mono,
  maxLength,
}: {
  label: string;
  value: BilingualText;
  onChange: (value: BilingualText) => void;
  /** Shown while a field is empty, e.g. the shipped text. */
  placeholder?: BilingualText;
  rows?: number;
  mono?: boolean;
  maxLength?: number;
}) {
  const field = (locale: "en" | "hi") => {
    const props = {
      value: value[locale],
      lang: locale,
      maxLength,
      placeholder: placeholder?.[locale] || (locale === "hi" ? "Optional; English is shown if empty" : ""),
      onChange: (e: { target: { value: string } }) => onChange({ ...value, [locale]: e.target.value }),
      className: cn(inputClass, rows ? "py-2 leading-relaxed" : "h-10", mono && "font-mono"),
    };
    return rows ? <textarea rows={rows} {...props} /> : <input {...props} />;
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className={labelClass}>{label} (English)</span>
        {field("en")}
      </label>
      <label className="block">
        <span className={labelClass}>{label} (हिंदी)</span>
        {field("hi")}
      </label>
    </div>
  );
}

/** Asks before leaving the page while there are unsaved changes. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}

/** Fixed bar at the bottom of the screen while there are unsaved changes. */
export function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
  label = "Save",
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  label?: string;
}) {
  if (!dirty) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-elevated/95 px-4 py-3 shadow-[0_-8px_24px_-12px] shadow-text-primary/15 backdrop-blur-sm md:left-64">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-text-primary">You have unsaved changes.</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onDiscard} disabled={saving} className={secondaryButtonClass}>
            Discard
          </button>
          <button type="button" onClick={onSave} disabled={saving} className={primaryButtonClass}>
            {saving ? "Saving…" : label}
          </button>
        </div>
      </div>
    </div>
  );
}
