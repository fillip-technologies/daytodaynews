"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCategory } from "@/actions/categories";
import { updateMenuTopics } from "@/actions/menu";
import { updateHeaderCategories } from "@/actions/settings";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { MAX_MENU_TOPICS, type MenuTopicInput } from "@/lib/menu-topics";
import { toneStyle, type Tone } from "@/lib/tones";
import { IconPicker } from "../categories/IconPicker";

/** Same limit as updateHeaderCategories. */
const MAX_MENU_BAR = 5;

type MenuCategory = {
  id: string;
  slug: string;
  label: string;
  labelHi: string | null;
  icon: string;
  tone: string;
  articleCount: number;
  /** Saved submenu topics, in display order. */
  topics: MenuTopicInput[];
  /** Published articles matching each saved keyword, counted as the public menu does. */
  matches: Record<string, number>;
};

type MenuManagerProps = {
  /** Menu-bar categories, left to right. */
  initialHeaderSlugs: string[];
  categories: MenuCategory[];
};

type Notice = { kind: "success" | "error"; text: string } | null;

const inputClass =
  "mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-text-primary focus:border-primary focus:outline-none";
const labelClass = "text-[11px] font-semibold text-text-secondary";
const iconButtonClass =
  "grid size-8 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30";
const removeButtonClass =
  "grid size-8 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-error transition-colors hover:border-error/40 hover:bg-error/10";
const primaryButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-surface-elevated transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-elevated px-4 text-xs font-semibold text-text-secondary transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50";

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** URL name for a new category, e.g. "Cloud & DevOps" → "cloud-devops". */
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function NoticeBox({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <p
      role={notice.kind === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border p-3.5 text-xs font-medium",
        notice.kind === "error"
          ? "border-error/30 bg-error/10 text-error"
          : "border-success/30 bg-success/10 text-success",
      )}
    >
      {notice.text}
    </p>
  );
}

function CategoryIcon({ category, size = "md" }: { category: MenuCategory; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden="true"
      style={toneStyle(category.tone as Tone)}
      className={cn(
        "grid shrink-0 place-items-center rounded-lg bg-(color:--tone)/10 text-(color:--tone)",
        size === "md" ? "size-8" : "size-7",
      )}
    >
      <Icon name={category.icon} className={size === "md" ? "size-4" : "size-3.5"} />
    </span>
  );
}

export function MenuManager({ initialHeaderSlugs, categories }: MenuManagerProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();

  // Menu bar: `bar` is being edited, `savedBar` is live on the website.
  const [savedBar, setSavedBar] = useState(initialHeaderSlugs);
  const [bar, setBar] = useState(initialHeaderSlugs);
  const [toAdd, setToAdd] = useState("");
  const [barSaving, setBarSaving] = useState(false);
  const [barNotice, setBarNotice] = useState<Notice>(null);
  const [creating, setCreating] = useState(false);

  // Submenu editor.
  const [selected, setSelected] = useState(initialHeaderSlugs[0] ?? categories[0]?.slug ?? "");
  const [editorDirty, setEditorDirty] = useState(false);

  const bySlug = useMemo(() => new Map(categories.map((c) => [c.slug, c])), [categories]);
  const barCategories = bar.flatMap((slug) => bySlug.get(slug) ?? []);
  const available = categories.filter((c) => !bar.includes(c.slug));
  // Menu-bar categories first, in menu order; then the rest by name.
  const ordered = [...savedBar.flatMap((slug) => bySlug.get(slug) ?? []), ...categories.filter((c) => !savedBar.includes(c.slug))];
  const current = bySlug.get(selected);
  const barDirty = bar.join() !== savedBar.join();

  const refresh = useCallback(() => startRefresh(() => router.refresh()), [router]);

  function editBar(next: string[]) {
    setBar(next);
    setBarNotice(null);
  }

  function addToBar() {
    if (!toAdd || bar.length >= MAX_MENU_BAR) return;
    editBar([...bar, toAdd]);
    setToAdd("");
  }

  function removeFromBar(slug: string) {
    if (bar.length <= 1) {
      setBarNotice({ kind: "error", text: "The menu bar needs at least 1 menu." });
      return;
    }
    editBar(bar.filter((s) => s !== slug));
  }

  async function saveBar() {
    setBarSaving(true);
    setBarNotice(null);
    try {
      const res = await updateHeaderCategories(bar);
      if (res.success) {
        const slugs = res.slugs ?? bar;
        setSavedBar(slugs);
        setBar(slugs);
        setBarNotice({ kind: "success", text: "Menu bar saved. The website header now shows these menus." });
      } else {
        setBarNotice({ kind: "error", text: res.error ?? "Could not save the menu bar." });
      }
    } catch (error) {
      setBarNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not save the menu bar." });
    } finally {
      setBarSaving(false);
    }
  }

  function selectCategory(slug: string, scroll = false) {
    if (slug !== selected) {
      if (editorDirty && !window.confirm("You have unsaved submenu changes. Discard them?")) return;
      setEditorDirty(false);
      setSelected(slug);
    }
    if (scroll) document.getElementById("submenu-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleCreated(slug: string, label: string, addToMenuBar: boolean) {
    setCreating(false);
    if (!editorDirty) setSelected(slug);

    let text = `"${label}" created. Add it to the menu bar when you're ready, and add its submenu topics below.`;
    let kind: "success" | "error" = "success";
    if (addToMenuBar) {
      // Adds to the live menu bar; unsaved reordering above is replaced by it.
      const next = [...savedBar, slug];
      const res = await updateHeaderCategories(next);
      if (res.success) {
        setSavedBar(res.slugs ?? next);
        setBar(res.slugs ?? next);
        text = `"${label}" created and added to the menu bar. Now add its submenu topics below.`;
      } else {
        kind = "error";
        text = `"${label}" was created, but it could not be added to the menu bar: ${res.error ?? "unknown error"}`;
      }
    }
    setBarNotice({ kind, text });
    refresh();
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Mega Menu</h1>
          <p className="mt-1 text-xs text-text-muted">
            Choose the menus in the website header, create new ones, and edit the topics inside each dropdown, in
            English and Hindi.
          </p>
        </div>
        <Link href="/" target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
          View website ↗
        </Link>
      </div>

      {/* ---------------------------------------------------------------- Menu bar */}
      <section aria-labelledby="menu-bar-title" className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 id="menu-bar-title" className="text-base font-bold text-text-primary">
                Menu bar
              </h2>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
                  bar.length === MAX_MENU_BAR ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary",
                )}
              >
                {bar.length} / {MAX_MENU_BAR}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              The menus across the top of the website, left to right. Each one opens a dropdown with its submenu
              topics and latest stories.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreating((open) => !open)}
            aria-expanded={creating}
            className={creating ? secondaryButtonClass : primaryButtonClass}
          >
            {creating ? "Cancel" : "+ New menu"}
          </button>
        </div>

        {creating && (
          <NewMenuForm
            canAddToMenuBar={savedBar.length < MAX_MENU_BAR}
            barDirty={barDirty}
            onCancel={() => setCreating(false)}
            onCreated={handleCreated}
          />
        )}

        <ol className="mt-5 space-y-2.5">
          {barCategories.map((category, index) => (
            <li
              key={category.slug}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-elevated font-mono text-xs font-bold text-text-muted ring-1 ring-border">
                  {index + 1}
                </span>
                <CategoryIcon category={category} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-text-primary">
                    {category.label}
                    {category.labelHi && <span className="font-normal text-text-muted"> · {category.labelHi}</span>}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {category.topics.length} submenu topics · {category.articleCount} articles
                    {index === 3 && " · shows on large screens (others: in the ☰ menu)"}
                    {index === 4 && " · shows on extra-large screens (others: in the ☰ menu)"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => selectCategory(category.slug, true)}
                  className={cn(secondaryButtonClass, "h-8 px-3")}
                >
                  Edit submenu
                </button>
                <button
                  type="button"
                  onClick={() => editBar(move(bar, index, index - 1))}
                  disabled={index === 0}
                  aria-label={`Move ${category.label} left`}
                  className={iconButtonClass}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => editBar(move(bar, index, index + 1))}
                  disabled={index === bar.length - 1}
                  aria-label={`Move ${category.label} right`}
                  className={iconButtonClass}
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => removeFromBar(category.slug)}
                  aria-label={`Remove ${category.label} from the menu bar`}
                  className={removeButtonClass}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            value={toAdd}
            onChange={(e) => setToAdd(e.target.value)}
            disabled={bar.length >= MAX_MENU_BAR || available.length === 0}
            aria-label="Category to add to the menu bar"
            className={cn(inputClass, "mt-0 h-9 w-full sm:w-72")}
          >
            <option value="">
              {bar.length >= MAX_MENU_BAR
                ? `Menu bar is full (${MAX_MENU_BAR}): remove one to add another`
                : available.length === 0
                  ? "Every category is already in the menu bar"
                  : "Add an existing category…"}
            </option>
            {available.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addToBar}
            disabled={!toAdd || bar.length >= MAX_MENU_BAR}
            className={secondaryButtonClass}
          >
            Add to menu bar
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Link href="/admin/categories" className="text-xs font-semibold text-primary hover:underline">
            Rename or delete a menu in Categories →
          </Link>
          <div className="flex items-center gap-2">
            {barDirty && (
              <button type="button" onClick={() => editBar(savedBar)} disabled={barSaving} className={secondaryButtonClass}>
                Discard
              </button>
            )}
            <button type="button" onClick={saveBar} disabled={!barDirty || barSaving} className={primaryButtonClass}>
              {barSaving ? "Saving…" : "Save menu bar"}
            </button>
          </div>
        </div>
        {barNotice && (
          <div className="mt-4">
            <NoticeBox notice={barNotice} />
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------- Submenu topics */}
      <section
        id="submenu-editor"
        aria-labelledby="submenu-title"
        className="scroll-mt-6 rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs"
      >
        <div className="border-b border-border pb-4">
          <h2 id="submenu-title" className="text-base font-bold text-text-primary">
            Submenu topics
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Pick a menu, then add, edit, reorder or remove the topics in its dropdown. They also appear in the ☰
            menu on phones.
          </p>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav aria-label="Menus" className="space-y-1">
            {ordered.map((category) => {
              const position = savedBar.indexOf(category.slug);
              const active = category.slug === selected;
              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => selectCategory(category.slug)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
                    active ? "border-primary/40 bg-primary/5" : "border-transparent hover:bg-background",
                  )}
                >
                  <CategoryIcon category={category} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-text-primary">{category.label}</span>
                    <span className="block text-[11px] text-text-muted">
                      {category.topics.length} topics
                      {position >= 0 ? ` · menu bar #${position + 1}` : " · not in menu bar"}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          {current ? (
            <TopicEditor
              key={current.id}
              category={current}
              inMenuBar={savedBar.includes(current.slug)}
              onDirtyChange={setEditorDirty}
              onSaved={refresh}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-text-muted">
              {isRefreshing ? "Loading…" : "Pick a menu on the left."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

// ----------------------------------------------------------------- New menu

function NewMenuForm({
  canAddToMenuBar,
  barDirty,
  onCancel,
  onCreated,
}: {
  canAddToMenuBar: boolean;
  barDirty: boolean;
  onCancel: () => void;
  onCreated: (slug: string, label: string, addToMenuBar: boolean) => Promise<void>;
}) {
  const [labelEn, setLabelEn] = useState("");
  const [labelHi, setLabelHi] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionHi, setDescriptionHi] = useState("");
  const [customSlug, setCustomSlug] = useState<string | null>(null);
  const [icon, setIcon] = useState("sparkles");
  const [addToMenuBar, setAddToMenuBar] = useState(canAddToMenuBar);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const slug = customSlug ?? slugify(labelEn);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const label = labelEn.trim();
    const finalSlug = slugify(slug);
    if (!label) return setNotice({ kind: "error", text: "The English name is required." });
    if (!finalSlug) return setNotice({ kind: "error", text: "Enter a URL name using English letters or numbers." });

    setSaving(true);
    setNotice(null);
    try {
      const res = await createCategory({
        label,
        slug: finalSlug,
        description: descriptionEn,
        icon,
        tone: "primary",
        hi: { label: labelHi, description: descriptionHi },
      });
      if (!res.success) {
        setNotice({ kind: "error", text: res.error ?? "Could not create the menu." });
        return;
      }
      await onCreated(finalSlug, label, addToMenuBar && canAddToMenuBar);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not create the menu." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div>
        <h3 className="text-sm font-bold text-text-primary">New menu</h3>
        <p className="mt-0.5 text-xs text-text-muted">
          Creates a new category with its own page (/category/…). Its dropdown shows its submenu topics and its
          latest stories.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Name (English) *</span>
          <input
            value={labelEn}
            onChange={(e) => setLabelEn(e.target.value)}
            required
            maxLength={100}
            placeholder="e.g. Cloud & DevOps"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Name (हिंदी)</span>
          <input
            lang="hi"
            value={labelHi}
            onChange={(e) => setLabelHi(e.target.value)}
            maxLength={100}
            placeholder="Optional; English is shown if empty"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Description (English)</span>
          <input
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            maxLength={300}
            placeholder="One line shown in the dropdown"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Description (हिंदी)</span>
          <input
            lang="hi"
            value={descriptionHi}
            onChange={(e) => setDescriptionHi(e.target.value)}
            maxLength={300}
            placeholder="Optional"
            className={inputClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>URL name</span>
          <div className="mt-1 flex items-center rounded-xl border border-border bg-background pl-3 focus-within:border-primary">
            <span className="text-xs text-text-muted">/category/</span>
            <input
              value={slug}
              onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              maxLength={60}
              placeholder="cloud-devops"
              className="h-10 min-w-0 flex-1 bg-transparent pr-3 font-mono text-xs text-text-primary focus:outline-none"
            />
          </div>
        </label>
      </div>

      <IconPicker value={icon} onChange={setIcon} />

      <label className="flex items-start gap-2.5 text-xs text-text-secondary">
        <input
          type="checkbox"
          checked={addToMenuBar && canAddToMenuBar}
          onChange={(e) => setAddToMenuBar(e.target.checked)}
          disabled={!canAddToMenuBar}
          className="mt-0.5 size-4 accent-primary"
        />
        <span>
          Add it to the menu bar now
          {!canAddToMenuBar && ` (the menu bar is full; remove a menu first, or add it later)`}
          {canAddToMenuBar && barDirty && " (your unsaved menu-bar changes will be discarded)"}
        </span>
      </label>

      <NoticeBox notice={notice} />

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={saving} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Creating…" : "Create menu"}
        </button>
      </div>
    </form>
  );
}

// ------------------------------------------------------------ Topic editor

/** An editor row; `uid` keeps its React key and input id stable while rows move. */
type Row = MenuTopicInput & { uid: string };

/** The row as it will be saved. */
function normalize({ labelEn, labelHi, kind, value, alwaysShow }: MenuTopicInput): MenuTopicInput {
  return {
    labelEn: labelEn.trim(),
    labelHi: labelHi.trim(),
    kind,
    value: value.trim(),
    alwaysShow: kind === "link" || alwaysShow,
  };
}

const plural = (n: number) => `${n} matching article${n === 1 ? "" : "s"}`;

/** Whether visitors will see the topic, as lib/navigation decides it. */
function topicStatus(topic: MenuTopicInput, matches: Record<string, number>) {
  if (topic.kind === "link") return { text: "Always shown (link)", tone: "on" as const };
  const query = topic.value.trim();
  if (!query) return { text: "Add a keyword", tone: "muted" as const };
  const count = matches[query];
  if (topic.alwaysShow) {
    return { text: count === undefined ? "Always shown" : `Always shown · ${plural(count)}`, tone: "on" as const };
  }
  if (count === undefined) return { text: "Save to check matching articles", tone: "muted" as const };
  return count > 0
    ? { text: `Shown · ${plural(count)}`, tone: "on" as const }
    : { text: "Hidden · no matching articles yet", tone: "off" as const };
}

function Switch({
  checked,
  disabled,
  onChange,
  label,
  title,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      title={title}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 rounded-full text-xs font-semibold text-text-secondary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        aria-hidden="true"
        className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-border")}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-surface-elevated shadow-xs transition-transform motion-reduce:transition-none",
            checked && "translate-x-4",
          )}
        />
      </span>
      {label}
    </button>
  );
}

function TopicEditor({
  category,
  inMenuBar,
  onDirtyChange,
  onSaved,
}: {
  category: MenuCategory;
  inMenuBar: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onSaved: () => void;
}) {
  const idPrefix = useId();
  // Server and first client render must agree, so saved rows get index-based
  // uids; rows added later get uids from this counter.
  const uidCounter = useRef(0);
  const withUid = (topic: MenuTopicInput): Row => ({ ...topic, uid: `new${++uidCounter.current}` });
  const [rows, setRows] = useState<Row[]>(() => category.topics.map((topic, index) => ({ ...topic, uid: `saved${index}` })));
  const [saved, setSaved] = useState(() => JSON.stringify(category.topics.map(normalize)));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [focusUid, setFocusUid] = useState<string | null>(null);

  const dirty = JSON.stringify(rows.map(normalize)) !== saved;
  const full = rows.length >= MAX_MENU_TOPICS;

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (focusUid) document.getElementById(`${idPrefix}${focusUid}-en`)?.focus();
  }, [focusUid, idPrefix]);

  function update(uid: string, patch: Partial<MenuTopicInput>) {
    setRows((list) => list.map((row) => (row.uid === uid ? { ...row, ...patch } : row)));
    setNotice(null);
  }

  function edit(next: Row[]) {
    setRows(next);
    setNotice(null);
  }

  function addTopic() {
    if (full) return;
    const row = withUid({ labelEn: "", labelHi: "", kind: "search", value: "", alwaysShow: false });
    edit([...rows, row]);
    setFocusUid(row.uid);
  }

  async function save() {
    const topics = rows.map(normalize);
    setSaving(true);
    setNotice(null);
    try {
      const res = await updateMenuTopics(category.id, topics);
      if (res.success) {
        setRows(rows.map((row, index) => ({ ...topics[index], uid: row.uid })));
        setSaved(JSON.stringify(topics));
        setNotice({ kind: "success", text: "Submenu saved. The website menu is updated." });
        onSaved(); // Refreshes the article counts.
      } else {
        setNotice({ kind: "error", text: res.error ?? "Could not save the submenu." });
      }
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not save the submenu." });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    edit((JSON.parse(saved) as MenuTopicInput[]).map(withUid));
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2.5 text-sm font-bold text-text-primary">
            <CategoryIcon category={category} size="sm" />
            <span className="truncate">{category.label}</span>
            {category.labelHi && <span className="truncate font-normal text-text-muted">· {category.labelHi}</span>}
          </h3>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-text-muted">
            A <strong>keyword</strong> topic opens search results for that keyword and appears once at least one
            published article matches. Turn on <strong>Always show</strong> to show it anyway. A{" "}
            <strong>link</strong> topic opens any page and always shows. The Hindi name is used on Hindi pages.
          </p>
          {!inMenuBar && (
            <p className="mt-2 text-xs font-medium text-accent">
              This category isn&apos;t in the menu bar, so these topics show only in the ☰ menu.
            </p>
          )}
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
            full ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary",
          )}
        >
          {rows.length} / {MAX_MENU_TOPICS}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-text-muted">
          No submenu topics yet. Until you add some, the dropdown shows only the latest stories.
        </p>
      ) : (
        <ol className="space-y-3">
          {rows.map((row, index) => {
            const status = topicStatus(row, category.matches);
            const name = row.labelEn.trim() || `topic ${index + 1}`;
            return (
              <li key={row.uid} className="rounded-xl border border-border bg-background p-3.5">
                <div className="flex items-start gap-3">
                  <span className="mt-6 grid size-7 shrink-0 place-items-center rounded-lg bg-surface-elevated font-mono text-xs font-bold text-text-muted ring-1 ring-border">
                    {index + 1}
                  </span>
                  <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <label className="block">
                      <span className={labelClass}>Name (English) *</span>
                      <input
                        id={`${idPrefix}${row.uid}-en`}
                        value={row.labelEn}
                        onChange={(e) => update(row.uid, { labelEn: e.target.value })}
                        maxLength={100}
                        placeholder="e.g. Machine Learning"
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Name (हिंदी)</span>
                      <input
                        lang="hi"
                        value={row.labelHi}
                        onChange={(e) => update(row.uid, { labelHi: e.target.value })}
                        maxLength={100}
                        placeholder="Optional; English is shown if empty"
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Opens</span>
                      <select
                        value={row.kind}
                        onChange={(e) => update(row.uid, { kind: e.target.value === "link" ? "link" : "search" })}
                        className={inputClass}
                      >
                        <option value="search">Keyword search</option>
                        <option value="link">Page or link</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className={labelClass}>{row.kind === "link" ? "Link *" : "Keyword *"}</span>
                      <input
                        value={row.value}
                        onChange={(e) => update(row.uid, { value: e.target.value })}
                        maxLength={row.kind === "link" ? 2048 : 200}
                        placeholder={row.kind === "link" ? "/category/software or https://…" : "e.g. machine learning"}
                        className={cn(inputClass, row.kind === "link" && "font-mono")}
                      />
                    </label>
                  </div>
                  <div className="mt-5 flex shrink-0 flex-col gap-1.5 xl:flex-row">
                    <button
                      type="button"
                      onClick={() => edit(move(rows, index, index - 1))}
                      disabled={index === 0}
                      aria-label={`Move ${name} up`}
                      className={iconButtonClass}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => edit(move(rows, index, index + 1))}
                      disabled={index === rows.length - 1}
                      aria-label={`Move ${name} down`}
                      className={iconButtonClass}
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => edit(rows.filter((r) => r.uid !== row.uid))}
                      aria-label={`Delete ${name}`}
                      className={removeButtonClass}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 sm:ml-10">
                  <Switch
                    checked={row.kind === "link" || row.alwaysShow}
                    disabled={row.kind === "link"}
                    onChange={(checked) => update(row.uid, { alwaysShow: checked })}
                    label="Always show"
                    title={
                      row.kind === "link"
                        ? "Links always show"
                        : "Show this topic even when no published article matches the keyword"
                    }
                  />
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      status.tone === "on" && "bg-success/10 text-success",
                      status.tone === "off" && "bg-accent/15 text-accent",
                      status.tone === "muted" && "bg-surface-elevated text-text-muted ring-1 ring-border",
                    )}
                  >
                    {status.text}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <button type="button" onClick={addTopic} disabled={full} className={secondaryButtonClass}>
          {full ? `Maximum ${MAX_MENU_TOPICS} topics` : "+ Add topic"}
        </button>
        <div className="flex items-center gap-2">
          {dirty && (
            <button type="button" onClick={discard} disabled={saving} className={secondaryButtonClass}>
              Discard changes
            </button>
          )}
          <button type="button" onClick={save} disabled={!dirty || saving} className={primaryButtonClass}>
            {saving ? "Saving…" : "Save submenu"}
          </button>
        </div>
      </div>
      <NoticeBox notice={notice} />
    </div>
  );
}
