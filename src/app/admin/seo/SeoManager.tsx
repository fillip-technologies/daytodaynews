"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updatePageSeo, updateSiteSeo } from "@/actions/seo";
import { uploadCoverImage } from "@/actions/upload";
import { SeoFields } from "@/components/admin/SeoFields";
import { Icon } from "@/components/ui/Icon";
import { socialNetworks, type SocialNetwork } from "@/config/footerNavigation";
import type { Locale } from "@/i18n/config";
import {
  articleSchemaTypes,
  defaultSiteSeo,
  LOGO_HEIGHT_LIMITS,
  type ArticleSchemaType,
  type DeveloperSettings,
  type PublisherSettings,
  type SiteSeo,
} from "@/lib/seo/site-config";
import type { SeoFieldsValue } from "@/lib/seo/validate";

type PageEntry = {
  key: string;
  path: string;
  label: string;
  translated: boolean;
  defaults: Record<Locale, { title: string | null; description: string }>;
  seo: Record<Locale, SeoFieldsValue>;
};

type Tab = "website" | "brand" | "pages" | "robots" | "tracking";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "website", label: "Website" },
  { id: "brand", label: "Brand & Credits" },
  { id: "pages", label: "Pages" },
  { id: "robots", label: "Sitemap & Robots" },
  { id: "tracking", label: "Verification & Analytics" },
];

const LANGS: Array<{ id: Locale; label: string }> = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिंदी" },
];

const card = "rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs space-y-4";
const cardTitle = "text-xs font-bold uppercase tracking-wider text-text-primary";
const label = "block text-xs font-semibold text-text-primary";
const hint = "mt-1 text-[11px] text-text-muted";
const input =
  "mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-text-primary focus:border-primary focus:outline-none";
const textarea =
  "mt-1 w-full rounded-xl border border-border bg-background p-3 text-xs leading-relaxed text-text-primary focus:border-primary focus:outline-none";

function LanguageTabs({ value, onChange }: { value: Locale; onChange: (l: Locale) => void }) {
  return (
    <div role="tablist" aria-label="Language" className="flex gap-1 rounded-lg border border-border bg-background p-1">
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          role="tab"
          aria-selected={value === l.id}
          onClick={() => onChange(l.id)}
          className={`rounded-md px-3 py-1 text-xs font-semibold ${
            value === l.id ? "bg-surface-elevated text-primary shadow-2xs" : "text-text-muted hover:text-text-primary"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function Notice({ message }: { message: { type: "success" | "error"; text: string } | null }) {
  if (!message) return null;
  return (
    <div
      role={message.type === "error" ? "alert" : "status"}
      className={`rounded-xl border p-4 text-xs font-medium ${
        message.type === "error" ? "border-error/30 bg-error/10 text-error" : "border-success/30 bg-success/10 text-success"
      }`}
    >
      {message.text}
    </div>
  );
}

const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  instagram: "Instagram",
  youtube: "YouTube",
};

const ARTICLE_TYPE_LABELS: Record<ArticleSchemaType, string> = {
  NewsArticle: "NewsArticle: news & editorial (recommended)",
  BlogPosting: "BlogPosting: blog posts",
  Article: "Article: general",
};

function Checkbox({
  checked,
  onChange,
  title,
  note,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  note: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-xs text-text-primary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 accent-primary"
      />
      <span>
        <span className="font-semibold">{title}</span>
        <span className="block text-text-muted">{note}</span>
      </span>
    </label>
  );
}

/** An image address with an Upload button (Cloudinary) and a preview. */
function ImageUrlField({
  id,
  title,
  value,
  onChange,
  onError,
  note,
  previewClassName,
  onDimensions,
}: {
  id: string;
  title: string;
  value: string;
  onChange: (url: string) => void;
  onError: (message: string) => void;
  note?: string;
  previewClassName: string;
  /** Called with the image's own pixel size whenever the preview loads. */
  onDimensions?: (width: number, height: number) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadCoverImage(formData);
    setUploading(false);
    if (res.success && res.url) onChange(res.url);
    else onError(res.error || "Upload failed.");
  }

  return (
    <div>
      <label htmlFor={id} className={label}>{title}</label>
      <div className="mt-1 flex gap-2">
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" className={`${input} mt-0`} />
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
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </div>
      {note && <p className={hint}>{note}</p>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.currentTarget;
            if (naturalWidth > 0 && naturalHeight > 0) onDimensions?.(naturalWidth, naturalHeight);
          }}
          className={`mt-2 rounded-lg border border-border ${previewClassName}`}
        />
      )}
    </div>
  );
}

/** A pixel height slider for a logo. */
function SizeSlider({
  id,
  title,
  value,
  limits,
  onChange,
}: {
  id: string;
  title: string;
  value: number;
  limits: { min: number; max: number };
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className={label}>{title}</label>
        <span className="font-mono text-[11px] text-text-muted">{value}px</span>
      </div>
      <input
        id={id}
        type="range"
        min={limits.min}
        max={limits.max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
      />
    </div>
  );
}

const pageUrl = (siteUrl: string, locale: Locale, path: string) => `${siteUrl}/${locale}${path === "/" ? "" : path}`;

export function SeoManager({ initialSite, pages }: { initialSite: SiteSeo; pages: PageEntry[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("website");
  const [site, setSite] = useState<SiteSeo>(initialSite);
  const [siteLang, setSiteLang] = useState<Locale>("en");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [pageSeo, setPageSeo] = useState<Record<string, Record<Locale, SeoFieldsValue>>>(
    Object.fromEntries(pages.map((p) => [p.key, p.seo])),
  );
  const [selectedPage, setSelectedPage] = useState(pages[0]?.key ?? "");
  const [pageLang, setPageLang] = useState<Locale>("en");

  const setLocalized = (key: "siteName" | "titleTemplate" | "defaultTitle" | "defaultDescription" | "defaultKeywords", text: string) =>
    setSite((s) => ({ ...s, [key]: { ...s[key], [siteLang]: text } }));

  async function saveSite() {
    setSaving(true);
    setMessage(null);
    const res = await updateSiteSeo(site);
    setSaving(false);
    if (res.success) {
      setMessage({ type: "success", text: "Saved. The website now uses these settings." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.error || "Could not save." });
    }
  }

  async function savePage() {
    setSaving(true);
    setMessage(null);
    const res = await updatePageSeo(selectedPage, pageSeo[selectedPage]);
    setSaving(false);
    if (res.success) {
      setMessage({ type: "success", text: "Page SEO saved." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.error || "Could not save." });
    }
  }

  const setPublisher = (patch: Partial<PublisherSettings>) =>
    setSite((s) => ({ ...s, publisher: { ...s.publisher, ...patch } }));
  const setDeveloper = (patch: Partial<DeveloperSettings>) =>
    setSite((s) => ({ ...s, developer: { ...s.developer, ...patch } }));
  const setDeveloperText = (key: "creditLabel" | "description", text: string) =>
    setSite((s) => ({ ...s, developer: { ...s.developer, [key]: { ...s.developer[key], [siteLang]: text } } }));
  const showUploadError = (text: string) => setMessage({ type: "error", text });

  const page = pages.find((p) => p.key === selectedPage);
  const isCustom = (key: string) =>
    Object.values(pageSeo[key] ?? {}).some((v) =>
      Object.entries(v).some(([, field]) => (typeof field === "boolean" ? field : Boolean(field))),
    );

  const saveButton = (
    <button
      type="button"
      onClick={tab === "pages" ? savePage : saveSite}
      disabled={saving}
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-semibold text-surface-elevated shadow-xs transition-colors hover:bg-primary-hover disabled:opacity-60"
    >
      {saving ? "Saving…" : tab === "pages" ? "Save page SEO" : "Save settings"}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">SEO</h1>
          <p className="mt-1 text-xs text-text-muted">
            How the website appears in Google and when shared. Article and category SEO is edited in their own forms.
          </p>
        </div>
        {saveButton}
      </div>

      <div role="tablist" aria-label="SEO sections" className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface-elevated p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              setMessage(null);
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold ${
              tab === t.id ? "bg-primary text-surface-elevated" : "text-text-secondary hover:bg-background"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Notice message={message} />

      {tab === "website" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={card}>
            <h2 className={cardTitle}>Website address & indexing</h2>
            <div>
              <label htmlFor="seo-site-url" className={label}>Site URL</label>
              <input
                id="seo-site-url"
                value={site.siteUrl}
                onChange={(e) => setSite((s) => ({ ...s, siteUrl: e.target.value }))}
                placeholder="https://www.daytodaynews.com"
                className={input}
              />
              <p className={hint}>The live address. Used for canonical links, share links and the sitemap.</p>
            </div>
            <label className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-xs text-text-primary">
              <input
                type="checkbox"
                checked={site.allowIndexing}
                onChange={(e) => setSite((s) => ({ ...s, allowIndexing: e.target.checked }))}
                className="mt-0.5 size-4 accent-primary"
              />
              <span>
                <span className="font-semibold">Allow search engines to index the website</span>
                <span className="block text-text-muted">Turn off only for a test/staging site.</span>
              </span>
            </label>
            {!site.allowIndexing && (
              <p className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs font-semibold text-warning">
                The whole website is hidden from Google (noindex everywhere, robots.txt blocks all, empty sitemap).
              </p>
            )}
            <div>
              <label htmlFor="seo-twitter" className={label}>X / Twitter handle</label>
              <input
                id="seo-twitter"
                value={site.twitterHandle}
                onChange={(e) => setSite((s) => ({ ...s, twitterHandle: e.target.value }))}
                placeholder="@daytodaynews"
                className={input}
              />
            </div>
            <ImageUrlField
              id="seo-og-image"
              title="Default share image (1200 × 630)"
              value={site.defaultOgImage}
              onChange={(url) => setSite((s) => ({ ...s, defaultOgImage: url }))}
              onError={showUploadError}
              note="Used when a page or article has no image of its own."
              previewClassName="aspect-[1.91/1] w-full max-w-xs object-cover"
            />
          </div>

          <div className={card}>
            <div className="flex items-center justify-between gap-3">
              <h2 className={cardTitle}>Titles & defaults</h2>
              <LanguageTabs value={siteLang} onChange={setSiteLang} />
            </div>
            <div>
              <label htmlFor="seo-site-name" className={label}>Site name</label>
              <input id="seo-site-name" lang={siteLang} value={site.siteName[siteLang]} onChange={(e) => setLocalized("siteName", e.target.value)} className={input} />
            </div>
            <div>
              <label htmlFor="seo-template" className={label}>Title format</label>
              <input id="seo-template" lang={siteLang} value={site.titleTemplate[siteLang]} onChange={(e) => setLocalized("titleTemplate", e.target.value)} className={input} />
              <p className={hint}>
                %s is replaced by the page title. Example: {site.titleTemplate[siteLang].replace("%s", "Newsletter")}
              </p>
            </div>
            <div>
              <label htmlFor="seo-default-title" className={label}>Home page title</label>
              <input id="seo-default-title" lang={siteLang} value={site.defaultTitle[siteLang]} onChange={(e) => setLocalized("defaultTitle", e.target.value)} className={input} />
              <p className={hint}>Also used for any page without a title.</p>
            </div>
            <div>
              <label htmlFor="seo-default-description" className={label}>Default description</label>
              <textarea id="seo-default-description" lang={siteLang} rows={3} value={site.defaultDescription[siteLang]} onChange={(e) => setLocalized("defaultDescription", e.target.value)} className={textarea} />
            </div>
            <div>
              <label htmlFor="seo-default-keywords" className={label}>Default keywords</label>
              <input id="seo-default-keywords" lang={siteLang} value={site.defaultKeywords[siteLang]} onChange={(e) => setLocalized("defaultKeywords", e.target.value)} placeholder="Comma-separated" className={input} />
            </div>
          </div>
        </div>
      )}

      {tab === "brand" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={card}>
            <h2 className={cardTitle}>Logo & publisher: {site.siteName.en}</h2>
            <p className="text-xs leading-relaxed text-text-secondary">
              The website&apos;s logo and size, and who publishes it: given to Google and AI assistants on every page as
              structured data (schema.org).
            </p>
            <ImageUrlField
              id="seo-publisher-logo"
              title="Site logo"
              value={site.publisher.logoUrl}
              onChange={(url) => setPublisher({ logoUrl: url })}
              onError={showUploadError}
              onDimensions={(width, height) => setPublisher({ logoWidth: width, logoHeight: height })}
              note="Header, footer, Google and RSS readers. A transparent PNG or WebP works best; a path like /brand/logo.png also works. Empty restores the original logo."
              previewClassName="h-14 w-auto max-w-full bg-background object-contain p-2"
            />
            <div className="space-y-4 rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-semibold text-text-primary">Logo size</h3>
                <button
                  type="button"
                  onClick={() => setPublisher({ logoSize: defaultSiteSeo.publisher.logoSize })}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Reset sizes
                </button>
              </div>
              <SizeSlider
                id="seo-logo-header"
                title="Header (tablet & desktop)"
                value={site.publisher.logoSize.header}
                limits={LOGO_HEIGHT_LIMITS.header}
                onChange={(header) => setPublisher({ logoSize: { ...site.publisher.logoSize, header } })}
              />
              <SizeSlider
                id="seo-logo-header-mobile"
                title="Header (phone)"
                value={site.publisher.logoSize.headerMobile}
                limits={LOGO_HEIGHT_LIMITS.headerMobile}
                onChange={(headerMobile) => setPublisher({ logoSize: { ...site.publisher.logoSize, headerMobile } })}
              />
              <SizeSlider
                id="seo-logo-footer"
                title="Footer"
                value={site.publisher.logoSize.footer}
                limits={LOGO_HEIGHT_LIMITS.footer}
                onChange={(footer) => setPublisher({ logoSize: { ...site.publisher.logoSize, footer } })}
              />
              <p className={hint}>Heights in pixels; the width follows the logo&apos;s shape. Header sizes are capped so the logo fits the header bar.</p>
              {site.publisher.logoUrl && (
                <div className="space-y-2">
                  {[
                    { label: "Header", height: site.publisher.logoSize.header, bar: "h-[4.5rem]" },
                    { label: "Phone", height: site.publisher.logoSize.headerMobile, bar: "h-16" },
                    { label: "Footer", height: site.publisher.logoSize.footer, bar: "py-3" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className="w-12 shrink-0 text-[11px] text-text-muted">{row.label}</span>
                      <div className={`flex min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-border bg-surface px-3 ${row.bar}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={site.publisher.logoUrl} alt="" style={{ height: row.height }} className="w-auto max-w-full object-contain" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="seo-publisher-email" className={label}>Contact email</label>
                <input
                  id="seo-publisher-email"
                  type="email"
                  value={site.publisher.email}
                  onChange={(e) => setPublisher({ email: e.target.value })}
                  placeholder="editor@daytodaynews.com"
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="seo-publisher-founded" className={label}>Founded</label>
                <input
                  id="seo-publisher-founded"
                  value={site.publisher.foundingDate}
                  onChange={(e) => setPublisher({ foundingDate: e.target.value })}
                  placeholder="2025 or 2025-01-15"
                  className={input}
                />
              </div>
            </div>
            <div>
              <label htmlFor="seo-article-type" className={label}>Article type for search engines</label>
              <select
                id="seo-article-type"
                value={site.publisher.articleType}
                onChange={(e) => setPublisher({ articleType: e.target.value as ArticleSchemaType })}
                className={input}
              >
                {articleSchemaTypes.map((type) => (
                  <option key={type} value={type}>{ARTICLE_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </div>
            <fieldset className="space-y-2">
              <legend className={label}>Social profiles</legend>
              <p className={hint}>Shown as icons in the footer. Leave a network empty to hide it.</p>
              {socialNetworks.map((network) => (
                <div key={network} className="flex items-center gap-3">
                  <label htmlFor={`seo-social-${network}`} className="w-24 shrink-0 text-xs text-text-secondary">
                    {SOCIAL_LABELS[network]}
                  </label>
                  <input
                    id={`seo-social-${network}`}
                    value={site.publisher.socials[network]}
                    onChange={(e) => setPublisher({ socials: { ...site.publisher.socials, [network]: e.target.value } })}
                    placeholder="https://…"
                    className={`${input} mt-0`}
                  />
                </div>
              ))}
            </fieldset>
            <div>
              <label htmlFor="seo-publisher-sameas" className={label}>Other official profiles</label>
              <textarea
                id="seo-publisher-sameas"
                rows={3}
                value={site.publisher.sameAs.join("\n")}
                onChange={(e) => setPublisher({ sameAs: e.target.value.split("\n") })}
                placeholder={"https://www.facebook.com/…\nhttps://news.google.com/publications/…"}
                className={`${textarea} font-mono`}
              />
              <p className={hint}>One https:// address per line (Facebook, Google News, Crunchbase…). Not shown on the site.</p>
            </div>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between gap-3">
              <h2 className={cardTitle}>Designed & managed by</h2>
              <LanguageTabs value={siteLang} onChange={setSiteLang} />
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              The company named as the website&apos;s creator and maintainer in structured data, page tags and
              llms.txt, plus the visible credits below. Clear the name to remove it everywhere.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="seo-dev-name" className={label}>Company name</label>
                <input
                  id="seo-dev-name"
                  value={site.developer.name}
                  onChange={(e) => setDeveloper({ name: e.target.value })}
                  placeholder="Fillip Technologies"
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="seo-dev-url" className={label}>Company website</label>
                <input
                  id="seo-dev-url"
                  value={site.developer.url}
                  onChange={(e) => setDeveloper({ url: e.target.value })}
                  placeholder="https://filliptechnologies.com/"
                  className={input}
                />
              </div>
            </div>
            <ImageUrlField
              id="seo-dev-logo"
              title="Company logo"
              value={site.developer.logoUrl}
              onChange={(url) => setDeveloper({ logoUrl: url })}
              onError={showUploadError}
              note="Wide logo with a transparent background, readable on a light footer. Empty shows the name as text."
              previewClassName="h-10 w-auto max-w-full bg-background object-contain p-1.5"
            />
            <SizeSlider
              id="seo-dev-logo-height"
              title="Logo height in the footer credit"
              value={site.developer.logoHeight}
              limits={LOGO_HEIGHT_LIMITS.credit}
              onChange={(logoHeight) => setDeveloper({ logoHeight })}
            />
            <div>
              <label htmlFor="seo-dev-label" className={label}>Credit text</label>
              <input
                id="seo-dev-label"
                lang={siteLang}
                value={site.developer.creditLabel[siteLang]}
                onChange={(e) => setDeveloperText("creditLabel", e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label htmlFor="seo-dev-description" className={label}>About the company</label>
              <textarea
                id="seo-dev-description"
                lang={siteLang}
                rows={3}
                value={site.developer.description[siteLang]}
                onChange={(e) => setDeveloperText("description", e.target.value)}
                className={textarea}
              />
              <p className={hint}>Shown on the About page (English) and given to search engines and AI assistants.</p>
            </div>
            <div>
              <label htmlFor="seo-dev-sameas" className={label}>Company profiles</label>
              <textarea
                id="seo-dev-sameas"
                rows={4}
                value={site.developer.sameAs.join("\n")}
                onChange={(e) => setDeveloper({ sameAs: e.target.value.split("\n") })}
                placeholder="https://linkedin.com/company/…"
                className={`${textarea} font-mono`}
              />
              <p className={hint}>One https:// address per line. Links the company&apos;s profiles to it for search engines.</p>
            </div>
            <div className="space-y-2">
              <Checkbox
                checked={site.developer.showInFooter}
                onChange={(checked) => setDeveloper({ showInFooter: checked })}
                title="Show the credit in the footer"
                note="On every page, next to the copyright line."
              />
              <Checkbox
                checked={site.developer.showOnAbout}
                onChange={(checked) => setDeveloper({ showOnAbout: checked })}
                title="Show a section on the About page"
                note="Credit text, company name, description and a link to its website."
              />
              <Checkbox
                checked={site.developer.ownsSite}
                onChange={(checked) => setDeveloper({ ownsSite: checked })}
                title={`This company owns ${site.siteName.en}`}
                note="Marks it as the parent organization of the publication in structured data."
              />
            </div>
            {site.developer.showInFooter && site.developer.name && (
              <div className="rounded-xl border border-dashed border-border bg-background p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Footer preview</p>
                <div className="mt-2 flex items-center gap-2.5 text-sm text-text-muted">
                  {site.developer.creditLabel[siteLang]}
                  {site.developer.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={site.developer.logoUrl}
                      alt={site.developer.name}
                      style={{ height: site.developer.logoHeight }}
                      className="w-auto max-w-full object-contain"
                    />
                  ) : (
                    <span className="font-semibold text-text-primary">{site.developer.name}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "pages" && page && (
        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <nav aria-label="Pages" className="rounded-2xl border border-border bg-surface-elevated p-2 shadow-2xs">
            <ul className="space-y-0.5">
              {pages.map((p) => (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPage(p.key);
                      setMessage(null);
                    }}
                    aria-current={p.key === selectedPage ? "page" : undefined}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs ${
                      p.key === selectedPage ? "bg-primary/10 font-semibold text-primary" : "text-text-secondary hover:bg-background"
                    }`}
                  >
                    <span>
                      {p.label}
                      <span className="block font-mono text-[10px] text-text-muted">{p.path}</span>
                    </span>
                    {isCustom(p.key) && (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">Custom</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className={cardTitle}>{page.label}</h2>
                <a
                  href={pageUrl("", pageLang, page.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  Open page <Icon name="arrowRight" className="size-3" />
                </a>
              </div>
              <LanguageTabs value={pageLang} onChange={setPageLang} />
            </div>
            {!page.translated && pageLang === "hi" && (
              <p className="rounded-xl border border-border bg-background p-3 text-[11px] text-text-muted">
                This page&apos;s text is English-only, so Google is pointed at the English version. Hindi SEO here is used only
                on the Hindi copy of the page.
              </p>
            )}
            <SeoFields
              key={`${page.key}-${pageLang}`}
              value={pageSeo[page.key][pageLang]}
              onChange={(next) =>
                setPageSeo((all) => ({ ...all, [page.key]: { ...all[page.key], [pageLang]: next } }))
              }
              auto={{
                title: page.defaults[pageLang].title ?? site.defaultTitle[pageLang],
                description: page.defaults[pageLang].description,
                image: site.defaultOgImage || undefined,
              }}
              titleTemplate={page.defaults[pageLang].title ? site.titleTemplate[pageLang] : "%s"}
              url={pageUrl(site.siteUrl, pageLang, page.path)}
              lang={pageLang}
            />
          </div>
        </div>
      )}

      {tab === "robots" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={card}>
            <h2 className={cardTitle}>robots.txt</h2>
            <p className="text-xs text-text-secondary">Always blocked: /admin, /api/, /en/search, /hi/search.</p>
            <div>
              <label htmlFor="seo-disallow" className={label}>Also block these paths (one per line)</label>
              <textarea
                id="seo-disallow"
                rows={6}
                value={site.robotsDisallow.join("\n")}
                onChange={(e) => setSite((s) => ({ ...s, robotsDisallow: e.target.value.split("\n") }))}
                placeholder={"/en/private-page\n/hi/private-page"}
                className={`${textarea} font-mono`}
              />
              <p className={hint}>Each line must start with /. To hide a single page, prefer its &quot;Hide from search engines&quot; option.</p>
            </div>
          </div>
          <div className={card}>
            <h2 className={cardTitle}>Sitemap</h2>
            <p className="text-xs leading-relaxed text-text-secondary">
              Built automatically from all published articles, categories and pages in both languages. Pages marked
              &quot;Hide from search engines&quot; are left out. Submit this address in Google Search Console:
            </p>
            <p className="rounded-xl bg-background p-3 font-mono text-xs text-text-primary">{site.siteUrl}/sitemap.xml</p>
            <div className="flex flex-wrap gap-2">
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-xl border border-border px-3 text-xs font-semibold text-primary hover:bg-primary/5">
                Open sitemap.xml
              </a>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-xl border border-border px-3 text-xs font-semibold text-primary hover:bg-primary/5">
                Open robots.txt
              </a>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              Also built automatically: a Google News sitemap (articles from the last 2 days, listed in robots.txt), an
              RSS feed per language for readers and news aggregators, and llms.txt, a summary for AI assistants.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { href: "/news-sitemap.xml", text: "News sitemap" },
                { href: "/en/feed.xml", text: "RSS (English)" },
                { href: "/hi/feed.xml", text: "RSS (हिंदी)" },
                { href: "/llms.txt", text: "llms.txt" },
              ].map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-xl border border-border px-3 text-xs font-semibold text-primary hover:bg-primary/5">
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "tracking" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={card}>
            <h2 className={cardTitle}>Search engine verification</h2>
            <div>
              <label htmlFor="seo-google" className={label}>Google Search Console</label>
              <input
                id="seo-google"
                value={site.verification.google}
                onChange={(e) => setSite((s) => ({ ...s, verification: { ...s.verification, google: e.target.value } }))}
                placeholder="Only the content value of the meta tag"
                className={input}
              />
              <p className={hint}>From the &quot;HTML tag&quot; method: paste only the code inside content=&quot;…&quot;.</p>
            </div>
            <div>
              <label htmlFor="seo-bing" className={label}>Bing Webmaster Tools</label>
              <input
                id="seo-bing"
                value={site.verification.bing}
                onChange={(e) => setSite((s) => ({ ...s, verification: { ...s.verification, bing: e.target.value } }))}
                placeholder="msvalidate.01 code"
                className={input}
              />
            </div>
          </div>
          <div className={card}>
            <h2 className={cardTitle}>Analytics</h2>
            <div>
              <label htmlFor="seo-ga" className={label}>Google Analytics 4 measurement ID</label>
              <input
                id="seo-ga"
                value={site.analytics.gaId}
                onChange={(e) => setSite((s) => ({ ...s, analytics: { ...s.analytics, gaId: e.target.value } }))}
                placeholder="G-XXXXXXXXXX"
                className={input}
              />
            </div>
            <div>
              <label htmlFor="seo-gtm" className={label}>Google Tag Manager container ID</label>
              <input
                id="seo-gtm"
                value={site.analytics.gtmId}
                onChange={(e) => setSite((s) => ({ ...s, analytics: { ...s.analytics, gtmId: e.target.value } }))}
                placeholder="GTM-XXXXXXX"
                className={input}
              />
              <p className={hint}>Use one of the two (Tag Manager can load Analytics itself). Scripts load only on the public site.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
