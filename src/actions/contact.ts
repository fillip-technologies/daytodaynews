"use server";

import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/mail";
import { deliverLead } from "@/lib/integrations";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cleanEmail, cleanLine, cleanText, FORM_LIMITS, isHoneypotFilled } from "@/lib/validation";

export type ContactResult = {
  success: boolean;
  error?: string;
};

const HOUR = 60 * 60 * 1000;

export async function submitContactForm(values: Record<string, string>): Promise<ContactResult> {
  if (isHoneypotFilled(values)) return { success: true };
  const name = cleanLine(values.name, FORM_LIMITS.name);
  const email = cleanEmail(values.email);
  const subject = cleanLine(values.subject, FORM_LIMITS.subject) || "General enquiry";
  const message = cleanText(values.message, FORM_LIMITS.message);

  if (!name || !values.email?.trim() || !message) {
    return { success: false, error: "Please fill in all required fields." };
  }
  if (!email) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // Each submission sends two emails, so cap how often one visitor can submit.
  if (!(await rateLimit("contact", await clientIp(), 5, HOUR))) {
    return { success: false, error: "Too many messages from your connection. Please try again later." };
  }

  try {
    await prisma.contactSubmission.create({
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
    deliverLead({ event: "contact_message", data: { name, email, subject, message } }).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error("Contact submission error:", error);
    return { success: false, error: "Failed to submit message. Please try again later." };
  }
}
