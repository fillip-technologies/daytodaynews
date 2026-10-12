"use server";

import { prisma } from "@/lib/prisma";
import { sendContributorNotification } from "@/lib/mail";

export type PitchResult = {
  success: boolean;
  error?: string;
};

export async function submitContributorPitch(values: Record<string, string>): Promise<PitchResult> {
  const name = values.name?.trim();
  const email = values.email?.trim().toLowerCase();
  const topic = values.topic?.trim();
  const idea = values.idea?.trim();
  const message = values.message?.trim();
  const portfolio = values.portfolio?.trim() || null;

  if (!name || !email || !topic || !idea || !message) {
    return { success: false, error: "Please fill in all required fields." };
  }

  try {
    const pitch = await prisma.contributorPitch.create({
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
