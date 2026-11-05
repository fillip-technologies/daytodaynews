"use client";

import { submitContributorPitch } from "@/actions/contribute";
import { useI18n } from "@/i18n/client";
import { UiForm, type FormFieldConfig } from "./UiForm";

/** `topics` come from Admin → Pages → Write for Us; labels from Admin → Site Text. */
export function ContributorForm({ topics }: { topics: string[] }) {
  const t = useI18n().t.forms.pitch;
  const fields: FormFieldConfig[] = [
    { name: "name", label: t.name, required: true, autoComplete: "name", placeholder: t.namePlaceholder },
    { name: "email", label: t.email, type: "email", required: true, autoComplete: "email", placeholder: t.emailPlaceholder },
    { name: "topic", label: t.topic, type: "select", required: true, options: topics, placeholder: t.topicPlaceholder },
    { name: "portfolio", label: t.portfolio, type: "url", autoComplete: "url", placeholder: t.portfolioPlaceholder },
    { name: "idea", label: t.idea, required: true, placeholder: t.ideaPlaceholder, fullWidth: true },
    {
      name: "message",
      label: t.message,
      type: "textarea",
      required: true,
      minLength: 40,
      rows: 6,
      placeholder: t.messagePlaceholder,
      hint: t.messageHint,
      fullWidth: true,
    },
  ];

  return (
    <UiForm
      fields={fields}
      onSubmit={async (values) => {
        const res = await submitContributorPitch(values);
        if (!res.success) {
          throw new Error(res.error || "Failed to submit idea");
        }
      }}
      submitLabel={t.submit}
      successTitle={t.successTitle}
      successMessage={t.successMessage}
    />
  );
}
