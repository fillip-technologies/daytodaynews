"use client";

import { useState } from "react";
import Link from "next/link";
import { updateSiteLinks } from "@/actions/site-content";
import {
  inputClass,
  labelClass,
  move,
  NoticeBox,
  primaryButtonClass,
  SaveBar,
  secondaryButtonClass,
  smallButtonClass,
  TextPair,
  useUnsavedWarning,
  type Notice,
} from "@/components/admin/fields";
import { cn } from "@/lib/cn";
import {
  defaultSiteLinks,
  MAX_EXPLORE_CATEGORIES,
  MAX_FOOTER_GROUPS,
  MAX_GROUP_LINKS,
  MAX_UTILITY_LINKS,
  type SiteLink,
  type SiteLinks,
} from "@/lib/site-links";

type Category = { slug: string; label: string };

const HREF_HINT =
  "A page on this site starts with / (e.g. /about, /category/startups, /privacy-policy#cookies, /search?q=guide); other sites start with https://";
const emptyLink = (): SiteLink => ({ label: { en: "", hi: "" }, href: "" });

export function LinksManager({ initial, categories }: { initial: SiteLinks; categories: Category[] }) {
  const [links, setLinks] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const dirty = JSON.stringify(links) !== saved;
  useUnsavedWarning(dirty);

  function edit(patch: Partial<SiteLinks>) {
    setLinks((current) => ({ ...current, ...patch }));
    setNotice(null);
  }

  async function save() {
    setSaving(true);
    setNotice(null);
    try {
      const res = await updateSiteLinks(links);
      if (res.success && res.value) {
        setLinks(res.value);
        setSaved(JSON.stringify(res.value));
        setNotice({ kind: "success", text: "Links saved. The top strip and footer are updated on every page." });
      } else {
        setNotice({ kind: "error", text: res.error ?? "Could not save the links." });
      }
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not save the links." });
    } finally {
      setSaving(false);
    }
  }

  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const availableCategories = categories.filter((c) => !links.exploreCategories.includes(c.slug));

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Links &amp; Footer</h1>
          <p className="mt-1 max-w-3xl text-xs text-text-muted">
            The strip of links above the header and the footer&apos;s link columns, in English and Hindi. The header
            menus are in{" "}
            <Link href="/admin/menu" className="font-semibold text-primary hover:underline">
              Mega Menu
            </Link>
            ; the footer&apos;s tagline and other wording are in{" "}
            <Link href="/admin/text" className="font-semibold text-primary hover:underline">
              Site Text
            </Link>
            .
          </p>
        </div>
        <button type="button" onClick={save} disabled={!dirty || saving} className={cn(primaryButtonClass, "shrink-0")}>
          {saving ? "Saving…" : "Save links"}
        </button>
      </div>

      <NoticeBox notice={notice} />

      <section className="space-y-3 rounded-2xl border border-border bg-surface-elevated p-5 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-text-primary">Top strip</h2>
          <p className="mt-0.5 text-xs text-text-muted">Above the header on desktop, and under “More” in the phone menu.</p>
        </div>
        <LinkRows
          links={links.utility}
          max={MAX_UTILITY_LINKS}
          onChange={(utility) => edit({ utility })}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-surface-elevated p-5 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-text-primary">Footer column 1: categories</h2>
          <p className="mt-0.5 text-xs text-text-muted">Links to category pages, named as in Admin → Categories.</p>
        </div>
        <TextPair label="Column title" value={links.exploreTitle} onChange={(exploreTitle) => edit({ exploreTitle })} />
        <div>
          <p className={labelClass}>
            Categories ({links.exploreCategories.length} / {MAX_EXPLORE_CATEGORIES})
          </p>
          <ul className="mt-2 flex flex-wrap items-center gap-2">
            {links.exploreCategories.map((slug, index) => (
              <li
                key={slug}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-background py-1 pr-1 pl-3"
              >
                <span className="text-xs font-semibold text-text-primary">{bySlug.get(slug)?.label ?? slug}</span>
                <button
                  type="button"
                  onClick={() => edit({ exploreCategories: move(links.exploreCategories, index, index - 1) })}
                  disabled={index === 0}
                  aria-label="Move earlier"
                  className={smallButtonClass}
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => edit({ exploreCategories: links.exploreCategories.filter((s) => s !== slug) })}
                  aria-label="Remove"
                  className={cn(smallButtonClass, "text-error hover:bg-error/10 hover:text-error")}
                >
                  ✕
                </button>
              </li>
            ))}
            {links.exploreCategories.length < MAX_EXPLORE_CATEGORIES && availableCategories.length > 0 && (
              <li>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) edit({ exploreCategories: [...links.exploreCategories, e.target.value] });
                  }}
                  aria-label="Add a category to the footer"
                  className={cn(inputClass, "mt-0 h-9 w-56")}
                >
                  <option value="">+ Add a category…</option>
                  {availableCategories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </li>
            )}
          </ul>
        </div>
      </section>

      {links.footerGroups.map((group, index) => (
        <section key={index} className="space-y-4 rounded-2xl border border-border bg-surface-elevated p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-text-primary">
              Footer column {index + 2}
              {group.title.en && <span className="font-normal text-text-muted">: {group.title.en}</span>}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => edit({ footerGroups: move(links.footerGroups, index, index - 1) })}
                disabled={index === 0}
                aria-label="Move column left"
                className={smallButtonClass}
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() => edit({ footerGroups: move(links.footerGroups, index, index + 1) })}
                disabled={index === links.footerGroups.length - 1}
                aria-label="Move column right"
                className={smallButtonClass}
              >
                ▶
              </button>
              <button
                type="button"
                onClick={() => edit({ footerGroups: links.footerGroups.filter((_, i) => i !== index) })}
                aria-label="Delete column"
                className={cn(smallButtonClass, "text-error hover:bg-error/10 hover:text-error")}
              >
                ✕
              </button>
            </div>
          </div>
          <TextPair
            label="Column title"
            value={group.title}
            onChange={(title) =>
              edit({ footerGroups: links.footerGroups.map((g, i) => (i === index ? { ...g, title } : g)) })
            }
          />
          <LinkRows
            links={group.links}
            max={MAX_GROUP_LINKS}
            onChange={(groupLinks) =>
              edit({
                footerGroups: links.footerGroups.map((g, i) => (i === index ? { ...g, links: groupLinks } : g)),
              })
            }
          />
        </section>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => edit({ footerGroups: [...links.footerGroups, { title: { en: "", hi: "" }, links: [emptyLink()] }] })}
          disabled={links.footerGroups.length >= MAX_FOOTER_GROUPS}
          className={secondaryButtonClass}
        >
          {links.footerGroups.length >= MAX_FOOTER_GROUPS
            ? `Maximum ${MAX_FOOTER_GROUPS + 1} footer columns`
            : "+ Add a footer column"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Replace all links with the original ones? You can still discard before saving.")) {
              edit(defaultSiteLinks());
            }
          }}
          className={secondaryButtonClass}
        >
          Reset to the original links
        </button>
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onDiscard={() => setLinks(JSON.parse(saved) as SiteLinks)}
        label="Save links"
      />
    </div>
  );
}

function LinkRows({ links, max, onChange }: { links: SiteLink[]; max: number; onChange: (links: SiteLink[]) => void }) {
  const update = (index: number, patch: Partial<SiteLink>) =>
    onChange(links.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  return (
    <div>
      <ol className="space-y-2">
        {links.map((link, index) => (
          <li key={index} className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-start gap-2">
              <span className="mt-6 w-5 shrink-0 text-center font-mono text-[11px] font-bold text-text-muted">
                {index + 1}
              </span>
              <div className="grid min-w-0 flex-1 gap-2 lg:grid-cols-3">
                <label className="block">
                  <span className={labelClass}>Label (English)</span>
                  <input
                    value={link.label.en}
                    onChange={(e) => update(index, { label: { ...link.label, en: e.target.value } })}
                    maxLength={80}
                    className={cn(inputClass, "h-10")}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Label (हिंदी)</span>
                  <input
                    lang="hi"
                    value={link.label.hi}
                    onChange={(e) => update(index, { label: { ...link.label, hi: e.target.value } })}
                    maxLength={80}
                    placeholder="Optional; English is shown if empty"
                    className={cn(inputClass, "h-10")}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Opens</span>
                  <input
                    value={link.href}
                    onChange={(e) => update(index, { href: e.target.value })}
                    placeholder="/about or https://…"
                    className={cn(inputClass, "h-10 font-mono")}
                  />
                </label>
              </div>
              <div className="mt-5 flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onChange(move(links, index, index - 1))}
                  disabled={index === 0}
                  aria-label="Move up"
                  className={smallButtonClass}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => onChange(move(links, index, index + 1))}
                  disabled={index === links.length - 1}
                  aria-label="Move down"
                  className={smallButtonClass}
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => onChange(links.filter((_, i) => i !== index))}
                  aria-label="Remove"
                  className={cn(smallButtonClass, "text-error hover:bg-error/10 hover:text-error")}
                >
                  ✕
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-[11px] text-text-muted">{HREF_HINT}</p>
      <button
        type="button"
        onClick={() => onChange([...links, emptyLink()])}
        disabled={links.length >= max}
        className={cn(secondaryButtonClass, "mt-2 h-8 px-3")}
      >
        {links.length >= max ? `Maximum ${max} links` : "+ Add link"}
      </button>
    </div>
  );
}
