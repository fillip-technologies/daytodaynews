"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  label: string;
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Right-side modal sheet built on the native <dialog>, which provides focus
 * trapping, Escape-to-close and focus return to the trigger for free.
 */
export function Sheet({ open, onClose, label, id, className, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      id={id}
      aria-label={label}
      onClose={onClose}
      // A click on the dialog element itself (not its content) is a backdrop click.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-sm p-0",
        "bg-surface-elevated text-text-primary shadow-sheet",
        "translate-x-full open:translate-x-0 starting:open:translate-x-full",
        "transition-[translate,display,overlay] transition-discrete duration-250 ease-out",
        "backdrop:bg-text-primary/40 backdrop:opacity-0 open:backdrop:opacity-100 starting:open:backdrop:opacity-0",
        "backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-250",
        "motion-reduce:transition-none motion-reduce:backdrop:transition-none",
        className,
      )}
    >
      {children}
    </dialog>
  );
}
