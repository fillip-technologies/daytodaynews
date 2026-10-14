import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  const [
    totalArticles,
    totalViews,
    totalUsers,
    totalSubscribers,
    recentArticles,
    recentSubmissions,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.aggregate({ _sum: { viewsCount: true } }),
    prisma.user.count(),
    prisma.newsletterSubscriber.count(),
    prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { author: true, topic: true },
    }),
    prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const stats = [
    {
      label: "Total Articles",
      value: totalArticles,
      icon: "layers" as const,
      detail: "Published & drafts",
    },
    {
      label: "Total Article Views",
      value: totalViews._sum.viewsCount || 0,
      icon: "chart" as const,
      detail: "Live reader traffic",
    },
    {
      label: "Staff & Authors",
      value: totalUsers,
      icon: "users" as const,
      detail: "Admins & editors",
    },
    {
      label: "Newsletter Subscribers",
      value: totalSubscribers,
      icon: "mail" as const,
      detail: "Active weekly brief",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Welcome back, {user?.name || "Admin"}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Platform overview, editorial metrics, and system status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/articles/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-surface-elevated shadow-xs transition-colors hover:bg-primary-hover"
          >
            <Icon name="sparkles" className="size-3.5" />
            Write New Article
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 text-xs font-semibold text-text-primary shadow-2xs transition-colors hover:border-primary/40"
          >
            <Icon name="users" className="size-3.5" />
            Manage Users
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {stat.label}
              </span>
              <span className="grid size-8 place-items-center rounded-lg bg-background text-primary">
                <Icon name={stat.icon} className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="mt-1 text-xs text-text-muted">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Recent Articles & Recent Messages */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Articles (2 Cols) */}
        <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">Recent Articles</h2>
            <Link
              href="/admin/articles"
              className="text-xs font-semibold text-primary hover:text-primary-hover"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 divide-y divide-border">
            {recentArticles.map((article) => (
              <div key={article.id} className="flex items-center justify-between py-3.5">
                <div className="min-w-0 flex-1 pr-4">
                  <Link
                    href={`/en/articles/${article.slug}`}
                    target="_blank"
                    className="truncate text-sm font-semibold text-text-primary hover:text-primary"
                  >
                    {article.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                    <span>{article.topic.label}</span>
                    <span>•</span>
                    <span>{article.authorName}</span>
                    <span>•</span>
                    <span>{formatDate(article.publishedAt.toISOString())}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-text-secondary">
                    {article.viewsCount} views
                  </span>
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text-primary hover:border-primary/40"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inbox Enquiries (1 Col) */}
        <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">Recent Inquiries</h2>
            <Link
              href="/admin/inbox"
              className="text-xs font-semibold text-primary hover:text-primary-hover"
            >
              Inbox
            </Link>
          </div>

          <div className="mt-5 space-y-3.5">
            {recentSubmissions.length === 0 ? (
              <p className="text-xs text-text-muted">No submissions received yet.</p>
            ) : (
              recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-xl border border-border bg-background p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-text-primary">{sub.name}</p>
                    <span className="text-[10px] text-text-muted">
                      {formatDate(sub.createdAt.toISOString())}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-text-secondary">{sub.subject}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-text-muted">{sub.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
