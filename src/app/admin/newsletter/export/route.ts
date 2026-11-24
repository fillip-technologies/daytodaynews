import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { csvCell } from "@/lib/newsletter";
import { prisma } from "@/lib/prisma";

// Admin → Newsletter → Export CSV: all subscribers, for Brevo, Mailchimp or a spreadsheet.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: "asc" } });
  const rows = [
    ["email", "status", "subscribed_at"].map(csvCell).join(","),
    ...subscribers.map((s) => [s.email, s.status, s.subscribedAt.toISOString()].map(csvCell).join(",")),
  ];
  return new NextResponse(rows.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="daytodaynews-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
