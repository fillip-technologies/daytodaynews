"use client";

import { useMemo, useState } from "react";
import { updateSiteText } from "@/actions/site-content";
import {
  inputClass,
  NoticeBox,
  primaryButtonClass,
  SaveBar,
  smallButtonClass,
  useUnsavedWarning,
  type BilingualText,
  type Notice,
} from "@/components/admin/fields";
import { cn } from "@/lib/cn";
import { textEntries, type TextOverrides } from "@/lib/site-text";

/** Names of the dictionary's sections, in the admin. */
const SECTION_NAMES: Record<string, string> = {
  site: "Site name & logo",
  common: "Common words",
  header: "Header & phone menu",
  megaMenu: "Mega menu dropdowns",
  footer: "Footer",
  home: "Homepage (default titles)",
  newsletter: "Newsletter box & page",
  category: "Category pages",
  article: "Article pages",
  blog: "Blog page",
  search: "Search page",
  pagination: "Page numbers",
  notFound: "Page not found",
  legal: "Legal pages",
  forms: "Contact & pitch forms",
};

type Values = Record<string, BilingualText>;

export function TextManager({ overrides }: { overrides: TextOverrides }) {
  const entries = useMemo(() => textEntries(), []);
  const build = (from: TextOverrides): Values =>
    Object.fromEntries(
      entries.map((entry) => [entry.path, { en: from[entry.path]?.en ?? entry.en, hi: from[entry.path]?.hi ?? entry.hi }]),
    );
  const [values, setValues] = useState<Values>(() => build(overrides));
  const [saved, setSaved] = useState(() => JSON.stringify(build(overrides)));
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const dirty = JSON.stringify(values) !== saved;
  useUnsavedWarning(dirty);

  const q = query.trim().toLowerCase();
  const visible = entries.filter(
    (entry) =>
      !q ||
      entry.path.toLowerCase().includes(q) ||
      values[entry.path].en.toLowerCase().includes(q) ||
      values[entry.path].hi.toLowerCase().includes(q),
  );
  const sections = [...new Set(visible.map((entry) => entry.path.split(".")[0]))];
  const changedCount = entries.filter(
    (entry) => values[entry.path].en !== entry.en || values[entry.path].hi !== entry.hi,
  ).length;

  function set(path: string, value: BilingualText) {
    setValues((current) => ({ ...current, [path]: value }));
    setNotice(null);
  }

  async function save() {
    setSaving(true);
    setNotice(null);
    try {
      const res = await updateSiteText(values);
      if (res.success && res.value) {
        const next = build(res.value);
        setValues(next);
        setSaved(JSON.stringify(next));
        setNotice({ kind: "success", text: "Site text saved. Every page now uses the new wording." });
      } else {
        setNotice({ kind: "error", text: res.error ?? "Could not save the site text." });
      }
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not save the site text." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Site Text</h1>
          <p className="mt-1 max-w-3xl text-xs text-text-muted">
            Every button, label and short line on the website, in English and Hindi. Words in curly brackets, like{" "}
            <code className="font-mono">{"{n}"}</code> or <code className="font-mono">{"{category}"}</code>, are filled
            in by the site (a number, a name) and must stay. {changedCount} of {entries.length} lines are changed from
            the original.
          </p>
        </div>
        <button type="button" onClick={save} disabled={!dirty || saving} className={cn(primaryButtonClass, "shrink-0")}>
          {saving ? "Saving…" : "Save text"}
        </button>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the text, e.g. Subscribe or newsletter…"
        aria-label="Search the site text"
        className={cn(inputClass, "mt-0 h-10 max-w-xl text-sm")}
      />

      <NoticeBox notice={notice} />

      {sections.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-text-muted">
          Nothing matches “{query.trim()}”.
        </p>
      )}

      {sections.map((section) => {
        const rows = visible.filter((entry) => entry.path.split(".")[0] === section);
        return (
          <details
            key={section}
            open={Boolean(q)}
            className="group rounded-2xl border border-border bg-surface-elevated shadow-2xs"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-sm font-bold text-text-primary">
              {SECTION_NAMES[section] ?? section}
              <span className="text-[11px] font-semibold text-text-muted">{rows.length} lines</span>
            </summary>
            <ol className="divide-y divide-border border-t border-border">
              {rows.map((entry) => {
                const value = values[entry.path];
                const changed = value.en !== entry.en || value.hi !== entry.hi;
                const needed = entry.en.match(/\{\w+\}/g);
                return (
                  <li key={entry.path} className="grid gap-2 p-4 lg:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-start">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[11px] text-text-muted" title={entry.path}>
                        {entry.path.split(".").slice(1).join(".")}
                      </p>
                      {needed && <p className="mt-1 text-[11px] text-accent">Keep: {[...new Set(needed)].join(" ")}</p>}
                      {changed && <p className="mt-1 text-[11px] font-semibold text-primary">Changed</p>}
                    </div>
                    <input
                      value={value.en}
                      onChange={(e) => set(entry.path, { ...value, en: e.target.value })}
                      aria-label={`${entry.path} in English`}
                      placeholder={entry.en}
                      className={cn(inputClass, "mt-0 h-10")}
                    />
                    <input
                      lang="hi"
                      value={value.hi}
                      onChange={(e) => set(entry.path, { ...value, hi: e.target.value })}
                      aria-label={`${entry.path} in Hindi`}
                      placeholder={entry.hi}
                      className={cn(inputClass, "mt-0 h-10")}
                    />
                    <button
                      type="button"
                      onClick={() => set(entry.path, { en: entry.en, hi: entry.hi })}
                      disabled={!changed}
                      title="Back to the original text"
                      aria-label={`Reset ${entry.path}`}
                      className={cn(smallButtonClass, "h-10 w-auto px-2")}
                    >
                      Reset
                    </button>
                  </li>
                );
              })}
            </ol>
          </details>
        );
      })}

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onDiscard={() => setValues(JSON.parse(saved) as Values)}
        label="Save text"
      />
    </div>
  );
}
