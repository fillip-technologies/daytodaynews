import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email ? String(body.email).trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
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
