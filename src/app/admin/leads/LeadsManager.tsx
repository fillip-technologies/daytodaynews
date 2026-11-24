"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLead, saveIntegrations, setLeadStatus, testLeadWebhook } from "@/actions/admin-leads";
import {
  inputClass,
  labelClass,
  NoticeBox,
  primaryButtonClass,
  secondaryButtonClass,
  type Notice,
} from "@/components/admin/fields";
import { cn } from "@/lib/cn";

type LeadRow = {
  id: string;
  type: string;
  status: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  website: string | null;
  interest: string | null;
  budget: string | null;
  message: string;
  sourcePath: string | null;
  listing: string | null;
  createdAt: string;
};

const STATUSES = ["NEW", "CONTACTED", "FORWARDED", "WON", "CLOSED"];
const TYPE_LABEL: Record<string, string> = { ADVERTISING: "Advertising", LISTING_ENQUIRY: "Directory enquiry" };
const statusTone: Record<string, string> = {
  NEW: "bg-primary/15 text-primary",
  CONTACTED: "bg-accent-secondary/15 text-accent-secondary",
  FORWARDED: "bg-accent/15 text-accent",
  WON: "bg-success/15 text-success",
  CLOSED: "bg-surface text-text-muted border border-border",
};

export function LeadsManager({ initial, webhookUrl, isAdmin }: { initial: LeadRow[]; webhookUrl: string; isAdmin: boolean }) {
  const router = useRouter();
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [open, setOpen] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [webhook, setWebhook] = useState(webhookUrl);
  const [busy, setBusy] = useState(false);

  const rows = initial.filter((l) => (type === "ALL" || l.type === type) && (status === "ALL" || l.status === status));
  const counts = {
    ALL: initial.length,
    ADVERTISING: initial.filter((l) => l.type === "ADVERTISING").length,
    LISTING_ENQUIRY: initial.filter((l) => l.type === "LISTING_ENQUIRY").length,
  };

  async function changeStatus(id: string, next: string) {
    const res = await setLeadStatus(id, next);
    if (!res.success) setNotice({ kind: "error", text: res.error ?? "Failed." });
    router.refresh();
  }

  async function remove(lead: LeadRow) {
    if (!confirm(`Delete the lead from ${lead.name}?`)) return;
    const res = await deleteLead(lead.id);
    if (!res.success) setNotice({ kind: "error", text: res.error ?? "Failed." });
    router.refresh();
  }

  async function saveWebhook() {
    setBusy(true);
    const res = await saveIntegrations({ leadWebhookUrl: webhook });
    setBusy(false);
    setNotice(res.success ? { kind: "success", text: "CRM webhook saved." } : { kind: "error", text: res.error ?? "Failed." });
  }

  async function testWebhook() {
    setBusy(true);
    const res = await testLeadWebhook();
    setBusy(false);
    setNotice(
      res.success
        ? { kind: "success", text: "A test lead was sent to the webhook. Check your CRM or automation tool." }
        : { kind: "error", text: res.error ?? "Test failed." },
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Leads</h1>
        <p className="mt-1 max-w-3xl text-sm text-text-secondary">
          Advertising enquiries from the Advertise page and reader enquiries to directory listings. Directory enquiries
          are emailed to the company automatically when its listing has an email. &quot;Came from&quot; shows the page
          the visitor was reading (lead attribution). Contact messages and guest-post pitches stay in the Inbox.
        </p>
      </div>

      <NoticeBox notice={notice} />

      <div className="flex flex-wrap gap-2">
        {(["ALL", "ADVERTISING", "LISTING_ENQUIRY"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setType(key)}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-semibold",
              type === key ? "bg-primary text-surface-elevated" : "border border-border bg-surface-elevated text-text-secondary",
            )}
          >
            {key === "ALL" ? "All" : TYPE_LABEL[key]} ({counts[key]})
          </button>
        ))}
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} mt-0 h-8 w-auto`} aria-label="Status">
          <option value="ALL">Any status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-surface-elevated shadow-2xs">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-xs text-text-muted">No leads yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((lead) => (
              <li key={lead.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button type="button" onClick={() => setOpen(open === lead.id ? null : lead.id)} className="min-w-0 text-left">
                    <p className="text-sm font-semibold text-text-primary">
                      {lead.name}
                      {lead.company && <span className="font-normal text-text-secondary"> · {lead.company}</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {TYPE_LABEL[lead.type] ?? lead.type}
                      {lead.listing && <> for <strong className="text-text-secondary">{lead.listing}</strong></>}
                      {lead.interest && <> · {lead.interest}</>} · {new Date(lead.createdAt).toLocaleString()}
                    </p>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", statusTone[lead.status])}>
                      {lead.status}
                    </span>
                    <select
                      value={lead.status}
                      onChange={(e) => changeStatus(lead.id, e.target.value)}
                      className={`${inputClass} mt-0 h-8 w-auto`}
                      aria-label={`Status of ${lead.name}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0) + s.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {open === lead.id && (
                  <div className="mt-3 space-y-2 rounded-xl bg-background p-4 text-xs text-text-secondary">
                    <p>
                      <strong className="text-text-primary">Email:</strong>{" "}
                      <a href={`mailto:${lead.email}`} className="text-primary underline">
                        {lead.email}
                      </a>
                      {lead.phone && <> · <strong className="text-text-primary">Phone:</strong> {lead.phone}</>}
                    </p>
                    {lead.website && (
                      <p>
                        <strong className="text-text-primary">Website:</strong> {lead.website}
                      </p>
                    )}
                    {lead.budget && (
                      <p>
                        <strong className="text-text-primary">Budget:</strong> {lead.budget}
                      </p>
                    )}
                    {lead.sourcePath && (
                      <p>
                        <strong className="text-text-primary">Came from:</strong>{" "}
                        <a href={lead.sourcePath} target="_blank" rel="noopener noreferrer" className="font-mono text-primary underline">
                          {lead.sourcePath}
                        </a>
                      </p>
                    )}
                    <p className="whitespace-pre-wrap rounded-lg border border-border bg-surface-elevated p-3 text-text-primary">{lead.message}</p>
                    <div className="flex gap-3">
                      <a href={`mailto:${lead.email}`} className={secondaryButtonClass}>
                        Reply by email
                      </a>
                      <button type="button" onClick={() => remove(lead)} className="text-xs font-semibold text-error">
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-2xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">CRM integration</h2>
        <p className="mt-1 max-w-3xl text-xs text-text-secondary">
          Every new lead, directory submission, guest-post pitch and contact message is sent as JSON to this webhook, so
          HubSpot, Zoho, Pipedrive, a Google Sheet or an n8n / Zapier / Make flow can receive it. Leave empty to turn it off.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="block flex-1">
            <span className={labelClass}>Webhook URL (https://)</span>
            <input
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              disabled={!isAdmin}
              placeholder="https://hooks.zapier.com/hooks/catch/…"
              className={`${inputClass} h-10 font-mono`}
            />
          </label>
          {isAdmin && (
            <div className="flex items-end gap-2">
              <button type="button" onClick={saveWebhook} disabled={busy} className={primaryButtonClass}>
                Save
              </button>
              <button type="button" onClick={testWebhook} disabled={busy || !webhookUrl} className={secondaryButtonClass}>
                Send test
              </button>
            </div>
          )}
        </div>
        {!isAdmin && <p className="mt-2 text-[11px] text-text-muted">Only administrators can change the integration.</p>}
      </section>
    </div>
  );
}
