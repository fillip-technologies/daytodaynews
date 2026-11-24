import { NextResponse, type NextRequest } from "next/server";
import { escapeHtml } from "@/lib/mail";
import { isValidUnsubscribeToken } from "@/lib/newsletter";
import { prisma } from "@/lib/prisma";
import { cleanEmail } from "@/lib/validation";

// One-click unsubscribe from the newsletter. The link in every email is signed
// (lib/newsletter), so it only works for the address it was sent to. POST is
// the RFC 8058 one-click form mail apps use from the List-Unsubscribe header.

function page(title: string, message: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f8fafc;color:#0f172a;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px">
<main style="max-width:480px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;text-align:center">
<h1 style="font-size:22px;margin:0 0 8px">${escapeHtml(title)}</h1><p style="color:#475569;line-height:1.6;margin:0">${escapeHtml(message)}</p>
<p style="margin:24px 0 0"><a href="/" style="color:#6366f1;font-weight:600">Back to DayTodayNews</a></p></main></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" } },
  );
}

async function unsubscribe(request: NextRequest) {
  const email = cleanEmail(request.nextUrl.searchParams.get("e"));
  const token = request.nextUrl.searchParams.get("t") ?? "";
  if (!email || !isValidUnsubscribeToken(email, token)) {
    return page("Link not valid", "This unsubscribe link is incomplete or has expired. Please use the link from the latest email.", 400);
  }
  await prisma.newsletterSubscriber.updateMany({ where: { email }, data: { status: "UNSUBSCRIBED" } }).catch(() => null);
  return page("You're unsubscribed", "You will no longer receive the DayTodayNews newsletter. You can subscribe again at any time.");
}

export const GET = unsubscribe;
export const POST = unsubscribe;
