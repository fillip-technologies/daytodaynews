"use server";

import { prisma } from "@/lib/prisma";
import { sendNewsletterWelcome } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cleanEmail } from "@/lib/validation";

export type SubscribeResult = {
  success: boolean;
  error?: string;
};

const HOUR = 60 * 60 * 1000;

export async function subscribeNewsletter(email: string): Promise<SubscribeResult> {
  const address = cleanEmail(email);
  if (!address) {
    return { success: false, error: "Please provide a valid email address." };
  }

  // Each subscription sends a welcome email, so cap how often one visitor can subscribe.
  if (!(await rateLimit("newsletter", await clientIp(), 5, HOUR))) {
    return { success: false, error: "Too many requests from your connection. Please try again later." };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: address },
      update: { status: "ACTIVE" },
      create: { email: address, status: "ACTIVE" },
    });

    // Send welcome email asynchronously
    sendNewsletterWelcome(address).catch((err) => {
      console.error("Failed to send welcome newsletter email:", err);
    });

    return { success: true };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { success: false, error: "Subscription failed. Please try again later." };
  }
}
