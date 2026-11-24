"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteRedirect, saveRedirect } from "@/actions/redirects";
import {
  inputClass,
  labelClass,
  NoticeBox,
  primaryButtonClass,
  secondaryButtonClass,
  type Notice,
} from "@/components/admin/fields";

type RedirectRow = { id: string; fromPath: string; toPath: string; note: string; hits: number; createdAt: string };

const empty = { fromPath: "", toPath: "", note: "" };

export function RedirectsManager({ initial }: { initial: RedirectRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [query, setQuery] = useState("");

  const rows = initial.filter(
    (r) => !query || r.fromPath.includes(query.toLowerCase()) || r.toPath.toLowerCase().includes(query.toLowerCase()),
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await saveRedirect(editing, form);
    setBusy(false);
    if (!res.success) {
      setNotice({ kind: "error", text: res.error ?? "Failed to save." });
      return;
    }
    setNotice({ kind: "success", text: "Redirect saved. The old address now sends readers and Google to the new one." });
    setEditing(null);
    setForm(empty);
    router.refresh();
  }

  async function remove(row: RedirectRow) {
    if (!confirm(`Delete the redirect from ${row.fromPath}?`)) return;
    const res = await deleteRedirect(row.id);
    if (!res.success) setNotice({ kind: "error", text: res.error ?? "Failed to delete." });
    else router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Redirects</h1>
        <p className="mt-1 max-w-3xl text-sm text-text-secondary">
          Permanent (301) redirects. Use them when you merge two overlapping articles (redirect the weaker one to the
          stronger one, then archive it), or remove a page. Changing an article&apos;s or category&apos;s slug adds one
          automatically. Paths work in every language: <code>/articles/old</code> also covers <code>/hi/articles/old</code>.
        </p>
      </div>

      <NoticeBox notice={notice} />

      <form onSubmit={save} className="grid gap-4 rounded-2xl border border-border bg-surface-elevated p-5 shadow-2xs md:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="block">
          <span className={labelClass}>Old address</span>
          <input
            required
            value={form.fromPath}
            onChange={(e) => setForm({ ...form, fromPath: e.target.value })}
            placeholder="/articles/n8n-automation-use-cases-architecture-costs"
            className={`${inputClass} h-10 font-mono`}
          />
        </label>
        <label className="block">
          <span className={labelClass}>New address</span>
          <input
            required
            value={form.toPath}
            onChange={(e) => setForm({ ...form, toPath: e.target.value })}
            placeholder="/articles/n8n-ai-workflow-automation"
            className={`${inputClass} h-10 font-mono`}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Note (optional)</span>
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Merged duplicate n8n articles"
            className={`${inputClass} h-10`}
          />
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? "Saving…" : editing ? "Save" : "Add redirect"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="rounded-2xl border border-border bg-surface-elevated shadow-2xs">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <p className="text-xs font-semibold text-text-secondary">{initial.length} redirects</p>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search paths…"
            className={`${inputClass} mt-0 h-9 max-w-xs`}
          />
        </div>
        {rows.length === 0 ? (
          <p className="p-6 text-center text-xs text-text-muted">No redirects yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background text-[11px] uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-4 py-3">Old address</th>
                  <th className="px-4 py-3">New address</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3 text-right">Hits</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-mono text-text-primary">{row.fromPath}</td>
                    <td className="px-4 py-3 font-mono text-text-secondary">→ {row.toPath}</td>
                    <td className="px-4 py-3 text-text-muted">{row.note}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.hits}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(row.id);
                          setForm({ fromPath: row.fromPath, toPath: row.toPath, note: row.note });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="font-semibold text-primary hover:text-text-primary"
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => remove(row)} className="ml-3 font-semibold text-error hover:opacity-80">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
