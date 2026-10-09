import { UiForm, type FormFieldConfig } from "./UiForm";

export const contactSubjects = ["General enquiry", "Editorial", "Partnerships", "Other"];

const fields: FormFieldConfig[] = [
  { name: "name", label: "Full Name", required: true, autoComplete: "name", placeholder: "Your name" },
  { name: "email", label: "Email Address", type: "email", required: true, autoComplete: "email", placeholder: "you@company.com" },
  { name: "subject", label: "Subject", type: "select", required: true, options: contactSubjects, placeholder: "What is this about?", fullWidth: true },
  { name: "message", label: "Message", type: "textarea", required: true, minLength: 20, rows: 6, placeholder: "How can we help?", fullWidth: true },
];

export function ContactForm() {
  return (
    <UiForm
      fields={fields}
      submitLabel="Send Message"
      note="We'll get back to you as soon as possible."
      successTitle="Thanks for reaching out!"
      successMessage="Our contact form is being connected, so this message wasn't sent yet. Please check back soon."
    />
  );
}
