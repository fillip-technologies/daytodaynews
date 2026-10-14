import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cleanEmail, cleanLine, cleanText, FORM_LIMITS } from "@/lib/validation";

const HOUR = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = cleanLine(body.name, FORM_LIMITS.name);
    const email = cleanEmail(body.email);
    const subject = cleanLine(body.subject, FORM_LIMITS.subject) || "General enquiry";
    const message = cleanText(body.message, FORM_LIMITS.message);

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, a valid email, and message are required" },
        { status: 400 }
      );
    }

    if (!(await rateLimit("contact", await clientIp(), 5, HOUR))) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const submission = await prisma.contactSubmission.create({
      data: { name, email, subject, message },
    });

    return NextResponse.json({
      success: true,
      data: { id: submission.id },
    });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit contact enquiry" },
      { status: 500 }
    );
  }
}
