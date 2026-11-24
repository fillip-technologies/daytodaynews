import { prisma } from "@/lib/prisma";
import { SCHEDULING_ENABLED } from "@/lib/visibility";
import { PlanManager } from "./PlanManager";

export const metadata = { title: "Editorial Plan — Admin Portal" };

/** How the plan shows an article: Live, Scheduled, In review, Draft… */
function articleLabel(article: { status: string; publishedAt: Date }, now: number) {
  if (article.status === "PUBLISHED") return SCHEDULING_ENABLED && article.publishedAt.getTime() > now ? "Scheduled" : "Live";
  return article.status === "IN_REVIEW" ? "In review" : article.status;
}

const currentTime = () => Date.now();

export default async function AdminPlanPage() {
  const [items, staff, articles, pitches, pendingListings] = await Promise.all([
    prisma.planItem.findMany({ orderBy: [{ month: "asc" }, { number: "asc" }] }).catch(() => []),
    prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.article.findMany({ select: { slug: true, status: true, publishedAt: true } }).catch(() => []),
    prisma.contributorPitch.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.listing.count({ where: { status: "PENDING" } }).catch(() => 0),
  ]);
  const now = currentTime();
  const articleState = Object.fromEntries(articles.map((a) => [a.slug, articleLabel(a, now)]));

  return (
    <PlanManager
      staff={staff.map((s) => ({ value: s.id, label: s.name }))}
      articleState={articleState}
      pipelines={{ pitches, pendingListings }}
      items={items.map((item) => ({
        id: item.id,
        number: item.number,
        kind: item.kind,
        title: item.title,
        focusKeyword: item.focusKeyword ?? "",
        secondaryKeywords: item.secondaryKeywords ?? "",
        category: item.category ?? "",
        wordTarget: item.wordTarget ? String(item.wordTarget) : "",
        month: item.month ? String(item.month) : "",
        dueDate: item.dueDate ? item.dueDate.toISOString().slice(0, 10) : "",
        writerId: item.writerId ?? "",
        editorId: item.editorId ?? "",
        status: item.status,
        articleSlug: item.articleSlug ?? "",
        metaTitle: item.metaTitle ?? "",
        metaDescription: item.metaDescription ?? "",
        notes: item.notes ?? "",
        checklist: (() => {
          try {
            const v = JSON.parse(item.checklist ?? "[]");
            return Array.isArray(v) ? v.filter((k): k is string => typeof k === "string") : [];
          } catch {
            return [];
          }
        })(),
      }))}
    />
  );
}
