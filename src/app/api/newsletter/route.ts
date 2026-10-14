import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cleanEmail } from "@/lib/validation";

const HOUR = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = cleanEmail(body.email);

    if (!email) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    if (!(await rateLimit("newsletter", await clientIp(), 5, HOUR))) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { status: "ACTIVE" },
      create: { email, status: "ACTIVE" },
    });

    return NextResponse.json({
      success: true,
      data: { id: subscriber.id, email: subscriber.email },
    });
  } catch (error) {
    console.error("POST /api/newsletter error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process newsletter subscription" },
      { status: 500 }
    );
  }
}
