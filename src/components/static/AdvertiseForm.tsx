"use client";

import { submitAdvertisingEnquiry } from "@/actions/leads";
import { useI18n } from "@/i18n/client";
import { UiForm, type FormFieldConfig } from "./UiForm";

/** Options and budgets come from Admin → Pages → Advertise; labels from Admin → Site Text. */
export function AdvertiseForm({ options, budgets }: { options: string[]; budgets: string[] }) {
  const t = useI18n().t.forms.advertise;
  const fields: FormFieldConfig[] = [
    { name: "name", label: t.name, required: true, autoComplete: "name" },
    { name: "email", label: t.email, type: "email", required: true, autoComplete: "email" },
    { name: "company", label: t.company, required: true, autoComplete: "organization" },
    { name: "website", label: t.website, type: "url", autoComplete: "url" },
    ...(options.length
      ? [{ name: "interest", label: t.interest, type: "select" as const, required: true, options, placeholder: t.interestPlaceholder }]
      : []),
    ...(budgets.length
      ? [{ name: "budget", label: t.budget, type: "select" as const, options: budgets, placeholder: t.budgetPlaceholder }]
      : []),
    {
      name: "message",
      label: t.message,
      type: "textarea",
      required: true,
      minLength: 20,
      rows: 5,
      placeholder: t.messagePlaceholder,
      fullWidth: true,
    },
  ];

  return (
    <UiForm
      fields={fields}
      onSubmit={async (values) => {
        const res = await submitAdvertisingEnquiry({ ...values, sourcePath: window.location.pathname });
        if (!res.success) throw new Error(res.error || "");
      }}
      submitLabel={t.submit}
      successTitle={t.successTitle}
      successMessage={t.successMessage}
      leadEvent={{ form: "advertising" }}
    />
  );
}
