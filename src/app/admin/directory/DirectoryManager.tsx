"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteListing, saveListing, setListingStatus, setListingTier } from "@/actions/admin-directory";
import {
  inputClass,
  labelClass,
  NoticeBox,
  primaryButtonClass,
  secondaryButtonClass,
  type Notice,
} from "@/components/admin/fields";
import { cn } from "@/lib/cn";
import {
  directoryKindLabel,
  fieldLabel,
  fieldsFor,
  listingKinds,
  listingPath,
  suggestedCategories,
  type ListingFieldKey,
  type ListingKind,
} from "@/lib/directory-config";

type ListingRow = {
  id: string;
  kind: ListingKind;
  slug: string;
  name: string;
  status: string;
  tier: string;
  category: string | null;
  country: string | null;
  email: string | null;
  website: string | null;
  submitterName: string | null;
  adminNotes: string | null;
  createdAt: string;
  leads: number;
} & Partial<Record<ListingFieldKey, string | number | null>>;

type FormState = Record<string, string> & { kind: string; slug: string; tier: string; status: string; adminNotes: string };

const blankForm = (kind: ListingKind): FormState => ({ kind, slug: "", tier: "BASIC", status: "APPROVED", adminNotes: "" });

const statusTone: Record<string, string> = {
  PENDING: "bg-warning/15 text-warning",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-surface text-text-muted border border-border",
};

export function DirectoryManager({ initial }: { initial: ListingRow[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<"ALL" | ListingKind>("ALL");
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);

  const q = query.trim().toLowerCase();
  const rows = initial.filter(
    (l) =>
      (kind === "ALL" || l.kind === kind) &&
      (status === "ALL" || l.status === status) &&
      (!q || l.name.toLowerCase().includes(q) || (l.category ?? "").toLowerCase().includes(q)),
  );
  const pending = initial.filter((l) => l.status === "PENDING").length;

  function openNew(k: ListingKind) {
    setEditingId(null);
    setForm(blankForm(k));
  }

  function openEdit(row: ListingRow) {
    const values: FormState = {
      kind: row.kind,
      slug: row.slug,
      tier: row.tier,
      status: row.status,
      adminNotes: row.adminNotes ?? "",
    };
    for (const field of fieldsFor(row.kind)) {
      const v = row[field.key];
      values[field.key] = v === null || v === undefined ? "" : String(v);
    }
    setEditingId(row.id);
    setForm(values);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    const res = await saveListing(editingId, form);
    setBusy(false);
    if (!res.success) {
      setNotice({ kind: "error", text: res.error ?? "Failed to save." });
      return;
    }
    setNotice({ kind: "success", text: "Listing saved." });
    setForm(null);
    setEditingId(null);
    router.refresh();
  }

  async function quick(action: () => Promise<{ success: boolean; error?: string }>) {
    const res = await action();
    if (!res.success) setNotice({ kind: "error", text: res.error ?? "Failed." });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Directory</h1>
          <p className="mt-1 max-w-3xl text-sm text-text-secondary">
            Business, software and startup listings. Submissions from the site arrive as <strong>Pending</strong>; approving
            one publishes it and emails the company. <strong>Verified</strong> = you checked the details.{" "}
            <strong>Featured</strong> = paid placement: shown first in its directory and labelled as paid.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {listingKinds.map((k) => (
            <button key={k} type="button" onClick={() => openNew(k)} className={secondaryButtonClass}>
              + {directoryKindLabel[k]}
            </button>
          ))}
        </div>
      </div>

      <NoticeBox notice={notice} />

      {form && (
        <form onSubmit={save} className="space-y-5 rounded-2xl border border-primary/30 bg-surface-elevated p-5 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              {editingId ? `Edit: ${form.name || "listing"}` : `New ${directoryKindLabel[form.kind as ListingKind]} listing`}
            </h2>
            {editingId && form.slug && (
              <a
                href={`/en${listingPath(form.kind as ListingKind, form.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-primary"
              >
                View page ↗
              </a>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <label className="block">
              <span className={labelClass}>Directory</span>
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={`${inputClass} h-10`}>
                {listingKinds.map((k) => (
                  <option key={k} value={k}>
                    {directoryKindLabel[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={`${inputClass} h-10`}>
                <option value="PENDING">Pending review</option>
                <option value="APPROVED">Approved (live)</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Listing type</span>
              <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className={`${inputClass} h-10`}>
                <option value="BASIC">Basic (free)</option>
                <option value="VERIFIED">Verified</option>
                <option value="FEATURED">Featured (paid, labelled)</option>
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Web address (slug)</span>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="from the name"
                className={`${inputClass} h-10 font-mono`}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {fieldsFor(form.kind as ListingKind).map((field) => {
              const value = form[field.key] ?? "";
              const set = (v: string) => setForm({ ...form, [field.key]: v });
              const label = fieldLabel(field, form.kind as ListingKind) + (field.required ? " *" : "");
              const wide = field.type === "text" || field.type === "lines";
              return (
                <label key={field.key} className={cn("block", wide && "sm:col-span-2")}>
                  <span className={labelClass}>{label}</span>
                  {wide ? (
                    <textarea
                      rows={field.type === "text" ? 5 : 3}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      className={`${inputClass} py-2 leading-relaxed`}
                    />
                  ) : (
                    <input
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      list={field.key === "category" ? `categories-${form.kind}` : undefined}
                      className={`${inputClass} h-10`}
                    />
                  )}
                  {field.hint && <span className="mt-1 block text-[11px] text-text-muted">{field.hint}</span>}
                </label>
              );
            })}
            <datalist id={`categories-${form.kind}`}>
              {suggestedCategories[form.kind as ListingKind].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Internal notes (not public)</span>
              <textarea
                rows={2}
                value={form.adminNotes}
                onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
                placeholder="e.g. Paid Featured until 31 Jan 2027; details checked on a call"
                className={`${inputClass} py-2`}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={busy} className={primaryButtonClass}>
              {busy ? "Saving…" : "Save listing"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(null);
                setEditingId(null);
              }}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {(["ALL", ...listingKinds] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-semibold",
              kind === k ? "bg-primary text-surface-elevated" : "border border-border bg-surface-elevated text-text-secondary",
            )}
          >
            {k === "ALL" ? "All" : directoryKindLabel[k]}
          </button>
        ))}
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} mt-0 h-8 w-auto`} aria-label="Status">
          <option value="ALL">Any status</option>
          <option value="PENDING">Pending ({pending})</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or category…"
          className={`${inputClass} mt-0 h-8 max-w-xs`}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface-elevated shadow-2xs">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-xs text-text-muted">No listings here yet.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-background text-[11px] uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Leads</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-text-primary">{row.name}</p>
                    <p className="text-text-muted">
                      {directoryKindLabel[row.kind]} · {row.category ?? "—"} · {row.country ?? "—"}
                      {row.submitterName && <> · from {row.submitterName}</>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", statusTone[row.status])}>
                      {row.status}
                    </span>
                    {row.status === "PENDING" && (
                      <span className="mt-2 flex gap-2">
                        <button type="button" onClick={() => quick(() => setListingStatus(row.id, "APPROVED"))} className="font-semibold text-success">
                          Approve
                        </button>
                        <button type="button" onClick={() => quick(() => setListingStatus(row.id, "REJECTED"))} className="font-semibold text-error">
                          Reject
                        </button>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.tier}
                      onChange={(e) => quick(() => setListingTier(row.id, e.target.value))}
                      className={`${inputClass} mt-0 h-8 w-auto`}
                      aria-label={`Listing type of ${row.name}`}
                    >
                      <option value="BASIC">Basic</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="FEATURED">Featured</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.leads}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button type="button" onClick={() => openEdit(row)} className="font-semibold text-primary">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete ${row.name}? Its page will stop working.`)) quick(() => deleteListing(row.id));
                      }}
                      className="ml-3 font-semibold text-error"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
