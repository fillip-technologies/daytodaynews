import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { liveArticleWhere } from "@/lib/visibility";
import { NewsletterManager } from "./NewsletterManager";

export const metadata = { title: "Newsletter — Admin Portal" };

export default async function AdminNewsletterPage() {
  const [issues, articles, active, total, user] = await Promise.all([
    prisma.newsletterIssue.findMany({ orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []),
    prisma.article
      .findMany({
        where: liveArticleWhere(),
        orderBy: { publishedAt: "desc" },
        take: 200,
        select: { slug: true, title: true, publishedAt: true },
      })
      .catch(() => []),
    prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.newsletterSubscriber.count().catch(() => 0),
    getCurrentUser(),
  ]);

  return (
    <NewsletterManager
      isAdmin={user?.role === "ADMIN"}
      activeSubscribers={active}
      totalSubscribers={total}
      articles={articles.map((a) => ({ slug: a.slug, title: a.title, date: a.publishedAt.toISOString().slice(0, 10) }))}
      issues={issues.map((issue) => ({
        id: issue.id,
        subject: issue.subject,
        intro: issue.intro ?? "",
        articleSlugs: (() => {
          try {
            const value = JSON.parse(issue.articleSlugs ?? "[]");
            return Array.isArray(value) ? value.filter((s): s is string => typeof s === "string") : [];
          } catch {
            return [];
          }
        })(),
        sponsorName: issue.sponsorName ?? "",
        sponsorText: issue.sponsorText ?? "",
        sponsorUrl: issue.sponsorUrl ?? "",
        sentAt: issue.sentAt ? issue.sentAt.toISOString() : null,
        recipients: issue.recipients,
        failed: issue.failed,
        createdAt: issue.createdAt.toISOString(),
      }))}
    />
  );
}
