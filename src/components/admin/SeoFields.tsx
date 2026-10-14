"use client";

import { useId, useRef, useState } from "react";
import { uploadCoverImage } from "@/actions/upload";
import { Icon } from "@/components/ui/Icon";
import type { SeoFieldsValue } from "@/lib/seo/validate";

// Editor for one page's SEO in one language, shared by articles, categories
// and fixed pages. Empty fields fall back to the automatic values shown as
// placeholders; the previews show exactly what will be used.

type SeoFieldsProps = {
  value: SeoFieldsValue;
  onChange: (next: SeoFieldsValue) => void;
  /** Used when a field is left empty: the page's own title, summary and image. */
  auto: { title: string; description: string; image?: string };
  /** Title format for automatic titles, e.g. "%s — DayTodayNews". */
  titleTemplate: string;
  /** Public URL of the page, for the previews. */
  url: string;
  lang?: string;
};

const TITLE_GUIDE = 60;
const DESCRIPTION_GUIDE = 160;

const inputClass =
  "mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-text-primary focus:border-primary focus:outline-none";
const textareaClass =
  "mt-1 w-full rounded-xl border border-border bg-background p-3 text-xs leading-relaxed text-text-primary focus:border-primary focus:outline-none";
const labelClass = "flex items-center justify-between text-xs font-semibold text-text-primary";

function Counter({ length, guide }: { length: number; guide: number }) {
  const over = length > guide;
  return (
    <span className={`text-[11px] font-medium tabular-nums ${over ? "text-warning" : "text-text-muted"}`}>
      {length} / ~{guide}
      {over ? " · may be cut off in Google" : ""}
    </span>
  );
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function SeoFields({ value, onChange, auto, titleTemplate, url, lang }: SeoFieldsProps) {
  const id = useId();
  const [showSocial, setShowSocial] = useState(Boolean(value.ogTitle || value.ogDescription || value.ogImage));
  const [showAdvanced, setShowAdvanced] = useState(Boolean(value.canonicalUrl || value.noIndex || value.noFollow));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof SeoFieldsValue>(key: K, next: SeoFieldsValue[K]) => onChange({ ...value, [key]: next });

  const autoTitle = auto.title ? titleTemplate.replace("%s", auto.title) : "";
  const title = value.metaTitle || autoTitle;
  const description = value.metaDescription || auto.description;
  const shareTitle = value.ogTitle || value.metaTitle || auto.title;
  const shareDescription = value.ogDescription || description;
  const shareImage = value.ogImage || auto.image || "";
  // Google shows the URL as "host › segment › segment".
  const displayUrl = (() => {
    try {
      const u = new URL(value.canonicalUrl || url);
      const segments = u.pathname.split("/").filter(Boolean);
      return [u.host, ...segments].join(" › ");
    } catch {
      return url;
    }
  })();

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadCoverImage(formData);
    if (res.success && res.url) set("ogImage", res.url);
    else setUploadError(res.error || "Upload failed.");
    setUploading(false);
  }

  return (
    <div className="space-y-4">
      {/* Google result preview */}
      <div className="rounded-xl border border-border bg-surface-elevated p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Google preview</p>
        <p className="mt-2 truncate text-xs text-text-secondary">{displayUrl}</p>
        <p className="mt-0.5 text-base leading-snug text-primary" lang={lang}>
          {truncate(title || "(page title)", TITLE_GUIDE + 5)}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary" lang={lang}>
          {truncate(description || "(description)", DESCRIPTION_GUIDE + 5)}
        </p>
        {(value.noIndex || value.noFollow) && (
          <p className="mt-2 text-[11px] font-semibold text-warning">
            {value.noIndex ? "Hidden from Google (noindex)" : ""}
            {value.noIndex && value.noFollow ? " · " : ""}
            {value.noFollow ? "Links not followed (nofollow)" : ""}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-title`} className={labelClass}>
          Meta title
          <Counter length={title.length} guide={TITLE_GUIDE} />
        </label>
        <input
          id={`${id}-title`}
          lang={lang}
          value={value.metaTitle}
          onChange={(e) => set("metaTitle", e.target.value)}
          placeholder={autoTitle ? `Automatic: ${autoTitle}` : "Page title shown in Google"}
          maxLength={255}
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-text-muted">Used exactly as written (the site name is not added).</p>
      </div>

      <div>
        <label htmlFor={`${id}-description`} className={labelClass}>
          Meta description
          <Counter length={description.length} guide={DESCRIPTION_GUIDE} />
        </label>
        <textarea
          id={`${id}-description`}
          lang={lang}
          rows={3}
          value={value.metaDescription}
          onChange={(e) => set("metaDescription", e.target.value)}
          placeholder={auto.description ? `Automatic: ${auto.description}` : "One or two sentences that make people click"}
          maxLength={1000}
          className={textareaClass}
        />
      </div>

      <div>
        <label htmlFor={`${id}-keywords`} className={labelClass}>
          Keywords
        </label>
        <input
          id={`${id}-keywords`}
          lang={lang}
          value={value.keywords}
          onChange={(e) => set("keywords", e.target.value)}
          placeholder="e.g. AI automation, n8n, workflow"
          maxLength={1000}
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-text-muted">Comma-separated. Google ignores this tag; some other engines use it.</p>
      </div>

      {/* Social sharing */}
      <div className="rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setShowSocial((v) => !v)}
          aria-expanded={showSocial}
          className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-primary"
        >
          Social sharing (Facebook, LinkedIn, X, WhatsApp)
          <Icon name="chevronDown" className={`size-4 transition-transform ${showSocial ? "rotate-180" : ""}`} />
        </button>
        {showSocial && (
          <div className="space-y-4 border-t border-border p-4">
            <div className="max-w-md overflow-hidden rounded-xl border border-border bg-surface-elevated">
              <div className="aspect-[1.91/1] bg-background">
                {shareImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={shareImage} alt="" className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-[11px] text-text-muted">
                    No image: add one here or set a default share image in SEO → Website
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-[11px] uppercase text-text-muted">{displayUrl.split(" › ")[0]}</p>
                <p className="truncate text-sm font-semibold text-text-primary" lang={lang}>
                  {shareTitle || "(title)"}
                </p>
                <p className="line-clamp-2 text-xs text-text-secondary" lang={lang}>
                  {shareDescription || "(description)"}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor={`${id}-og-title`} className={labelClass}>
                Share title
              </label>
              <input
                id={`${id}-og-title`}
                lang={lang}
                value={value.ogTitle}
                onChange={(e) => set("ogTitle", e.target.value)}
                placeholder={shareTitle ? `Automatic: ${shareTitle}` : ""}
                maxLength={255}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`${id}-og-description`} className={labelClass}>
                Share description
              </label>
              <textarea
                id={`${id}-og-description`}
                lang={lang}
                rows={2}
                value={value.ogDescription}
                onChange={(e) => set("ogDescription", e.target.value)}
                placeholder={description ? `Automatic: ${description}` : ""}
                maxLength={1000}
                className={textareaClass}
              />
            </div>
            <div>
              <label htmlFor={`${id}-og-image`} className={labelClass}>
                Share image (1200 × 630 recommended)
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id={`${id}-og-image`}
                  value={value.ogImage}
                  onChange={(e) => set("ogImage", e.target.value)}
                  placeholder={auto.image ? "Automatic: the cover image" : "https://…"}
                  maxLength={2048}
                  className={`${inputClass} mt-0`}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="h-10 shrink-0 rounded-xl border border-border px-3 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Upload"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>
              {uploadError && <p className="mt-1 text-[11px] font-medium text-error">{uploadError}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Advanced */}
      <div className="rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-primary"
        >
          Advanced (canonical, indexing)
          <Icon name="chevronDown" className={`size-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
        </button>
        {showAdvanced && (
          <div className="space-y-4 border-t border-border p-4">
            <div>
              <label htmlFor={`${id}-canonical`} className={labelClass}>
                Canonical URL
              </label>
              <input
                id={`${id}-canonical`}
                value={value.canonicalUrl}
                onChange={(e) => set("canonicalUrl", e.target.value)}
                placeholder={`Automatic: ${url}`}
                maxLength={2048}
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-text-muted">
                Only if this content is a copy of another page. Leave empty in almost all cases.
              </p>
            </div>
            <label className="flex items-start gap-3 text-xs text-text-primary">
              <input
                type="checkbox"
                checked={value.noIndex}
                onChange={(e) => set("noIndex", e.target.checked)}
                className="mt-0.5 size-4 accent-primary"
              />
              <span>
                <span className="font-semibold">Hide from search engines (noindex)</span>
                <span className="block text-text-muted">The page stays online but is removed from Google and the sitemap.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-xs text-text-primary">
              <input
                type="checkbox"
                checked={value.noFollow}
                onChange={(e) => set("noFollow", e.target.checked)}
                className="mt-0.5 size-4 accent-primary"
              />
              <span>
                <span className="font-semibold">Don&apos;t follow links on this page (nofollow)</span>
                <span className="block text-text-muted">Rarely needed.</span>
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
