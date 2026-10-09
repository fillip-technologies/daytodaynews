import { UiForm, type FormFieldConfig } from "./UiForm";

export function ContributorForm({ topics }: { topics: string[] }) {
  const fields: FormFieldConfig[] = [
    { name: "name", label: "Name", required: true, autoComplete: "name", placeholder: "Your name" },
    { name: "email", label: "Email", type: "email", required: true, autoComplete: "email", placeholder: "you@company.com" },
    { name: "topic", label: "Topic", type: "select", required: true, options: topics, placeholder: "Choose a topic" },
    { name: "portfolio", label: "Portfolio / Website", type: "url", autoComplete: "url", placeholder: "yourwebsite.com" },
    { name: "idea", label: "Article Idea", required: true, placeholder: "Working title or one-line pitch", fullWidth: true },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      required: true,
      minLength: 40,
      rows: 6,
      placeholder: "Outline the angle, who it helps and why you're the right person to write it.",
      hint: "A short outline or a few key points is perfect.",
      fullWidth: true,
    },
  ];

  return (
    <UiForm
      fields={fields}
      submitLabel="Submit Idea"
      successTitle="Thanks for your idea!"
      successMessage="Contributor submissions are being connected, so this pitch wasn't sent yet. Please check back soon."
    />
  );
}
