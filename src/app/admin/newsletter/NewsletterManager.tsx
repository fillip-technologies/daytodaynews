"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteIssue, saveIssue, sendIssue, sendTestIssue } from "@/actions/newsletter-admin";
import {
  inputClass,
  labelClass,
  NoticeBox,
  primaryButtonClass,
  secondaryButtonClass,
  type Notice,
} from "@/components/admin/fields";

type Issue = {
  id: string;
  subject: string;
  intro: string;
  articleSlugs: string[];
  sponsorName: string;
  sponsorText: string;
  sponsorUrl: string;
  sentAt: string | null;
  recipients: number;
  failed: number;
  createdAt: string;
};

type Draft = Omit<Issue, "id" | "sentAt" | "recipients" | "failed" | "createdAt">;

const emptyDraft: Draft = { subject: "", intro: "", articleSlugs: [], sponsorName: "", sponsorText: "", sponsorUrl: "" };

export function NewsletterManager({
  issues,
  articles,
  activeSubscribers,
  totalSubscribers,
  isAdmin,
}: {
  issues: Issue[];
  articles: Array<{ slug: string; title: string; date: string }>;
  activeSubscribers: number;
  totalSubscribers: number;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const titleOf = new Map(articles.map((a) => [a.slug, a.title]));
  const matches = query.trim()
    ? articles.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()) && !draft?.articleSlugs.includes(a.slug)).slice(0, 8)
    : [];

  async function save(): Promise<string | null> {
    if (!draft) return null;
    setBusy(true);
    const res = await saveIssue(editingId, draft);
    setBusy(false);
    if (!res.success || !res.id) {
      setNotice({ kind: "error", text: res.error ?? "Failed to save." });
      return null;
    }
    setEditingId(res.id);
    setNotice({ kind: "success", text: "Issue saved." });
    router.refresh();
    return res.id;
  }

  async function test() {
    const id = await save();
    if (!id) return;
    setBusy(true);
    const res = await sendTestIssue(id, testEmail);
    setBusy(false);
    setNotice(res.success ? { kind: "success", text: `Test sent to ${testEmail}.` } : { kind: "error", text: res.error ?? "Failed." });
  }

  async function sendAll() {
    const id = await save();
    if (!id) return;
    if (!confirm(`Send "${draft?.subject}" to ${activeSubscribers} active subscribers now? This can't be undone.`)) return;
    setBusy(true);
    const res = await sendIssue(id);
    setBusy(false);
    if (!res.success) {
      setNotice({ kind: "error", text: res.error ?? "Failed." });
      return;
    }
    setNotice({ kind: "success", text: `Sent to ${res.sent} subscribers${res.failed ? `, ${res.failed} failed` : ""}.` });
    setDraft(null);
    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Newsletter</h1>
          <p className="mt-1 max-w-3xl text-sm text-text-secondary">
            The weekly brief (plan target: one issue a week, 12 in 90 days). Pick this week&apos;s articles, add a short
            introduction and, if sold, a sponsor (labelled &quot;Sponsored&quot;). Every email has a one-click unsubscribe link.
          </p>
          <p className="mt-2 text-xs font-semibold text-text-primary">
            {activeSubscribers} active subscribers · {totalSubscribers} total
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* A file download (CSV), not a page: a plain link is right here. */}
          <a href="/admin/newsletter/export" download className={secondaryButtonClass}>
            Export subscribers (CSV)
          </a>
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setDraft(emptyDraft);
            }}
            className={primaryButtonClass}
          >
            + New issue
          </button>
        </div>
      </div>

      <NoticeBox notice={notice} />

      {draft && (
        <section className="space-y-4 rounded-2xl border border-primary/30 bg-surface-elevated p-5 shadow-md">
          <label className="block">
            <span className={labelClass}>Subject</span>
            <input
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              placeholder="This week: AI agents vs chatbots, MVP costs and more"
              className={`${inputClass} h-10`}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Introduction</span>
            <textarea
              rows={4}
              value={draft.intro}
              onChange={(e) => setDraft({ ...draft, intro: e.target.value })}
              className={`${inputClass} py-2 leading-relaxed`}
            />
          </label>

          <div>
            <span className={labelClass}>Articles (in order)</span>
            <ol className="mt-2 space-y-1.5">
              {draft.articleSlugs.map((slug, index) => (
                <li key={slug} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs">
                  <span className="truncate">
                    {index + 1}. {titleOf.get(slug) ?? `${slug} (not live)`}
                  </span>
                  <span className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        const next = [...draft.articleSlugs];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        setDraft({ ...draft, articleSlugs: next });
                      }}
                      className="text-text-muted disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, articleSlugs: draft.articleSlugs.filter((s) => s !== slug) })}
                      className="text-error"
                    >
                      ✕
                    </button>
                  </span>
                </li>
              ))}
            </ol>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search published articles to add…"
              className={`${inputClass} h-9`}
            />
            {matches.length > 0 && (
              <ul className="mt-1 max-h-60 divide-y divide-border overflow-y-auto rounded-lg border border-border bg-background">
                {matches.map((a) => (
                  <li key={a.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft({ ...draft, articleSlugs: [...draft.articleSlugs, a.slug].slice(0, 12) });
                        setQuery("");
                      }}
                      className="flex w-full justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-primary/5"
                    >
                      <span className="truncate">{a.title}</span>
                      <span className="shrink-0 text-text-muted">{a.date} · + Add</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-warning/40 bg-warning/5 p-4">
            <p className="text-xs font-semibold text-text-primary">Sponsor (optional, shown as &quot;Sponsored&quot;)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Sponsor name</span>
                <input
                  value={draft.sponsorName}
                  onChange={(e) => setDraft({ ...draft, sponsorName: e.target.value })}
                  className={`${inputClass} h-10`}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Sponsor link (https://)</span>
                <input
                  value={draft.sponsorUrl}
                  onChange={(e) => setDraft({ ...draft, sponsorUrl: e.target.value })}
                  className={`${inputClass} h-10`}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClass}>Sponsor message</span>
                <textarea
                  rows={2}
                  value={draft.sponsorText}
                  onChange={(e) => setDraft({ ...draft, sponsorText: e.target.value })}
                  className={`${inputClass} py-2`}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <button type="button" onClick={save} disabled={busy} className={secondaryButtonClass}>
              Save draft
            </button>
            <label className="block">
              <span className={labelClass}>Send a test to</span>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="you@company.com"
                className={`${inputClass} mt-0 h-9 w-56`}
              />
            </label>
            <button type="button" onClick={test} disabled={busy || !testEmail} className={secondaryButtonClass}>
              Send test
            </button>
            {isAdmin && (
              <button type="button" onClick={sendAll} disabled={busy} className={primaryButtonClass}>
                {busy ? "Working…" : `Send to ${activeSubscribers} subscribers`}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setEditingId(null);
              }}
              className="text-xs font-semibold text-text-muted"
            >
              Close
            </button>
          </div>
          {!isAdmin && <p className="text-[11px] text-text-muted">Only administrators can send to all subscribers.</p>}
          <p className="text-[11px] text-text-muted">
            Emails go through the site&apos;s SMTP account (MAIL_* settings). Gmail allows about 500 emails a day; for larger
            lists use a sending service (or export the CSV to Brevo / Mailchimp).
          </p>
        </section>
      )}

      <div className="rounded-2xl border border-border bg-surface-elevated shadow-2xs">
        {issues.length === 0 ? (
          <p className="p-8 text-center text-xs text-text-muted">No issues yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {issues.map((issue) => (
              <li key={issue.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">{issue.subject}</p>
                  <p className="mt-0.5 text-text-muted">
                    {issue.sentAt
                      ? `Sent ${new Date(issue.sentAt).toLocaleString()} · ${issue.recipients} delivered${issue.failed ? ` · ${issue.failed} failed` : ""}`
                      : `Draft · ${issue.articleSlugs.length} articles`}
                    {issue.sponsorName && ` · Sponsor: ${issue.sponsorName}`}
                  </p>
                </div>
                {!issue.sentAt && (
                  <span className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(issue.id);
                        setDraft({
                          subject: issue.subject,
                          intro: issue.intro,
                          articleSlugs: issue.articleSlugs,
                          sponsorName: issue.sponsorName,
                          sponsorText: issue.sponsorText,
                          sponsorUrl: issue.sponsorUrl,
                        });
                      }}
                      className="font-semibold text-primary"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm("Delete this draft?")) return;
                        await deleteIssue(issue.id);
                        router.refresh();
                      }}
                      className="font-semibold text-error"
                    >
                      Delete
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
