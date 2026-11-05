"use client";

import { useState } from "react";
import { updatePageContent } from "@/actions/site-content";
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
import { missingHindi, type ItemField, type ItemValue, type PageField, type PageText, type PageValues } from "@/lib/page-content";
import { pageDefaults, pageSchemas } from "@/lib/page-defaults";

type Category = { slug: string; label: string };

const emptyText = (): PageText => ({ en: "", hi: "" });
const MARKDOWN_HINT =
  "Leave a blank line between paragraphs. **bold**, a line starting with - for a bullet, [link text](/contact) for a link.";

export function PagesManager({ initial, categories }: { initial: Record<string, PageValues>; categories: Category[] }) {
  const [selected, setSelected] = useState(pageSchemas[0].key);
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(() =>
    Object.fromEntries(Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)])),
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const schema = pageSchemas.find((s) => s.key === selected) ?? pageSchemas[0];
  const current = values[schema.key] ?? {};
  const isDirty = (key: string) => JSON.stringify(values[key]) !== saved[key];
  const dirty = isDirty(schema.key);
  const missing = missingHindi(schema, current);
  useUnsavedWarning(pageSchemas.some((s) => isDirty(s.key)));

  function setField(key: string, value: PageValues[string]) {
    setValues((all) => ({ ...all, [schema.key]: { ...all[schema.key], [key]: value } }));
    setNotice(null);
  }

  async function save() {
    setSaving(true);
    setNotice(null);
    try {
      const res = await updatePageContent(schema.key, current);
      if (res.success && res.value) {
        setValues((all) => ({ ...all, [schema.key]: res.value! }));
        setSaved((all) => ({ ...all, [schema.key]: JSON.stringify(res.value) }));
        setNotice({ kind: "success", text: `${schema.label} saved. The page on the website is updated.` });
      } else {
        setNotice({ kind: "error", text: res.error ?? "Could not save the page." });
      }
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not save the page." });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setValues((all) => ({ ...all, [schema.key]: JSON.parse(saved[schema.key]) as PageValues }));
    setNotice(null);
  }

  function resetToShipped() {
    if (!window.confirm(`Replace everything on ${schema.label} with the original text? You can still discard before saving.`)) {
      return;
    }
    setValues((all) => ({ ...all, [schema.key]: structuredClone(pageDefaults[schema.key]) }));
    setNotice(null);
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Pages</h1>
          <p className="mt-1 max-w-3xl text-xs text-text-muted">
            All the words on the fixed pages, in English and Hindi. Where Hindi is empty, the Hindi page shows the
            English. The pages&apos; SEO titles and descriptions are in Admin → SEO → Pages.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a href={`/en${schema.path}`} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
            View page ↗
          </a>
          <button type="button" onClick={save} disabled={!dirty || saving} className={primaryButtonClass}>
            {saving ? "Saving…" : "Save page"}
          </button>
        </div>
      </div>

      <div role="tablist" aria-label="Pages" className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface-elevated p-1">
        {pageSchemas.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={s.key === schema.key}
            onClick={() => {
              setSelected(s.key);
              setNotice(null);
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
              s.key === schema.key ? "bg-primary text-surface-elevated" : "text-text-secondary hover:bg-background",
            )}
          >
            {s.label}
            {isDirty(s.key) && <span aria-label="unsaved changes"> •</span>}
          </button>
        ))}
      </div>

      <NoticeBox notice={notice} />

      {missing > 0 ? (
        <p className="rounded-xl border border-accent/30 bg-accent/10 p-3.5 text-xs font-medium text-accent">
          Hindi: {missing} {missing === 1 ? "text is" : "texts are"} still empty. Until all are filled, the Hindi page
          shows English there and tells search engines that the English page is the main one.
        </p>
      ) : (
        <p className="rounded-xl border border-success/30 bg-success/10 p-3.5 text-xs font-medium text-success">
          Hindi: complete. The Hindi page is listed in the sitemap and indexed on its own.
        </p>
      )}

      {schema.groups.map((group) => (
        <section key={group.title} className="space-y-4 rounded-2xl border border-border bg-surface-elevated p-5 shadow-2xs">
          <h2 className="text-sm font-bold text-text-primary">{group.title}</h2>
          {group.fields.map((field) => (
            <FieldEditor
              key={field.key}
              field={field}
              value={current[field.key]}
              categories={categories}
              onChange={(value) => setField(field.key, value)}
            />
          ))}
        </section>
      ))}

      <div className="flex justify-end">
        <button type="button" onClick={resetToShipped} className={secondaryButtonClass}>
          Reset this page to the original text
        </button>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={discard} label="Save page" />
    </div>
  );
}

function Hint({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1 text-[11px] text-text-muted">{children}</p>;
}

function FieldEditor({
  field,
  value,
  categories,
  onChange,
}: {
  field: PageField;
  value: PageValues[string] | undefined;
  categories: Category[];
  onChange: (value: PageValues[string]) => void;
}) {
  switch (field.kind) {
    case "line":
    case "text":
    case "markdown":
      return (
        <div>
          <TextPair
            label={field.label}
            value={(value as PageText | undefined) ?? emptyText()}
            onChange={onChange}
            rows={field.kind === "line" ? undefined : field.kind === "text" ? 3 : 7}
            mono={field.kind === "markdown"}
          />
          <Hint>{field.kind === "markdown" ? `${field.hint ? `${field.hint} ` : ""}${MARKDOWN_HINT}` : field.hint}</Hint>
        </div>
      );
    case "date":
      return (
        <label className="block max-w-xs">
          <span className={labelClass}>{field.label}</span>
          <input
            type="date"
            value={(value as string | undefined) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputClass, "h-10")}
          />
          <Hint>{field.hint}</Hint>
        </label>
      );
    case "list": {
      const rows = (value as PageText[] | undefined) ?? [];
      return (
        <div className="rounded-xl border border-border bg-background p-3.5">
          <ListHeader label={field.label} count={rows.length} max={field.max} />
          <Hint>{field.hint}</Hint>
          <ol className="mt-2 space-y-2">
            {rows.map((row, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-3.5 w-5 shrink-0 text-center font-mono text-[11px] font-bold text-text-muted">
                  {index + 1}
                </span>
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                  <input
                    value={row.en}
                    onChange={(e) => onChange(rows.map((r, i) => (i === index ? { ...r, en: e.target.value } : r)))}
                    placeholder={`${field.itemLabel} (English)`}
                    aria-label={`${field.itemLabel} ${index + 1}, English`}
                    className={cn(inputClass, "mt-1 h-10")}
                  />
                  <input
                    lang="hi"
                    value={row.hi}
                    onChange={(e) => onChange(rows.map((r, i) => (i === index ? { ...r, hi: e.target.value } : r)))}
                    placeholder={`${field.itemLabel} (हिंदी)`}
                    aria-label={`${field.itemLabel} ${index + 1}, Hindi`}
                    className={cn(inputClass, "mt-1 h-10")}
                  />
                </div>
                <RowButtons
                  index={index}
                  count={rows.length}
                  name={field.itemLabel}
                  onMove={(to) => onChange(move(rows, index, to))}
                  onRemove={() => onChange(rows.filter((_, i) => i !== index))}
                />
              </li>
            ))}
          </ol>
          <AddButton
            label={field.itemLabel}
            disabled={rows.length >= field.max}
            onClick={() => onChange([...rows, emptyText()])}
          />
        </div>
      );
    }
    case "items": {
      const items = (value as ItemValue[] | undefined) ?? [];
      const blank = (): ItemValue =>
        Object.fromEntries(field.fields.map((f) => [f.key, f.kind === "id" ? "" : emptyText()]));
      return (
        <div className="rounded-xl border border-border bg-background p-3.5">
          <ListHeader label={field.label} count={items.length} max={field.max} />
          <Hint>{field.hint}</Hint>
          <ol className="mt-2 space-y-3">
            {items.map((item, index) => (
              <li key={index} className="rounded-xl border border-border bg-surface-elevated p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-text-primary">
                    {field.itemLabel} {index + 1}
                  </p>
                  <RowButtons
                    index={index}
                    count={items.length}
                    name={`${field.itemLabel} ${index + 1}`}
                    onMove={(to) => onChange(move(items, index, to))}
                    onRemove={() => onChange(items.filter((_, i) => i !== index))}
                  />
                </div>
                <div className="mt-2 space-y-3">
                  {field.fields.map((itemField) => (
                    <ItemFieldEditor
                      key={itemField.key}
                      field={itemField}
                      value={item[itemField.key]}
                      onChange={(v) =>
                        onChange(items.map((it, i) => (i === index ? { ...it, [itemField.key]: v } : it)))
                      }
                    />
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <AddButton
            label={field.itemLabel}
            disabled={items.length >= field.max}
            onClick={() => onChange([...items, blank()])}
          />
        </div>
      );
    }
    case "categories": {
      const slugs = (value as string[] | undefined) ?? [];
      const bySlug = new Map(categories.map((c) => [c.slug, c]));
      const available = categories.filter((c) => !slugs.includes(c.slug));
      return (
        <div className="rounded-xl border border-border bg-background p-3.5">
          <ListHeader label={field.label} count={slugs.length} max={field.max} />
          <Hint>{field.hint}</Hint>
          <ul className="mt-2 flex flex-wrap items-center gap-2">
            {slugs.map((slug, index) => (
              <li
                key={slug}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-elevated py-1 pr-1 pl-3"
              >
                <span className="text-xs font-semibold text-text-primary">{bySlug.get(slug)?.label ?? slug}</span>
                <button
                  type="button"
                  onClick={() => onChange(move(slugs, index, index - 1))}
                  disabled={index === 0}
                  aria-label="Move earlier"
                  className={smallButtonClass}
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => onChange(slugs.filter((s) => s !== slug))}
                  aria-label="Remove"
                  className={cn(smallButtonClass, "text-error hover:bg-error/10 hover:text-error")}
                >
                  ✕
                </button>
              </li>
            ))}
            {slugs.length < field.max && available.length > 0 && (
              <li>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) onChange([...slugs, e.target.value]);
                  }}
                  aria-label={`Add to ${field.label}`}
                  className={cn(inputClass, "mt-0 h-9 w-56")}
                >
                  <option value="">+ Add a category…</option>
                  {available.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </li>
            )}
          </ul>
        </div>
      );
    }
  }
}

function ItemFieldEditor({
  field,
  value,
  onChange,
}: {
  field: ItemField;
  value: PageText | string | undefined;
  onChange: (value: PageText | string) => void;
}) {
  if (field.kind === "id") {
    return (
      <label className="block max-w-sm">
        <span className={labelClass}>{field.label}</span>
        <input
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          placeholder="Made from the heading if empty"
          className={cn(inputClass, "h-10 font-mono")}
        />
      </label>
    );
  }
  return (
    <div>
      <TextPair
        label={field.label}
        value={value && typeof value === "object" ? value : emptyText()}
        onChange={onChange}
        rows={field.kind === "line" ? undefined : field.kind === "text" ? 3 : 6}
        mono={field.kind === "markdown"}
      />
      {field.kind === "markdown" && <Hint>{MARKDOWN_HINT}</Hint>}
    </div>
  );
}

function ListHeader({ label, count, max }: { label: string; count: number; max: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className={labelClass}>{label}</p>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-bold",
          count >= max ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary",
        )}
      >
        {count} / {max}
      </span>
    </div>
  );
}

function RowButtons({
  index,
  count,
  name,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  name: string;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" onClick={() => onMove(index - 1)} disabled={index === 0} aria-label={`Move ${name} up`} className={smallButtonClass}>
        ▲
      </button>
      <button
        type="button"
        onClick={() => onMove(index + 1)}
        disabled={index === count - 1}
        aria-label={`Move ${name} down`}
        className={smallButtonClass}
      >
        ▼
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className={cn(smallButtonClass, "text-error hover:bg-error/10 hover:text-error")}
      >
        ✕
      </button>
    </div>
  );
}

function AddButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn(secondaryButtonClass, "mt-3 h-8 px-3")}>
      {disabled ? "Maximum reached" : `+ Add ${label.toLowerCase()}`}
    </button>
  );
}
