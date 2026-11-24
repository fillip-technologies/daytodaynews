"use server";

import { revalidatePath } from "next/cache";
import { localizePath } from "@/i18n/config";
import { createMailTransporter, defaultSender } from "@/lib/mail";
import { renderIssue, unsubscribeUrl, type IssueContent } from "@/lib/newsletter";
import { prisma } from "@/lib/prisma";
import { getSiteSeo } from "@/lib/seo/site";
import { errorMessage, requireAdmin, requireStaff } from "@/lib/staff";
import { cleanEmail, cleanHttpUrl, cleanLine, cleanText } from "@/lib/validation";
import { liveArticleWhere } from "@/lib/visibility";

// Admin → Newsletter: compose an issue (intro, chosen articles, optional
// labelled sponsor), send a test, then send it to every active subscriber.

type Result = { success: boolean; error?: string; id?: string; sent?: number; failed?: number };

type IssueInput = {
  subject: string;
  intro?: string;
  articleSlugs?: string[];
  sponsorName?: string;
  sponsorText?: string;
  sponsorUrl?: string;
};

function cleanIssue(input: IssueInput) {
  const subject = cleanLine(input.subject, 200);
  if (!subject) return { ok: false as const, error: "The subject is required." };
  const sponsorName = cleanLine(input.sponsorName, 150) || null;
  const sponsorUrlTyped = cleanLine(input.sponsorUrl, 2048);
  const sponsorUrl = sponsorUrlTyped ? cleanHttpUrl(sponsorUrlTyped) : null;
  if (sponsorUrlTyped && !sponsorUrl) return { ok: false as const, error: "Sponsor link must start with https://" };
  const slugs = [...new Set((input.articleSlugs ?? []).map((s) => cleanLine(s, 191)).filter(Boolean))].slice(0, 12);
  return {
    ok: true as const,
    value: {
      subject,
      intro: cleanText(input.intro, 3000) || null,
      articleSlugs: JSON.stringify(slugs),
      sponsorName,
      sponsorText: sponsorName ? cleanText(input.sponsorText, 600) || null : null,
      sponsorUrl: sponsorName ? sponsorUrl : null,
    },
  };
}

export async function saveIssue(id: string | null, input: IssueInput): Promise<Result> {
  try {
    await requireStaff();
    const clean = cleanIssue(input);
    if (!clean.ok) return { success: false, error: clean.error };
    if (id) {
      const existing = await prisma.newsletterIssue.findUnique({ where: { id } });
      if (!existing) return { success: false, error: "Issue not found." };
      if (existing.sentAt) return { success: false, error: "This issue was already sent and can't be changed." };
      await prisma.newsletterIssue.update({ where: { id }, data: clean.value });
      revalidatePath("/admin/newsletter");
      return { success: true, id };
    }
    const created = await prisma.newsletterIssue.create({ data: clean.value });
    revalidatePath("/admin/newsletter");
    return { success: true, id: created.id };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to save the issue.") };
  }
}

export async function deleteIssue(id: string): Promise<Result> {
  try {
    await requireStaff();
    await prisma.newsletterIssue.delete({ where: { id } });
    revalidatePath("/admin/newsletter");
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "Failed to delete the issue.") };
  }
}

/** The issue's content: its chosen live articles with absolute English links. */
async function issueContent(id: string): Promise<IssueContent & { sentAt: Date | null }> {
  const issue = await prisma.newsletterIssue.findUnique({ where: { id } });
  if (!issue) throw new Error("Issue not found.");
  const site = await getSiteSeo();
  let slugs: string[] = [];
  try {
    slugs = JSON.parse(issue.articleSlugs ?? "[]");
  } catch {
    slugs = [];
  }
  const rows = await prisma.article.findMany({
    where: { slug: { in: slugs }, ...liveArticleWhere() },
    select: { slug: true, title: true, description: true, topic: { select: { label: true } } },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return {
    subject: issue.subject,
    intro: issue.intro,
    articles: slugs.flatMap((slug) => {
      const row = bySlug.get(slug);
      return row
        ? [
            {
              title: row.title,
              description: row.description,
              category: row.topic.label,
              url: new URL(localizePath(`/articles/${row.slug}`, "en"), site.siteUrl).toString(),
            },
          ]
        : [];
    }),
    sponsor: issue.sponsorName ? { name: issue.sponsorName, text: issue.sponsorText, url: issue.sponsorUrl } : null,
    siteName: site.siteName.en,
    siteUrl: site.siteUrl,
    sentAt: issue.sentAt,
  };
}

export async function sendTestIssue(id: string, email: string): Promise<Result> {
  try {
    await requireStaff();
    const to = cleanEmail(email);
    if (!to) return { success: false, error: "Enter a valid email address for the test." };
    const content = await issueContent(id);
    const { text, html } = renderIssue(content, unsubscribeUrl(content.siteUrl, to));
    await createMailTransporter().sendMail({ from: defaultSender, to, subject: `[TEST] ${content.subject}`, text, html });
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error, "The test email could not be sent.") };
  }
}

/**
 * Sends the issue to every active subscriber, one email each (so every copy has
 * its own unsubscribe link). Admins only; an issue can be sent once.
 */
export async function sendIssue(id: string): Promise<Result> {
  try {
    await requireAdmin();
    const content = await issueContent(id);
    if (content.sentAt) return { success: false, error: "This issue was already sent." };
    if (content.articles.length === 0 && !content.intro) {
      return { success: false, error: "Add an introduction or at least one published article first." };
    }
    // Claim the issue first, so a double click can't send it twice.
    const claimed = await prisma.newsletterIssue.updateMany({ where: { id, sentAt: null }, data: { sentAt: new Date() } });
    if (claimed.count === 0) return { success: false, error: "This issue is already being sent." };

    const subscribers = await prisma.newsletterSubscriber.findMany({ where: { status: "ACTIVE" }, select: { email: true } });
    const transporter = createMailTransporter();
    let sent = 0;
    let failed = 0;
    for (const { email } of subscribers) {
      const unsubscribe = unsubscribeUrl(content.siteUrl, email);
      const { text, html } = renderIssue(content, unsubscribe);
      try {
        await transporter.sendMail({
          from: defaultSender,
          to: email,
          subject: content.subject,
          text,
          html,
          list: { unsubscribe: { url: unsubscribe, comment: "Unsubscribe" } },
        });
        sent++;
      } catch (error) {
        failed++;
        console.error(`Newsletter to ${email} failed:`, error);
      }
    }
    await prisma.newsletterIssue.update({ where: { id }, data: { recipients: sent, failed } });
    revalidatePath("/admin/newsletter");
    return { success: true, sent, failed };
  } catch (error) {
    return { success: false, error: errorMessage(error, "The issue could not be sent.") };
  }
}
