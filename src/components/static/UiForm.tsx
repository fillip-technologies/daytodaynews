"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type FormFieldConfig = {
  name: string;
  label: string;
  type?: "text" | "email" | "url" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  /** For `select` fields. */
  options?: string[];
  minLength?: number;
  rows?: number;
  /** Span both columns in the two-column layout. */
  fullWidth?: boolean;
  hint?: string;
};

export type FormValues = Record<string, string>;

type UiFormProps = {
  fields: FormFieldConfig[];
  submitLabel: string;
  note?: string;
  /** Wire to an API later; without it the form only confirms locally. */
  onSubmit?: (values: FormValues) => Promise<void>;
  successTitle?: string;
  successMessage?: string;
};

function validate(field: FormFieldConfig, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    if (!field.required) return null;
    const label = field.label.toLowerCase();
    return field.type === "select" ? `Please choose a ${label}.` : `Please enter your ${label}.`;
  }
  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Please enter a valid email address.";
  }
  // Accepts "example.com" or "https://example.com/path".
  if (field.type === "url" && !/^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i.test(trimmed)) {
    return "Please enter a valid website address.";
  }
  if (field.minLength && trimmed.length < field.minLength) {
    return `Please write at least ${field.minLength} characters.`;
  }
  return null;
}

const controlClass =
  "w-full rounded-xl border bg-surface-elevated px-4 text-[0.9375rem] text-text-primary transition-[border-color,box-shadow] placeholder:text-text-muted focus:shadow-[0_0_0_4px] focus:outline-none";

/** Accessible, validation-ready form used by the contact and contributor pages. */
export function UiForm({
  fields,
  submitLabel,
  note,
  onSubmit,
  successTitle = "Thank you!",
  successMessage = "Online submissions are opening soon, so this message wasn't sent yet.",
}: UiFormProps) {
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  const valuesOf = (form: HTMLFormElement): FormValues =>
    Object.fromEntries(fields.map((field) => [field.name, String(new FormData(form).get(field.name) ?? "")]));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = valuesOf(form);
    const nextErrors: Record<string, string> = {};
    for (const field of fields) {
      const error = validate(field, values[field.name]);
      if (error) nextErrors[field.name] = error;
    }
    setErrors(nextErrors);
    const firstInvalid = fields.find((field) => nextErrors[field.name]);
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid.name}"]`)?.focus();
      return;
    }
    setStatus("submitting");
    await onSubmit?.(values);
    setStatus("done");
  }

  /** Once an error is shown, re-check that field as the user fixes it. */
  function revalidate(field: FormFieldConfig, value: string) {
    if (!errors[field.name]) return;
    setErrors((current) => {
      const next = { ...current };
      const error = validate(field, value);
      if (error) next[field.name] = error;
      else delete next[field.name];
      return next;
    });
  }

  if (status === "done") {
    return (
      <div role="status" className="rounded-2xl border border-border bg-background px-6 py-10 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-success text-surface-elevated">
          <Icon name="check" className="size-6" />
        </span>
        <p className="mt-4 text-lg font-semibold text-text-primary">{successTitle}</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-text-secondary">{successMessage}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm font-semibold text-primary transition-colors hover:text-primary-hover outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
        >
          Start over
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => {
        const id = `${formId}-${field.name}`;
        const error = errors[field.name];
        const describedBy = [error && `${id}-error`, field.hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
        const shared = {
          id,
          name: field.name,
          required: field.required,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy,
          onChange: (event: { target: { value: string } }) => revalidate(field, event.target.value),
          className: cn(
            controlClass,
            error
              ? "border-error focus:border-error focus:shadow-error/15"
              : "border-border hover:border-text-muted/40 focus:border-primary focus:shadow-primary/15",
          ),
        };

        return (
          <div key={field.name} className={cn(field.fullWidth && "sm:col-span-2")}>
            <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-medium text-text-primary">
              {field.label}
              {!field.required && <span className="text-xs font-normal text-text-muted">Optional</span>}
            </label>
            <div className="mt-2">
              {field.type === "textarea" ? (
                <textarea
                  {...shared}
                  rows={field.rows ?? 5}
                  placeholder={field.placeholder}
                  className={cn(shared.className, "min-h-32 resize-y py-3 leading-relaxed")}
                />
              ) : field.type === "select" ? (
                <div className="relative">
                  <select {...shared} defaultValue="" className={cn(shared.className, "h-12 appearance-none pr-10")}>
                    <option value="" disabled>
                      {field.placeholder ?? "Select an option"}
                    </option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Icon
                    name="chevronDown"
                    className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-text-muted"
                  />
                </div>
              ) : (
                <input
                  {...shared}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  className={cn(shared.className, "h-12")}
                />
              )}
            </div>
            {field.hint && !error && (
              <p id={`${id}-hint`} className="mt-1.5 text-xs text-text-muted">
                {field.hint}
              </p>
            )}
            {error && (
              <p id={`${id}-error`} className="mt-1.5 text-sm text-error">
                {error}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        {note && <p className="text-sm text-text-muted">{note}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-[0.9375rem] font-semibold text-surface-elevated shadow-md shadow-primary/25 transition-colors duration-200 hover:bg-primary-hover disabled:opacity-70 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
        >
          {submitLabel}
          <Icon
            name="arrowRight"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </button>
      </div>
    </form>
  );
}
