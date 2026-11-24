import { createHmac, timingSafeEqual } from "node:crypto";
import { escapeHtml } from "@/lib/mail";
import { getJwtSecret } from "@/lib/session-secret";

// The weekly brief (Admin → Newsletter): the email built from an issue, and the
// signed one-click unsubscribe link every copy carries.

/** Signature for an unsubscribe link, so nobody can unsubscribe someone else. */
export function unsubscribeToken(email: string): string {
  return createHmac("sha256", getJwtSecret()).update(`unsubscribe:${email.toLowerCase()}`).digest("hex").slice(0, 32);
}

export function isValidUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function unsubscribeUrl(siteUrl: string, email: string): string {
  const url = new URL("/api/newsletter/unsubscribe", siteUrl);
  url.searchParams.set("e", email);
  url.searchParams.set("t", unsubscribeToken(email));
  return url.toString();
}

export type IssueArticle = { title: string; description: string | null; url: string; category: string };

export type IssueContent = {
  subject: string;
  intro: string | null;
  articles: IssueArticle[];
  sponsor: { name: string; text: string | null; url: string | null } | null;
  siteName: string;
  siteUrl: string;
};

/** The email for one subscriber (text and HTML). Sponsor content is labelled. */
export function renderIssue(issue: IssueContent, unsubscribe: string) {
  const intro = issue.intro?.trim() ?? "";
  const textParts = [
    issue.subject,
    intro,
    ...issue.articles.map((a) => `• ${a.title}${a.description ? `\n  ${a.description}` : ""}\n  ${a.url}`),
    issue.sponsor
      ? `SPONSORED · ${issue.sponsor.name}\n${issue.sponsor.text ?? ""}${issue.sponsor.url ? `\n${issue.sponsor.url}` : ""}`
      : "",
    `You receive this because you subscribed to ${issue.siteName}. Unsubscribe: ${unsubscribe}`,
  ].filter(Boolean);

  const articleHtml = issue.articles
    .map(
      (a) => `
      <tr><td style="padding: 0 0 22px;">
        <p style="margin: 0 0 4px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #6366f1; font-weight: 700;">${escapeHtml(a.category)}</p>
        <a href="${escapeHtml(a.url)}" style="font-size: 18px; font-weight: 700; color: #0f172a; text-decoration: none;">${escapeHtml(a.title)}</a>
        ${a.description ? `<p style="margin: 6px 0 0; font-size: 15px; line-height: 1.55; color: #475569;">${escapeHtml(a.description)}</p>` : ""}
      </td></tr>`,
    )
    .join("");

  const sponsorHtml = issue.sponsor
    ? `
      <tr><td style="padding: 6px 0 24px;">
        <div style="border: 1px solid #fcd34d; background: #fffbeb; border-radius: 10px; padding: 16px 18px;">
          <p style="margin: 0 0 6px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #b45309; font-weight: 700;">Sponsored · ${escapeHtml(issue.sponsor.name)}</p>
          ${issue.sponsor.text ? `<p style="margin: 0; font-size: 15px; line-height: 1.55; color: #1e293b;">${escapeHtml(issue.sponsor.text)}</p>` : ""}
          ${issue.sponsor.url ? `<p style="margin: 10px 0 0;"><a href="${escapeHtml(issue.sponsor.url)}" rel="sponsored" style="color: #b45309; font-weight: 700;">Learn more →</a></p>` : ""}
        </div>
      </td></tr>`
    : "";

  const html = `<!doctype html>
<html><body style="margin: 0; background: #f1f5f9; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f1f5f9; padding: 24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 14px; padding: 28px;">
        <tr><td style="padding: 0 0 18px; font-size: 20px; font-weight: 800; color: #0f172a;">${escapeHtml(issue.siteName)}</td></tr>
        <tr><td style="padding: 0 0 8px; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.25;">${escapeHtml(issue.subject)}</td></tr>
        ${intro ? `<tr><td style="padding: 0 0 22px; font-size: 16px; line-height: 1.6; color: #334155; white-space: pre-line;">${escapeHtml(intro)}</td></tr>` : ""}
        ${articleHtml}
        ${sponsorHtml}
        <tr><td style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; line-height: 1.6; color: #64748b;">
          You receive this because you subscribed at <a href="${escapeHtml(issue.siteUrl)}" style="color: #64748b;">${escapeHtml(issue.siteName)}</a>.
          <a href="${escapeHtml(unsubscribe)}" style="color: #64748b;">Unsubscribe</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { text: textParts.join("\n\n"), html };
}

/** One CSV cell, quoted, with formula injection neutralised for spreadsheet apps. */
export function csvCell(value: string | number | null | undefined): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
