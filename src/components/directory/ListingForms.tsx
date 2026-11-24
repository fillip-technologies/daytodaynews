"use client";

import { submitListing } from "@/actions/directory";
import { submitListingEnquiry } from "@/actions/leads";
import { UiForm, type FormFieldConfig } from "@/components/static/UiForm";
import { useI18n } from "@/i18n/client";
import { fieldLabel, fieldsFor, pricingModels, startupStages, suggestedCategories, type ListingKind } from "@/lib/directory-config";

/** A reader's enquiry to a listed company; `from` is the article or page that led here. */
export function ListingEnquiryForm({ slug, from }: { slug: string; from?: string }) {
  const t = useI18n().t.forms.enquiry;
  const fields: FormFieldConfig[] = [
    { name: "name", label: t.name, required: true, autoComplete: "name" },
    { name: "email", label: t.email, type: "email", required: true, autoComplete: "email" },
    { name: "company", label: t.company, autoComplete: "organization" },
    { name: "phone", label: t.phone, autoComplete: "tel" },
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
        const sourcePath = from && from.startsWith("/") ? from : window.location.pathname;
        const res = await submitListingEnquiry(slug, { ...values, sourcePath });
        if (!res.success) throw new Error(res.error || "");
      }}
      submitLabel={t.submit}
      successTitle={t.successTitle}
      successMessage={t.successMessage}
      leadEvent={{ form: "listing_enquiry" }}
    />
  );
}

/**
 * List your business / Submit a tool / Submit your startup. Field labels are
 * English: listings are published in English for a global audience.
 */
export function ListingSubmitForm({ kind }: { kind: ListingKind }) {
  const { t } = useI18n();
  const fields: FormFieldConfig[] = fieldsFor(kind).map((field) => {
    const base = {
      name: field.key,
      label: fieldLabel(field, kind),
      required: field.required,
      hint: field.hint,
    };
    if (field.key === "category") {
      return { ...base, type: "select" as const, options: suggestedCategories[kind] };
    }
    if (field.key === "stage") return { ...base, type: "select" as const, options: startupStages };
    if (field.key === "pricingModel") return { ...base, type: "select" as const, options: pricingModels };
    switch (field.type) {
      case "text":
        return { ...base, type: "textarea" as const, rows: 5, minLength: 80, fullWidth: true };
      case "lines":
        return { ...base, type: "textarea" as const, rows: 4, fullWidth: true };
      case "url":
        return { ...base, type: "url" as const, placeholder: "https://" };
      case "email":
        return { ...base, type: "email" as const, autoComplete: "email" };
      default:
        return { ...base, fullWidth: field.key === "name" || field.key === "tagline" };
    }
  });
  fields.push({ name: "submitterName", label: "Your name", required: true, autoComplete: "name" });

  return (
    <UiForm
      fields={fields}
      note={t.directory.formLanguageNote}
      onSubmit={async (values) => {
        const res = await submitListing(kind, values);
        if (!res.success) throw new Error(res.error || "");
      }}
      submitLabel={t.directory.submit}
      successTitle={t.directory.submitSuccessTitle}
      successMessage={t.directory.submitSuccess}
      leadEvent={{ form: "listing_submission", directory: kind.toLowerCase() }}
    />
  );
}
