"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePlanItem, importPdfPlan, savePlanItem, setPlanStatus } from "@/actions/plan";
import {
  inputClass,
  labelClass,
  NoticeBox,
  primaryButtonClass,
  secondaryButtonClass,
  type Notice,
} from "@/components/admin/fields";
import { cn } from "@/lib/cn";
import { planChecklist } from "@/lib/plan-data";

type Item = {
  id: string;
  number: number | null;
  kind: string;
  title: string;
  focusKeyword: string;
  secondaryKeywords: string;
  category: string;
  wordTarget: string;
  month: string;
  dueDate: string;
  writerId: string;
  editorId: string;
  status: string;
  articleSlug: string;
  metaTitle: string;
  metaDescription: string;
  notes: string;
  checklist: string[];
};

type Option = { value: string; label: string };

const STATUSES = ["IDEA", "ASSIGNED", "WRITING", "REVIEW", "SCHEDULED", "PUBLISHED"];
const statusLabel: Record<string, string> = {
  IDEA: "Idea",
  ASSIGNED: "Assigned",
  WRITING: "Writing",
  REVIEW: "In review",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
};
const statusTone: Record<string, string> = {
  IDEA: "text-text-muted",
  ASSIGNED: "text-accent-secondary",
  WRITING: "text-primary",
  REVIEW: "text-warning",
  SCHEDULED: "text-accent",
  PUBLISHED: "text-success",
};
const MONTHS: Record<string, string> = {
  "1": "Month 1 · 10 Nov – 9 Dec 2026 · Build topical authority (AI & automation)",
  "2": "Month 2 · 10 Dec 2026 – 9 Jan 2027 · Software, SaaS & startup authority",
  "3": "Month 3 · 10 Jan – 7 Feb 2027 · Commercial discovery, industry & global reach",
  "": "Other items",
};

/** A plan row's editable fields (everything but its id). */
function withoutId(item: Item): Omit<Item, "id"> {
  const copy: Partial<Item> = { ...item };
  delete copy.id;
  return copy as Omit<Item, "id">;
}

const emptyItem: Omit<Item, "id"> = {
  number: null,
  kind: "NEW",
  title: "",
  focusKeyword: "",
  secondaryKeywords: "",
  category: "",
  wordTarget: "",
  month: "",
  dueDate: "",
  writerId: "",
  editorId: "",
  status: "IDEA",
  articleSlug: "",
  metaTitle: "",
  metaDescription: "",
  notes: "",
  checklist: [],
};

export function PlanManager({
  items,
  staff,
  articleState,
  pipelines,
}: {
  items: Item[];
  staff: Option[];
  articleState: Record<string, string>;
  pipelines: { pitches: number; pendingListings: number };
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Item, "id"> | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [filter, setFilter] = useState("ALL");

  const nameOf = new Map(staff.map((s) => [s.value, s.label]));
  const shown = items.filter((i) => filter === "ALL" || i.status === filter);
  const groups = ["1", "2", "3", ""].map((month) => ({ month, rows: shown.filter((i) => i.month === month) })).filter((g) => g.rows.length);
  const published = items.filter((i) => i.status === "PUBLISHED").length;
  const today = new Date().toISOString().slice(0, 10);

  async function runImport() {
    setBusy(true);
    const res = await importPdfPlan();
    setBusy(false);
    setNotice(res.success ? { kind: "success", text: `${res.added} plan items added.` } : { kind: "error", text: res.error ?? "Failed." });
    router.refresh();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    const res = await savePlanItem(editing, form);
    setBusy(false);
    if (!res.success) {
      setNotice({ kind: "error", text: res.error ?? "Failed." });
      return;
    }
    setNotice({ kind: "success", text: "Saved." });
    setForm(null);
    setEditing(null);
    router.refresh();
  }

  const field = (key: keyof Omit<Item, "id" | "checklist" | "number">, label: string, props: { placeholder?: string; type?: string } = {}) =>
    form && (
      <label className="block">
        <span className={labelClass}>{label}</span>
        <input
          type={props.type ?? "text"}
          value={form[key]}
          placeholder={props.placeholder}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className={`${inputClass} h-10`}
        />
      </label>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Editorial Plan</h1>
          <p className="mt-1 max-w-3xl text-sm text-text-secondary">
            The 90-day plan (10 Nov 2026 – 7 Feb 2027): 36 core articles, three a week, plus 8–12 refreshes. Rows marked{" "}
            <strong>Refresh</strong> already have an article on the site: update and consolidate it instead of publishing a
            duplicate. Keywords are proposals; check their volume in Search Console, Ahrefs or Semrush before writing.
          </p>
          <p className="mt-2 text-xs font-semibold text-text-primary">
            {published} / {items.length} published
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={runImport} disabled={busy} className={secondaryButtonClass}>
            {items.length ? "Add missing plan items" : "Import the 90-day plan"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm(emptyItem);
            }}
            className={primaryButtonClass}
          >
            + Add item
          </button>
        </div>
      </div>

      <NoticeBox notice={notice} />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface-elevated p-4 text-xs">
          <p className="font-semibold uppercase tracking-wider text-text-muted">Weekly targets</p>
          <p className="mt-2 text-text-secondary">
            3 new articles · 1–2 updates · 20 contributor, 10 partnership and 20 listing outreach · 9–12 social posts · 1
            newsletter · 1 technical SEO review.
          </p>
        </div>
        <Link href="/admin/inbox" className="rounded-xl border border-border bg-surface-elevated p-4 text-xs hover:border-primary/40">
          <p className="font-semibold uppercase tracking-wider text-text-muted">Guest-post pipeline</p>
          <p className="mt-2 text-lg font-bold text-text-primary">{pipelines.pitches} pending pitches</p>
        </Link>
        <Link href="/admin/directory" className="rounded-xl border border-border bg-surface-elevated p-4 text-xs hover:border-primary/40">
          <p className="font-semibold uppercase tracking-wider text-text-muted">Business listing pipeline</p>
          <p className="mt-2 text-lg font-bold text-text-primary">{pipelines.pendingListings} listings to review</p>
        </Link>
      </div>

      {form && (
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-primary/30 bg-surface-elevated p-5 shadow-md">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">{editing ? "Edit plan item" : "New plan item"}</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-3">{field("title", "Title")}</div>
            <label className="block">
              <span className={labelClass}>Type</span>
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={`${inputClass} h-10`}>
                <option value="NEW">New article</option>
                <option value="REFRESH">Refresh existing</option>
              </select>
            </label>
            {field("focusKeyword", "Focus keyword")}
            <div className="sm:col-span-3">{field("secondaryKeywords", "Secondary keywords (comma separated)")}</div>
            {field("category", "Category")}
            {field("wordTarget", "Word target", { type: "number" })}
            <label className="block">
              <span className={labelClass}>Month</span>
              <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className={`${inputClass} h-10`}>
                <option value="">—</option>
                <option value="1">Month 1</option>
                <option value="2">Month 2</option>
                <option value="3">Month 3</option>
              </select>
            </label>
            {field("dueDate", "Publish by", { type: "date" })}
            <label className="block">
              <span className={labelClass}>Writer</span>
              <select value={form.writerId} onChange={(e) => setForm({ ...form, writerId: e.target.value })} className={`${inputClass} h-10`}>
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Editor</span>
              <select value={form.editorId} onChange={(e) => setForm({ ...form, editorId: e.target.value })} className={`${inputClass} h-10`}>
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={`${inputClass} h-10`}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel[s]}
                  </option>
                ))}
              </select>
            </label>
            {field("articleSlug", "Article slug (once created)", { placeholder: "ai-workflow-automation" })}
            <div className="sm:col-span-2">{field("metaTitle", "SEO title (draft)")}</div>
            <div className="sm:col-span-2">{field("metaDescription", "Meta description (draft)")}</div>
            <label className="block sm:col-span-4">
              <span className={labelClass}>Notes, outline & internal links to add</span>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputClass} py-2`} />
            </label>
          </div>
          <fieldset>
            <legend className={labelClass}>Checklist (plan section 5)</legend>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-4">
              {planChecklist.map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-xs text-text-secondary">
                  <input
                    type="checkbox"
                    checked={form.checklist.includes(key)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        checklist: e.target.checked ? [...form.checklist, key] : form.checklist.filter((k) => k !== key),
                      })
                    }
                    className="size-3.5 accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className={primaryButtonClass}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(null);
                setEditing(null);
              }}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
            {editing && (
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Delete this plan item?")) return;
                  await deletePlanItem(editing);
                  setForm(null);
                  setEditing(null);
                  router.refresh();
                }}
                className="ml-auto text-xs font-semibold text-error"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {["ALL", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold",
              filter === s ? "bg-primary text-surface-elevated" : "border border-border bg-surface-elevated text-text-secondary",
            )}
          >
            {s === "ALL" ? "All" : statusLabel[s]} ({s === "ALL" ? items.length : items.filter((i) => i.status === s).length})
          </button>
        ))}
      </div>

      {items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-text-muted">
          The plan is empty. Click &quot;Import the 90-day plan&quot; to add the 36 articles from the PDF.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.month} className="overflow-x-auto rounded-2xl border border-border bg-surface-elevated shadow-2xs">
          <h2 className="border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-primary">{MONTHS[group.month]}</h2>
          <table className="w-full min-w-[56rem] text-left text-xs">
            <thead className="bg-background text-[10px] uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Article</th>
                <th className="px-3 py-2">Words</th>
                <th className="px-3 py-2">Publish by</th>
                <th className="px-3 py-2">Writer / editor</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Checklist</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {group.rows.map((item) => {
                const overdue = item.dueDate && item.dueDate < today && item.status !== "PUBLISHED";
                return (
                  <tr key={item.id} className="align-top">
                    <td className="px-3 py-3 tabular-nums text-text-muted">{item.number}</td>
                    <td className="max-w-md px-3 py-3">
                      <p className="font-semibold text-text-primary">
                        {item.kind === "REFRESH" && (
                          <span className="mr-1.5 rounded bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent">Refresh</span>
                        )}
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-text-muted">
                        {item.focusKeyword && <>🔑 {item.focusKeyword} · </>}
                        {item.category}
                      </p>
                      {item.articleSlug && (
                        <p className="mt-1">
                          <a href={`/en/articles/${item.articleSlug}`} target="_blank" rel="noopener noreferrer" className="font-mono text-primary">
                            /{item.articleSlug}
                          </a>{" "}
                          <span className="text-text-muted">· {articleState[item.articleSlug] ?? "not created yet"}</span>
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 tabular-nums">{item.wordTarget}</td>
                    <td className={cn("px-3 py-3 whitespace-nowrap", overdue && "font-semibold text-error")}>{item.dueDate}</td>
                    <td className="px-3 py-3 text-text-secondary">
                      {nameOf.get(item.writerId) ?? "—"}
                      <br />
                      <span className="text-text-muted">{nameOf.get(item.editorId) ?? "—"}</span>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={item.status}
                        onChange={async (e) => {
                          await setPlanStatus(item.id, e.target.value);
                          router.refresh();
                        }}
                        className={cn(inputClass, "mt-0 h-8 w-auto font-semibold", statusTone[item.status])}
                        aria-label={`Status of ${item.title}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-text-muted">
                      {item.checklist.length}/{planChecklist.length}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(item.id);
                          setForm(withoutId(item));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="font-semibold text-primary"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
