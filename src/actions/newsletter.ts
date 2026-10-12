"use server";

import { prisma } from "@/lib/prisma";
import { sendNewsletterWelcome } from "@/lib/mail";

export type SubscribeResult = {
  success: boolean;
  error?: string;
};

export async function subscribeNewsletter(email: string): Promise<SubscribeResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { success: false, error: "Please provide a valid email address." };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: trimmed },
      update: { status: "ACTIVE" },
      create: { email: trimmed, status: "ACTIVE" },
    });

    // Send welcome email asynchronously
    sendNewsletterWelcome(trimmed).catch((err) => {
      console.error("Failed to send welcome newsletter email:", err);
    });

    return { success: true };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { success: false, error: "Subscription failed. Please try again later." };
  }
}
