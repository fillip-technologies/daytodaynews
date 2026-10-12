"use client";

import { useState } from "react";
import {
  updateContactStatus,
  deleteContactSubmission,
  updatePitchStatus,
  deleteContributorPitch,
  deleteNewsletterSubscriber,
} from "@/actions/inbox";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import { useAdminDataTable } from "@/hooks/useAdminDataTable";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import type { SubmissionStatus, PitchStatus } from "@/generated/prisma";

type ContactItem = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: SubmissionStatus;
  createdAt: Date;
};

type PitchItem = {
  id: string;
  name: string;
  email: string;
  topic: string;
  portfolio: string | null;
  idea: string;
  message: string;
  status: PitchStatus;
  createdAt: Date;
};

type SubscriberItem = {
  id: string;
  email: string;
  status: string;
  subscribedAt: Date;
};

type InboxManagerProps = {
  contacts: ContactItem[];
  pitches: PitchItem[];
  subscribers: SubscriberItem[];
};

export function InboxManager({ contacts, pitches, subscribers }: InboxManagerProps) {
  const [activeTab, setActiveTab] = useState<"contacts" | "pitches" | "subscribers">("contacts");
  const [contactList, setContactList] = useState<ContactItem[]>(contacts);
  const [pitchList, setPitchList] = useState<PitchItem[]>(pitches);
  const [subscriberList, setSubscriberList] = useState<SubscriberItem[]>(subscribers);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [contactStatusFilter, setContactStatusFilter] = useState<string>("ALL");
  const [pitchStatusFilter, setPitchStatusFilter] = useState<string>("ALL");

  // Detail Modal State
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);
  const [selectedPitch, setSelectedPitch] = useState<PitchItem | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Contact Handlers
  async function handleContactStatusChange(id: string, status: SubmissionStatus) {
    await updateContactStatus(id, status);
    setContactList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    if (selectedContact && selectedContact.id === id) {
      setSelectedContact((prev) => prev ? { ...prev, status } : null);
    }
  }

  async function handleDeleteContact(id: string) {
    if (!confirm("Are you sure you want to delete this message?")) return;
    await deleteContactSubmission(id);
    setContactList((prev) => prev.filter((c) => c.id !== id));
    if (selectedContact?.id === id) setSelectedContact(null);
  }

  // Pitch Handlers
  async function handlePitchStatusChange(id: string, status: PitchStatus) {
    await updatePitchStatus(id, status);
    setPitchList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
    if (selectedPitch && selectedPitch.id === id) {
      setSelectedPitch((prev) => prev ? { ...prev, status } : null);
    }
  }

  async function handleDeletePitch(id: string) {
    if (!confirm("Are you sure you want to delete this pitch?")) return;
    await deleteContributorPitch(id);
    setPitchList((prev) => prev.filter((p) => p.id !== id));
    if (selectedPitch?.id === id) setSelectedPitch(null);
  }

  // Subscriber Handlers
  async function handleDeleteSubscriber(id: string) {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;
    await deleteNewsletterSubscriber(id);
    setSubscriberList((prev) => prev.filter((s) => s.id !== id));
  }

  function handleCopyEmail(email: string) {
    navigator.clipboard.writeText(email);
    setCopyFeedback(email);
    setTimeout(() => setCopyFeedback(null), 2000);
  }

  // Table 1: Contacts DataTable
  const contactsTable = useAdminDataTable<ContactItem>({
    data: contactList,
    initialPageSize: 10,
    searchQuery: activeTab === "contacts" ? search : "",
    searchFields: ["name", "email", "subject", "message"],
    filterKey: contactStatusFilter,
    filterFn: (c) => (contactStatusFilter === "ALL" ? true : c.status === contactStatusFilter),
    defaultSortKey: "createdAt",
    defaultSortOrder: "desc",
  });

  // Table 2: Pitches DataTable
  const pitchesTable = useAdminDataTable<PitchItem>({
    data: pitchList,
    initialPageSize: 10,
    searchQuery: activeTab === "pitches" ? search : "",
    searchFields: ["name", "email", "topic", "idea", "message"],
    filterKey: pitchStatusFilter,
    filterFn: (p) => (pitchStatusFilter === "ALL" ? true : p.status === pitchStatusFilter),
    defaultSortKey: "createdAt",
    defaultSortOrder: "desc",
  });

  // Table 3: Subscribers DataTable
  const subscribersTable = useAdminDataTable<SubscriberItem>({
    data: subscriberList,
    initialPageSize: 10,
    searchQuery: activeTab === "subscribers" ? search : "",
    searchFields: ["email", "status"],
    defaultSortKey: "subscribedAt",
    defaultSortOrder: "desc",
  });

  // Metric counts
  const newContactsCount = contactList.filter((c) => c.status === "NEW").length;
  const pendingPitchesCount = pitchList.filter((p) => p.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Inbox &amp; Submissions</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage inbound reader inquiries, contributor story pitches, and newsletter subscriber records.
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Contact Messages Card */}
        <div
          onClick={() => setActiveTab("contacts")}
          className={`cursor-pointer rounded-2xl border p-5 transition-all ${
            activeTab === "contacts"
              ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
              : "border-border bg-surface-elevated hover:border-text-muted/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Contact Inquiries</span>
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon name="mail" className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">{contactList.length}</span>
            {newContactsCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent uppercase">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                {newContactsCount} New
              </span>
            )}
          </div>
        </div>

        {/* Contributor Pitches Card */}
        <div
          onClick={() => setActiveTab("pitches")}
          className={`cursor-pointer rounded-2xl border p-5 transition-all ${
            activeTab === "pitches"
              ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
              : "border-border bg-surface-elevated hover:border-text-muted/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Story Pitches</span>
            <span className="grid size-8 place-items-center rounded-xl bg-accent-secondary/10 text-accent-secondary">
              <Icon name="pen" className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">{pitchList.length}</span>
            {pendingPitchesCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning uppercase">
                <span className="size-1.5 rounded-full bg-warning" />
                {pendingPitchesCount} Pending
              </span>
            )}
          </div>
        </div>

        {/* Newsletter Subscribers Card */}
        <div
          onClick={() => setActiveTab("subscribers")}
          className={`cursor-pointer rounded-2xl border p-5 transition-all ${
            activeTab === "subscribers"
              ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
              : "border-border bg-surface-elevated hover:border-text-muted/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Newsletter Subscribers</span>
            <span className="grid size-8 place-items-center rounded-xl bg-success/10 text-success">
              <Icon name="users" className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">{subscriberList.length}</span>
            <span className="text-xs font-medium text-success">Active Audience</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-elevated p-1 shadow-2xs">
          <button
            onClick={() => {
              setActiveTab("contacts");
              setSearch("");
            }}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "contacts"
                ? "bg-primary text-surface-elevated shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon name="mail" className="size-3.5" />
            Contact Messages ({contactList.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("pitches");
              setSearch("");
            }}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "pitches"
                ? "bg-primary text-surface-elevated shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon name="pen" className="size-3.5" />
            Pitches ({pitchList.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("subscribers");
              setSearch("");
            }}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "subscribers"
                ? "bg-primary text-surface-elevated shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon name="users" className="size-3.5" />
            Subscribers ({subscriberList.length})
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-border bg-surface-elevated pr-3 pl-8 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-text-muted">
              <Icon name="search" className="size-3.5" />
            </span>
          </div>

          {activeTab === "contacts" && (
            <select
              value={contactStatusFilter}
              onChange={(e) => setContactStatusFilter(e.target.value)}
              className="h-9 rounded-xl border border-border bg-surface-elevated px-3 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="READ">Read</option>
              <option value="REPLIED">Replied</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          )}

          {activeTab === "pitches" && (
            <select
              value={pitchStatusFilter}
              onChange={(e) => setPitchStatusFilter(e.target.value)}
              className="h-9 rounded-xl border border-border bg-surface-elevated px-3 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          )}
        </div>
      </div>

      {copyFeedback && (
        <div className="rounded-xl border border-success/30 bg-success/10 p-2.5 text-center text-xs font-semibold text-success">
          Copied email &ldquo;{copyFeedback}&rdquo; to clipboard!
        </div>
      )}

      {/* ============================================================== */}
      {/* TABLE 1: CONTACT SUBMISSIONS                                  */}
      {/* ============================================================== */}
      {activeTab === "contacts" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-background/50 font-semibold text-text-muted uppercase tracking-wider text-[11px]">
                <tr>
                  <th
                    onClick={() => contactsTable.toggleSort("status")}
                    className="px-5 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <span className="text-[10px] text-text-muted">
                        {contactsTable.sortKey === "status" ? (contactsTable.sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => contactsTable.toggleSort("name")}
                    className="px-5 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Sender</span>
                      <span className="text-[10px] text-text-muted">
                        {contactsTable.sortKey === "name" ? (contactsTable.sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => contactsTable.toggleSort("subject")}
                    className="px-5 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Subject &amp; Message Preview</span>
                      <span className="text-[10px] text-text-muted">
                        {contactsTable.sortKey === "subject" ? (contactsTable.sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => contactsTable.toggleSort("createdAt")}
                    className="px-5 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      <span className="text-[10px] text-text-muted">
                        {contactsTable.sortKey === "createdAt" ? (contactsTable.sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contactsTable.paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                      No contact inquiries found matching your filters.
                    </td>
                  </tr>
                ) : (
                  contactsTable.paginatedData.map((msg) => (
                    <tr
                      key={msg.id}
                      className="group transition-colors hover:bg-background/40 cursor-pointer"
                      onClick={() => setSelectedContact(msg)}
                    >
                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            msg.status === "NEW"
                              ? "bg-accent/15 text-accent"
                              : msg.status === "REPLIED"
                              ? "bg-success/15 text-success"
                              : msg.status === "READ"
                              ? "bg-primary/15 text-primary"
                              : "bg-surface text-text-muted border border-border"
                          }`}
                        >
                          {msg.status === "NEW" && <span className="size-1.5 rounded-full bg-accent animate-pulse" />}
                          {msg.status}
                        </span>
                      </td>

                      {/* Sender */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
                            {msg.name ? msg.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary">{msg.name}</p>
                            <p className="text-[11px] text-text-muted">{msg.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Subject & Message snippet */}
                      <td className="max-w-md px-5 py-3.5">
                        <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                          {msg.subject}
                        </p>
                        <p className="line-clamp-1 mt-0.5 text-[11px] text-text-muted">
                          {msg.message}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-text-muted text-[11px]">
                        {formatDate(new Date(msg.createdAt).toISOString())}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={msg.status}
                            onChange={(e) => handleContactStatusChange(msg.id, e.target.value as SubmissionStatus)}
                            className="h-7 rounded-lg border border-border bg-background px-2 text-[11px] font-semibold text-text-primary focus:border-primary focus:outline-none"
                          >
                            <option value="NEW">New</option>
                            <option value="READ">Read</option>
                            <option value="REPLIED">Replied</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>

                          <button
                            onClick={() => setSelectedContact(msg)}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-text-primary hover:border-primary/40 hover:text-primary"
                          >
                            View
                          </button>

                          <button
                            onClick={() => handleDeleteContact(msg.id)}
                            className="rounded-lg border border-error/30 p-1 text-error hover:bg-error/10"
                            title="Delete submission"
                          >
                            <Icon name="close" className="size-3.5" />
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
            currentPage={contactsTable.currentPage}
            totalPages={contactsTable.totalPages}
            pageSize={contactsTable.pageSize}
            totalItems={contactsTable.totalItems}
            rangeText={contactsTable.rangeText}
            onPageChange={contactsTable.setCurrentPage}
            onPageSizeChange={contactsTable.setPageSize}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* TABLE 2: CONTRIBUTOR PITCHES                                  */}
      {/* ============================================================== */}
      {activeTab === "pitches" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-background/50 font-semibold text-text-muted uppercase tracking-wider text-[11px]">
                <tr>
                  <th
                    onClick={() => pitchesTable.toggleSort("status")}
                    className="px-5 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <span className="text-[10px] text-text-muted">
                        {pitchesTable.sortKey === "status" ? (pitchesTable.sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => pitchesTable.toggleSort("name")}
                    className="px-5 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Contributor</span>
                      <span className="text-[10px] text-text-muted">
                        {pitchesTable.sortKey === "name" ? (pitchesTable.sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => pitchesTable.toggleSort("topic")}
                    className="px-5 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Topic</span>
                      <span className="text-[10px] text-text-muted">
                        {pitchesTable.sortKey === "topic" ? (pitchesTable.sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => pitchesTable.toggleSort("idea")}
                    className="px-5 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Story Idea &amp; Pitch Message</span>
                      <span className="text-[10px] text-text-muted">
                        {pitchesTable.sortKey === "idea" ? (pitchesTable.sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => pitchesTable.toggleSort("createdAt")}
                    className="px-5 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      <span className="text-[10px] text-text-muted">
                        {pitchesTable.sortKey === "createdAt" ? (pitchesTable.sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pitchesTable.paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                      No contributor pitches found matching your filters.
                    </td>
                  </tr>
                ) : (
                  pitchesTable.paginatedData.map((p) => (
                    <tr
                      key={p.id}
                      className="group transition-colors hover:bg-background/40 cursor-pointer"
                      onClick={() => setSelectedPitch(p)}
                    >
                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            p.status === "PENDING"
                              ? "bg-warning/15 text-warning"
                              : p.status === "ACCEPTED"
                              ? "bg-success/15 text-success"
                              : p.status === "REVIEWED"
                              ? "bg-primary/15 text-primary"
                              : "bg-error/15 text-error"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Contributor */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="grid size-8 place-items-center rounded-full bg-accent-secondary/10 text-xs font-bold text-accent-secondary ring-1 ring-accent-secondary/20">
                            {p.name ? p.name[0].toUpperCase() : "C"}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary">{p.name}</p>
                            <p className="text-[11px] text-text-muted">{p.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Topic */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="rounded-lg bg-background px-2 py-1 text-[11px] font-semibold text-text-secondary border border-border">
                          {p.topic}
                        </span>
                      </td>

                      {/* Idea & Snippet */}
                      <td className="max-w-md px-5 py-3.5">
                        <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                          {p.idea}
                        </p>
                        <p className="line-clamp-1 mt-0.5 text-[11px] text-text-muted">
                          {p.message}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-text-muted text-[11px]">
                        {formatDate(new Date(p.createdAt).toISOString())}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={p.status}
                            onChange={(e) => handlePitchStatusChange(p.id, e.target.value as PitchStatus)}
                            className="h-7 rounded-lg border border-border bg-background px-2 text-[11px] font-semibold text-text-primary focus:border-primary focus:outline-none"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="REVIEWED">Reviewed</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                          </select>

                          <button
                            onClick={() => setSelectedPitch(p)}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-text-primary hover:border-primary/40 hover:text-primary"
                          >
                            Review
                          </button>

                          <button
                            onClick={() => handleDeletePitch(p.id)}
                            className="rounded-lg border border-error/30 p-1 text-error hover:bg-error/10"
                            title="Delete pitch"
                          >
                            <Icon name="close" className="size-3.5" />
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
            currentPage={pitchesTable.currentPage}
            totalPages={pitchesTable.totalPages}
            pageSize={pitchesTable.pageSize}
            totalItems={pitchesTable.totalItems}
            rangeText={pitchesTable.rangeText}
            onPageChange={pitchesTable.setCurrentPage}
            onPageSizeChange={pitchesTable.setPageSize}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* TABLE 3: NEWSLETTER SUBSCRIBERS                               */}
      {/* ============================================================== */}
      {activeTab === "subscribers" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-background/50 font-semibold text-text-muted uppercase tracking-wider text-[11px]">
                <tr>
                  <th
                    onClick={() => subscribersTable.toggleSort("email")}
                    className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Subscriber</span>
                      <span className="text-[10px] text-text-muted">
                        {subscribersTable.sortKey === "email" ? (subscribersTable.sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => subscribersTable.toggleSort("status")}
                    className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <span className="text-[10px] text-text-muted">
                        {subscribersTable.sortKey === "status" ? (subscribersTable.sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => subscribersTable.toggleSort("subscribedAt")}
                    className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Subscribed Date</span>
                      <span className="text-[10px] text-text-muted">
                        {subscribersTable.sortKey === "subscribedAt" ? (subscribersTable.sortOrder === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscribersTable.paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                      No newsletter subscribers found.
                    </td>
                  </tr>
                ) : (
                  subscribersTable.paginatedData.map((sub) => (
                    <tr key={sub.id} className="transition-colors hover:bg-background/40">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="grid size-8 place-items-center rounded-full bg-success/10 text-xs font-bold text-success ring-1 ring-success/20">
                            {sub.email[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-text-primary">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-bold text-success uppercase">
                          <span className="size-1.5 rounded-full bg-success" />
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-text-muted text-[11px]">
                        {formatDate(new Date(sub.subscribedAt).toISOString())}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopyEmail(sub.email)}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-text-secondary hover:border-primary/40 hover:text-primary transition-colors"
                          >
                            Copy Email
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(sub.id)}
                            className="rounded-lg border border-error/30 p-1 text-error hover:bg-error/10"
                            title="Remove subscriber"
                          >
                            <Icon name="close" className="size-3.5" />
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
            currentPage={subscribersTable.currentPage}
            totalPages={subscribersTable.totalPages}
            pageSize={subscribersTable.pageSize}
            totalItems={subscribersTable.totalItems}
            rangeText={subscribersTable.rangeText}
            onPageChange={subscribersTable.setCurrentPage}
            onPageSizeChange={subscribersTable.setPageSize}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* DETAIL MODAL: CONTACT SUBMISSION                              */}
      {/* ============================================================== */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2 ${
                    selectedContact.status === "NEW"
                      ? "bg-accent/15 text-accent"
                      : selectedContact.status === "REPLIED"
                      ? "bg-success/15 text-success"
                      : "bg-primary/15 text-primary"
                  }`}
                >
                  {selectedContact.status}
                </span>
                <h2 className="text-base font-bold text-text-primary">{selectedContact.subject}</h2>
                <p className="mt-1 text-xs text-text-muted">
                  From: <span className="font-semibold text-text-primary">{selectedContact.name}</span> (&lt;
                  <span className="text-primary font-mono">{selectedContact.email}</span>&gt;) •{" "}
                  {formatDate(new Date(selectedContact.createdAt).toISOString())}
                </p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="grid size-7 place-items-center rounded-lg text-text-muted hover:bg-background hover:text-text-primary"
              >
                <Icon name="close" className="size-4" />
              </button>
            </div>

            {/* Message Body */}
            <div className="mt-4">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Message Content
              </label>
              <div className="mt-1.5 rounded-xl border border-border bg-background p-4 text-xs leading-relaxed text-text-primary whitespace-pre-wrap max-h-60 overflow-y-auto">
                {selectedContact.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Update Status:</span>
                <select
                  value={selectedContact.status}
                  onChange={(e) => handleContactStatusChange(selectedContact.id, e.target.value as SubmissionStatus)}
                  className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="NEW">New</option>
                  <option value="READ">Read</option>
                  <option value="REPLIED">Replied</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteContact(selectedContact.id)}
                  className="h-8 rounded-xl border border-error/30 px-3 text-xs font-semibold text-error hover:bg-error/10"
                >
                  Delete
                </button>
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(selectedContact.subject)}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-surface-elevated hover:bg-primary-hover shadow-xs"
                >
                  <Icon name="mail" className="size-3.5" />
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DETAIL MODAL: CONTRIBUTOR PITCH                               */}
      {/* ============================================================== */}
      {selectedPitch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      selectedPitch.status === "PENDING"
                        ? "bg-warning/15 text-warning"
                        : selectedPitch.status === "ACCEPTED"
                        ? "bg-success/15 text-success"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {selectedPitch.status}
                  </span>
                  <span className="rounded-lg bg-background px-2 py-0.5 text-[10px] font-semibold text-text-secondary border border-border">
                    Topic: {selectedPitch.topic}
                  </span>
                </div>
                <h2 className="text-base font-bold text-text-primary">{selectedPitch.idea}</h2>
                <p className="mt-1 text-xs text-text-muted">
                  Submitted by: <span className="font-semibold text-text-primary">{selectedPitch.name}</span> (&lt;
                  <span className="text-primary font-mono">{selectedPitch.email}</span>&gt;)
                  {selectedPitch.portfolio && (
                    <>
                      {" "}
                      • Portfolio:{" "}
                      <a
                        href={selectedPitch.portfolio}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-primary underline"
                      >
                        Link
                      </a>
                    </>
                  )}{" "}
                  • {formatDate(new Date(selectedPitch.createdAt).toISOString())}
                </p>
              </div>
              <button
                onClick={() => setSelectedPitch(null)}
                className="grid size-7 place-items-center rounded-lg text-text-muted hover:bg-background hover:text-text-primary"
              >
                <Icon name="close" className="size-4" />
              </button>
            </div>

            {/* Proposal Message */}
            <div className="mt-4">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Pitch Proposal &amp; Outline
              </label>
              <div className="mt-1.5 rounded-xl border border-border bg-background p-4 text-xs leading-relaxed text-text-primary whitespace-pre-wrap max-h-60 overflow-y-auto">
                {selectedPitch.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Update Status:</span>
                <select
                  value={selectedPitch.status}
                  onChange={(e) => handlePitchStatusChange(selectedPitch.id, e.target.value as PitchStatus)}
                  className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeletePitch(selectedPitch.id)}
                  className="h-8 rounded-xl border border-error/30 px-3 text-xs font-semibold text-error hover:bg-error/10"
                >
                  Delete
                </button>
                <a
                  href={`mailto:${selectedPitch.email}?subject=DayTodayNews Contributor Pitch: ${encodeURIComponent(selectedPitch.idea)}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-surface-elevated hover:bg-primary-hover shadow-xs"
                >
                  <Icon name="mail" className="size-3.5" />
                  Reply to Contributor
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
