import { prisma } from "@/lib/prisma";
import { SCHEDULING_ENABLED } from "@/lib/visibility";

// The dashboard's 90-day plan numbers (plan section 12): weekly publishing
// against the 3-articles target, the editorial pipeline, and commercial leads.

export type Kpi = { label: string; value: string; detail: string; href: string; attention?: boolean };

const DAY = 24 * 60 * 60 * 1000;

export async function getPlanKpis(): Promise<Kpi[]> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * DAY);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * DAY);
  const safe = <T,>(promise: Promise<T>, fallback: T) => promise.catch(() => fallback);

  const [
    publishedThisWeek,
    updatedThisWeek,
    scheduled,
    inReview,
    planTotal,
    planDone,
    pendingPitches,
    newLeads,
    pendingListings,
    approvedListings,
    activeSubscribers,
    issuesSent,
  ] = await Promise.all([
    safe(prisma.article.count({ where: { status: "PUBLISHED", publishedAt: { gte: weekAgo, lte: now } } }), 0),
    safe(prisma.article.count({ where: { contentUpdatedAt: { gte: weekAgo } } }), 0),
    safe(prisma.article.count({ where: { status: "PUBLISHED", publishedAt: { gt: now } } }), 0),
    safe(prisma.article.count({ where: { status: "IN_REVIEW" } }), 0),
    safe(prisma.planItem.count(), 0),
    safe(prisma.planItem.count({ where: { status: "PUBLISHED" } }), 0),
    safe(prisma.contributorPitch.count({ where: { status: "PENDING" } }), 0),
    safe(prisma.lead.count({ where: { status: "NEW" } }), 0),
    safe(prisma.listing.count({ where: { status: "PENDING" } }), 0),
    safe(prisma.listing.count({ where: { status: "APPROVED" } }), 0),
    safe(prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }), 0),
    safe(prisma.newsletterIssue.count({ where: { sentAt: { gte: ninetyDaysAgo } } }), 0),
  ]);

  return [
    {
      label: "Published this week",
      value: `${publishedThisWeek} / 3`,
      detail: "Target: 3 new articles a week",
      href: "/admin/articles",
      attention: publishedThisWeek < 3,
    },
    {
      label: "Updated this week",
      value: `${updatedThisWeek} / 1–2`,
      detail: "Target: refresh 1–2 existing articles",
      href: "/admin/articles",
      attention: updatedThisWeek < 1,
    },
    {
      label: SCHEDULING_ENABLED ? "Scheduled · In review" : "Future-dated · In review",
      value: `${scheduled} · ${inReview}`,
      detail: SCHEDULING_ENABLED ? "Waiting to go live / for fact-check" : "Dated after today (npm run fix:dates) / waiting for fact-check",
      href: "/admin/articles",
      attention: inReview > 0,
    },
    {
      label: "Editorial plan",
      value: planTotal ? `${planDone} / ${planTotal}` : "Not set up",
      detail: planTotal ? "Plan items published" : "Import the 90-day plan",
      href: "/admin/plan",
      attention: planTotal === 0,
    },
    {
      label: "Guest-post pitches",
      value: String(pendingPitches),
      detail: "Waiting for an editor's reply",
      href: "/admin/inbox",
      attention: pendingPitches > 0,
    },
    {
      label: "New leads",
      value: String(newLeads),
      detail: "Advertising & directory enquiries",
      href: "/admin/leads",
      attention: newLeads > 0,
    },
    {
      label: "Directory",
      value: `${approvedListings} live · ${pendingListings} pending`,
      detail: "Listings to review",
      href: "/admin/directory",
      attention: pendingListings > 0,
    },
    {
      label: "Newsletter",
      value: `${issuesSent} / 12 sent`,
      detail: `${activeSubscribers} active subscribers · last 90 days`,
      href: "/admin/newsletter",
    },
  ];
}
