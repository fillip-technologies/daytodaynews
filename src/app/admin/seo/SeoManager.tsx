"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updatePageSeo, updateSiteSeo } from "@/actions/seo";
import { uploadCoverImage } from "@/actions/upload";
import { SeoFields } from "@/components/admin/SeoFields";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/i18n/config";
import type { SiteSeo } from "@/lib/seo/site-config";
import type { SeoFieldsValue } from "@/lib/seo/validate";

type PageEntry = {
  key: string;
  path: string;
  label: string;
  translated: boolean;
  defaults: Record<Locale, { title: string | null; description: string }>;
  seo: Record<Locale, SeoFieldsValue>;
};

type Tab = "website" | "pages" | "robots" | "tracking";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "website", label: "Website" },
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

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function uploadDefaultImage(file: File) {
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadCoverImage(formData);
    setUploading(false);
    if (res.success && res.url) setSite((s) => ({ ...s, defaultOgImage: res.url! }));
    else setMessage({ type: "error", text: res.error || "Upload failed." });
  }

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
            <div>
              <label htmlFor="seo-og-image" className={label}>Default share image (1200 × 630)</label>
              <div className="mt-1 flex gap-2">
                <input
                  id="seo-og-image"
                  value={site.defaultOgImage}
                  onChange={(e) => setSite((s) => ({ ...s, defaultOgImage: e.target.value }))}
                  placeholder="https://…"
                  className={`${input} mt-0`}
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
                    if (file) uploadDefaultImage(file);
                    e.target.value = "";
                  }}
                />
              </div>
              <p className={hint}>Used when a page or article has no image of its own.</p>
              {site.defaultOgImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={site.defaultOgImage} alt="" className="mt-2 aspect-[1.91/1] w-full max-w-xs rounded-lg border border-border object-cover" />
              )}
            </div>
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
