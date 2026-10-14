"use server";

import { prisma } from "@/lib/prisma";
import { sendContributorNotification } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cleanEmail, cleanHttpUrl, cleanLine, cleanText, FORM_LIMITS } from "@/lib/validation";

export type PitchResult = {
  success: boolean;
  error?: string;
};

const HOUR = 60 * 60 * 1000;

export async function submitContributorPitch(values: Record<string, string>): Promise<PitchResult> {
  const name = cleanLine(values.name, FORM_LIMITS.name);
  const email = cleanEmail(values.email);
  const topic = cleanLine(values.topic, FORM_LIMITS.topic);
  const idea = cleanLine(values.idea, FORM_LIMITS.idea);
  const message = cleanText(values.message, FORM_LIMITS.message);
  const portfolioInput = cleanLine(values.portfolio, 2048);
  const portfolio = portfolioInput ? cleanHttpUrl(portfolioInput) : null;

  if (!name || !values.email?.trim() || !topic || !idea || !message) {
    return { success: false, error: "Please fill in all required fields." };
  }
  if (!email) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (portfolioInput && !portfolio) {
    return { success: false, error: "Portfolio must be a full web address starting with https://" };
  }

  // Each pitch sends two emails, so cap how often one visitor can submit.
  if (!(await rateLimit("pitch", await clientIp(), 5, HOUR))) {
    return { success: false, error: "Too many submissions from your connection. Please try again later." };
  }

  try {
    await prisma.contributorPitch.create({
      data: {
        name,
        email,
        topic,
        idea,
        message,
        portfolio,
      },
    });

    // Send email notifications asynchronously
    sendContributorNotification({ name, email, topic, idea, message, portfolio }).catch((err) => {
      console.error("Failed to send contributor pitch email:", err);
    });

    return { success: true };
  } catch (error) {
    console.error("Contributor pitch submission error:", error);
    return { success: false, error: "Failed to submit pitch. Please try again later." };
  }
}
