"use server";

import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/mail";

export type ContactResult = {
  success: boolean;
  error?: string;
};

export async function submitContactForm(values: Record<string, string>): Promise<ContactResult> {
  const name = values.name?.trim();
  const email = values.email?.trim().toLowerCase();
  const subject = values.subject?.trim() || "General enquiry";
  const message = values.message?.trim();

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all required fields." };
  }

  try {
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    // Send email notifications asynchronously
    sendContactNotification({ name, email, subject, message }).catch((err) => {
      console.error("Failed to send contact notification email:", err);
    });

    return { success: true };
  } catch (error) {
    console.error("Contact submission error:", error);
    return { success: false, error: "Failed to submit message. Please try again later." };
  }
}
