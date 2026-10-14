"use client";

import { useState } from "react";
import Link from "next/link";
import {
  deleteArticle,
  toggleArticleStatus,
  toggleArticleFlag,
  duplicateArticle,
} from "@/actions/articles";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import { useAdminDataTable } from "@/hooks/useAdminDataTable";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import type { ArticleStatus } from "@/generated/prisma";

type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  topicSlug: string;
  authorName: string;
  status: ArticleStatus;
  featured: boolean;
  editorsPick: boolean;
  trending: boolean;
  viewsCount: number;
  publishedAt: Date;
  topic: { label: string };
};

type TopicOption = {
  slug: string;
  label: string;
};

type ArticlesListProps = {
  initialArticles: ArticleItem[];
  topics: TopicOption[];
};

export function ArticlesList({ initialArticles, topics }: ArticlesListProps) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | ArticleStatus>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const statusCounts = {
    ALL: articles.length,
    PUBLISHED: articles.filter((a) => a.status === "PUBLISHED").length,
    DRAFT: articles.filter((a) => a.status === "DRAFT").length,
    ARCHIVED: articles.filter((a) => a.status === "ARCHIVED").length,
  };

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
    rangeText,
    sortKey,
    sortOrder,
    toggleSort,
  } = useAdminDataTable<ArticleItem>({
    data: articles,
    initialPageSize: 10,
    searchQuery: search,
    searchFields: [
      "title",
      "slug",
      "authorName",
      (a) => a.topic.label,
    ],
    filterKey: `${selectedTopic}_${selectedStatus}`,
    filterFn: (a) => {
      const matchesTopic = selectedTopic ? a.topicSlug === selectedTopic : true;
      const matchesStatus = selectedStatus === "ALL" ? true : a.status === selectedStatus;
      return matchesTopic && matchesStatus;
    },
    defaultSortKey: "publishedAt",
    defaultSortOrder: "desc",
    sortResolvers: {
      topic: (a) => a.topic.label,
    },
  });

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    setBusyId(id);
    const res = await deleteArticle(id);
    if (res.success) {
      setArticles((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert(res.error || "Failed to delete article");
    }
    setBusyId(null);
  }

  async function handleStatusToggle(id: string, currentStatus: ArticleStatus) {
    const nextStatus: ArticleStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setBusyId(id);
    const res = await toggleArticleStatus(id, nextStatus);
    if (res.success) {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
      );
    } else {
      alert(res.error || "Failed to update status");
    }
    setBusyId(null);
  }

  async function handleFlagToggle(
    id: string,
    flag: "featured" | "editorsPick" | "trending"
  ) {
    setBusyId(id);
    const res = await toggleArticleFlag(id, flag);
    if (res.success && res.newValue !== undefined) {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, [flag]: res.newValue } : a))
      );
    }
    setBusyId(null);
  }

  async function handleDuplicate(id: string) {
    setBusyId(id);
    const res = await duplicateArticle(id);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || "Failed to clone article");
    }
    setBusyId(null);
  }

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Articles CRUD</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your publication stories. Create, edit, toggle flags, publish, or duplicate with one click.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-surface-elevated shadow-xs transition-colors hover:bg-primary-hover"
        >
          <Icon name="sparkles" className="size-3.5" />
          Create New Article
        </Link>
      </div>

      {/* Filter tabs and search bar */}
      <div className="flex flex-col gap-3">
        {/* Status tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedStatus === st
                  ? "bg-primary text-surface-elevated shadow-xs"
                  : "border border-border bg-surface-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              {st === "ALL" ? "All Stories" : st.charAt(0) + st.slice(1).toLowerCase()} ({statusCounts[st]})
            </button>
          ))}
        </div>

        {/* Search & Topic dropdown */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="max-w-md flex-1">
            <input
              type="text"
              placeholder="Search by title, author, or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface-elevated px-3.5 text-xs text-text-primary shadow-2xs transition-colors hover:border-text-muted/40 focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="h-10 rounded-xl border border-border bg-surface-elevated px-3 text-xs text-text-primary shadow-2xs focus:border-primary focus:outline-none"
          >
            <option value="">All Categories</option>
            {topics.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-background/50 font-semibold text-text-muted uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  onClick={() => toggleSort("title")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Article</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "title" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("topic")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "topic" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("authorName")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Author</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "authorName" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("status")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "status" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-3.5">Editorial Flags</th>
                <th
                  onClick={() => toggleSort("viewsCount")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Views</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "viewsCount" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("publishedAt")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Published</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "publishedAt" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-text-muted">
                    No articles found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-background/40">
                    <td className="max-w-xs px-6 py-4">
                      <Link
                        href={`/en/articles/${a.slug}`}
                        target="_blank"
                        className="font-semibold text-text-primary hover:text-primary line-clamp-2"
                      >
                        {a.title}
                      </Link>
                      <p className="mt-0.5 text-[11px] font-mono text-text-muted">/{a.slug}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-block rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                        {a.topic.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-medium text-text-secondary">
                      {a.authorName}
                    </td>

                    {/* Interactive 1-click status pill */}
                    <td className="px-6 py-4">
                      <button
                        disabled={busyId === a.id}
                        onClick={() => handleStatusToggle(a.id, a.status)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-80 disabled:opacity-50 ${
                          a.status === "PUBLISHED"
                            ? "bg-success/15 text-success"
                            : a.status === "DRAFT"
                            ? "bg-warning/15 text-warning"
                            : "bg-surface text-text-muted border border-border"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            a.status === "PUBLISHED" ? "bg-success" : "bg-warning"
                          }`}
                        />
                        {a.status}
                      </button>
                    </td>

                    {/* Interactive 1-click editorial flag buttons */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <button
                          disabled={busyId === a.id}
                          onClick={() => handleFlagToggle(a.id, "featured")}
                          title="Click to toggle Featured status"
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold transition-colors ${
                            a.featured
                              ? "bg-accent text-surface-elevated"
                              : "border border-border text-text-muted hover:border-text-primary"
                          }`}
                        >
                          Featured
                        </button>

                        <button
                          disabled={busyId === a.id}
                          onClick={() => handleFlagToggle(a.id, "editorsPick")}
                          title="Click to toggle Editor's Pick"
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold transition-colors ${
                            a.editorsPick
                              ? "bg-primary text-surface-elevated"
                              : "border border-border text-text-muted hover:border-text-primary"
                          }`}
                        >
                          Pick
                        </button>

                        <button
                          disabled={busyId === a.id}
                          onClick={() => handleFlagToggle(a.id, "trending")}
                          title="Click to toggle Trending"
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold transition-colors ${
                            a.trending
                              ? "bg-accent-secondary text-surface-elevated"
                              : "border border-border text-text-muted hover:border-text-primary"
                          }`}
                        >
                          Trending
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-text-secondary">
                      {a.viewsCount}
                    </td>

                    <td className="px-6 py-4 text-text-muted">
                      {formatDate(new Date(a.publishedAt).toISOString())}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/en/articles/${a.slug}`}
                          target="_blank"
                          title="Preview Live"
                          className="rounded-lg border border-border px-2 py-1 text-xs font-semibold text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/articles/${a.id}/edit`}
                          title="Edit Article"
                          className="rounded-lg border border-border px-2 py-1 text-xs font-semibold text-text-primary transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          Edit
                        </Link>
                        <button
                          disabled={busyId === a.id}
                          onClick={() => handleDuplicate(a.id)}
                          title="Duplicate Article as Draft"
                          className="rounded-lg border border-border px-2 py-1 text-xs font-semibold text-text-secondary transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
                        >
                          Clone
                        </button>
                        <button
                          disabled={busyId === a.id}
                          onClick={() => handleDelete(a.id, a.title)}
                          title="Delete Article"
                          className="rounded-lg border border-error/30 px-2 py-1 text-xs font-semibold text-error transition-colors hover:bg-error/10 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          rangeText={rangeText}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}
