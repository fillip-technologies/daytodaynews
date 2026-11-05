"use client";

import { submitContactForm } from "@/actions/contact";
import { useI18n } from "@/i18n/client";
import { UiForm, type FormFieldConfig } from "./UiForm";

/** `subjects` come from Admin → Pages → Contact; labels from Admin → Site Text. */
export function ContactForm({ subjects }: { subjects: string[] }) {
  const t = useI18n().t.forms.contact;
  const fields: FormFieldConfig[] = [
    { name: "name", label: t.name, required: true, autoComplete: "name", placeholder: t.namePlaceholder },
    { name: "email", label: t.email, type: "email", required: true, autoComplete: "email", placeholder: t.emailPlaceholder },
    { name: "subject", label: t.subject, type: "select", required: true, options: subjects, placeholder: t.subjectPlaceholder, fullWidth: true },
    { name: "message", label: t.message, type: "textarea", required: true, minLength: 20, rows: 6, placeholder: t.messagePlaceholder, fullWidth: true },
  ];

  return (
    <UiForm
      fields={fields}
      onSubmit={async (values) => {
        const res = await submitContactForm(values);
        if (!res.success) {
          throw new Error(res.error || "Failed to submit message");
        }
      }}
      submitLabel={t.submit}
      note={t.note}
      successTitle={t.successTitle}
      successMessage={t.successMessage}
    />
  );
}
