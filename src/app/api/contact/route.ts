import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = body.name ? String(body.name).trim() : "";
    const email = body.email ? String(body.email).trim().toLowerCase() : "";
    const subject = body.subject ? String(body.subject).trim() : "General enquiry";
    const message = body.message ? String(body.message).trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 }
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
