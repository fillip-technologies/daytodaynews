"use client";

import { useRef, useState } from "react";
import { uploadDocument } from "@/actions/upload";
import { countLinks, countWords, EXTRA_LIMITS, type FaqItem, type ResourceLink } from "@/lib/article-extras";
import { cn } from "@/lib/cn";
import { SCHEDULING_ENABLED } from "@/lib/visibility";

// Panels of the article editor for the editorial framework of the 90-day plan:
// focus keyword, key takeaways, FAQs, article type (guest / sponsored), topic
// clusters, directory listings, downloads, publish date and the SEO checklist.

const card = "rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs space-y-4";
const heading = "text-xs font-bold uppercase tracking-wider text-text-primary";
const label = "block text-xs font-medium text-text-primary";
const help = "mt-1 text-[11px] text-text-muted";
const input =
  "mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-text-primary focus:border-primary focus:outline-none";
const textarea =
  "mt-1 w-full rounded-xl border border-border bg-background p-3 text-xs leading-relaxed text-text-primary focus:border-primary focus:outline-none";
const smallButton =
  "inline-flex h-8 items-center rounded-lg border border-border bg-background px-3 text-[11px] font-semibold text-text-secondary hover:border-primary/40 hover:text-primary disabled:opacity-50";

export type Option = { value: string; label: string };

/* ------------------------------------------------------------------ */
/* Focus keyword, key takeaways and FAQs (per language)                */
/* ------------------------------------------------------------------ */

export function FrameworkFields({
  language,
  focusKeyword,
  onFocusKeyword,
  takeaways,
  onTakeaways,
  faq,
  onFaq,
}: {
  language: "en" | "hi";
  focusKeyword: string;
  onFocusKeyword: (value: string) => void;
  takeaways: string;
  onTakeaways: (value: string) => void;
  faq: FaqItem[];
  onFaq: (value: FaqItem[]) => void;
}) {
  const takeawayCount = takeaways.split("\n").filter((l) => l.trim()).length;
  const lang = language === "hi" ? " (हिंदी)" : "";
  return (
    <div className={card}>
      <div>
        <h2 className={heading}>Editorial framework{lang}</h2>
        <p className={help}>
          Every article: one focus keyword, 4–6 key takeaways near the top, and 5–8 FAQs that answer real searches.
        </p>
      </div>

      <div>
        <label className={label} htmlFor={`focus-${language}`}>
          Focus keyword{lang}
        </label>
        <input
          id={`focus-${language}`}
          lang={language}
          value={focusKeyword}
          maxLength={EXTRA_LIMITS.focusKeyword}
          onChange={(e) => onFocusKeyword(e.target.value)}
          placeholder={language === "en" ? "e.g. AI workflow automation" : "उदाहरण: AI वर्कफ़्लो ऑटोमेशन"}
          className={input}
        />
        <p className={help}>The one search this article should rank for. Secondary keywords go in the SEO card below.</p>
      </div>

      <div>
        <label className={label} htmlFor={`takeaways-${language}`}>
          Key takeaways{lang} <span className="text-text-muted">· {takeawayCount} of 4–6</span>
        </label>
        <textarea
          id={`takeaways-${language}`}
          lang={language}
          rows={5}
          value={takeaways}
          onChange={(e) => onTakeaways(e.target.value)}
          placeholder="One point per line"
          className={textarea}
        />
      </div>

      <div>
        <p className={label}>
          FAQs{lang} <span className="text-text-muted">· {faq.filter((f) => f.q.trim() && f.a.trim()).length} of 5–8</span>
        </p>
        <p className={help}>Shown at the end of the article and given to Google as FAQ structured data.</p>
        <ol className="mt-2 space-y-3">
          {faq.map((item, index) => (
            <li key={index} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-text-secondary">Question {index + 1}</span>
                <button
                  type="button"
                  onClick={() => onFaq(faq.filter((_, i) => i !== index))}
                  className="text-[11px] font-semibold text-error hover:opacity-80"
                >
                  Remove
                </button>
              </div>
              <input
                lang={language}
                value={item.q}
                maxLength={EXTRA_LIMITS.question}
                onChange={(e) => onFaq(faq.map((f, i) => (i === index ? { ...f, q: e.target.value } : f)))}
                placeholder="Question"
                className={input}
              />
              <textarea
                lang={language}
                rows={3}
                value={item.a}
                maxLength={EXTRA_LIMITS.answer}
                onChange={(e) => onFaq(faq.map((f, i) => (i === index ? { ...f, a: e.target.value } : f)))}
                placeholder="Answer (plain text)"
                className={textarea}
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          disabled={faq.length >= EXTRA_LIMITS.faq}
          onClick={() => onFaq([...faq, { q: "", a: "" }])}
          className={cn(smallButton, "mt-3")}
        >
          + Add question
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Publish date / scheduling                                            */
/* ------------------------------------------------------------------ */

/** "2026-11-12T09:30" in the browser's time zone, for <input type="datetime-local">. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function PublishDateField({ value, onChange, status }: { value: string; onChange: (value: string) => void; status: string }) {
  const [now] = useState(() => Date.now());
  const date = value ? new Date(value) : null;
  const future = status === "PUBLISHED" && date !== null && date.getTime() > now;
  const scheduled = SCHEDULING_ENABLED && future;
  return (
    <div>
      <label className={label} htmlFor="publish-date">
        Publish date &amp; time
      </label>
      <input
        id="publish-date"
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={input}
      />
      <p className={help}>
        {scheduled
          ? `⏰ Scheduled: goes live on ${date!.toLocaleString()} (your time zone). Until then only staff can see it.`
          : SCHEDULING_ENABLED
            ? "Empty: now. A future date schedules the article; it appears on the site within a few minutes of that time."
            : future
              ? "This date is in the future. Scheduling is off, so the article is live now and shows this date."
              : "Empty: now. The date shown on the article."}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Article type: editorial, guest contribution or sponsored             */
/* ------------------------------------------------------------------ */

export function ArticleTypeCard({
  articleType,
  onArticleType,
  sponsorName,
  onSponsorName,
  sponsorUrl,
  onSponsorUrl,
}: {
  articleType: string;
  onArticleType: (value: string) => void;
  sponsorName: string;
  onSponsorName: (value: string) => void;
  sponsorUrl: string;
  onSponsorUrl: (value: string) => void;
}) {
  return (
    <div className={card}>
      <h2 className={heading}>Article type</h2>
      <select value={articleType} onChange={(e) => onArticleType(e.target.value)} className={input} aria-label="Article type">
        <option value="EDITORIAL">Editorial (our own article)</option>
        <option value="GUEST">Guest contribution (expert-written)</option>
        <option value="SPONSORED">Sponsored (paid by a brand)</option>
      </select>
      {articleType === "GUEST" && (
        <p className={help}>Labelled &quot;Guest contribution&quot; and listed under Guest Contributors.</p>
      )}
      {articleType === "SPONSORED" && (
        <>
          <p className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-[11px] text-warning">
            Labelled &quot;Sponsored&quot; with a disclosure, listed under Sponsored Insights, and every link to another
            website gets rel=&quot;sponsored&quot;. Never promise advertisers ranking or dofollow links.
          </p>
          <div>
            <label className={label} htmlFor="sponsor-name">
              Sponsor name (required)
            </label>
            <input id="sponsor-name" value={sponsorName} onChange={(e) => onSponsorName(e.target.value)} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="sponsor-url">
              Sponsor website
            </label>
            <input
              id="sponsor-url"
              value={sponsorUrl}
              onChange={(e) => onSponsorUrl(e.target.value)}
              placeholder="https://"
              className={input}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Topic cluster: pillar guide and supporting articles                  */
/* ------------------------------------------------------------------ */

export function ClusterCard({
  isPillar,
  onIsPillar,
  pillarSlug,
  onPillarSlug,
  pillars,
  currentSlug,
}: {
  isPillar: boolean;
  onIsPillar: (value: boolean) => void;
  pillarSlug: string;
  onPillarSlug: (value: string) => void;
  pillars: Option[];
  currentSlug: string;
}) {
  const choices = pillars.filter((p) => p.value !== currentSlug);
  return (
    <div className={card}>
      <h2 className={heading}>Topic cluster</h2>
      <label className="flex items-start gap-3 text-xs font-medium text-text-primary">
        <input
          type="checkbox"
          checked={isPillar}
          onChange={(e) => onIsPillar(e.target.checked)}
          className="mt-0.5 size-4 rounded accent-primary"
        />
        <span>
          This is a pillar guide
          <span className={cn(help, "block")}>A complete guide; its supporting articles are listed on it.</span>
        </span>
      </label>
      {!isPillar && (
        <div>
          <label className={label} htmlFor="pillar-slug">
            Part of pillar guide
          </label>
          <select id="pillar-slug" value={pillarSlug} onChange={(e) => onPillarSlug(e.target.value)} className={input}>
            <option value="">None</option>
            {choices.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <p className={help}>The article links to its pillar and to the other articles of the series.</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Related directory listings                                           */
/* ------------------------------------------------------------------ */

export function ListingsCard({ value, onChange, listings }: { value: string[]; onChange: (value: string[]) => void; listings: Option[] }) {
  const [pick, setPick] = useState("");
  const bySlug = new Map(listings.map((l) => [l.value, l.label]));
  return (
    <div className={card}>
      <div>
        <h2 className={heading}>Companies &amp; tools</h2>
        <p className={help}>Approved directory listings shown under the article, with their Featured / Verified labels.</p>
      </div>
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((slug) => (
            <li key={slug} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs">
              <span className="truncate">{bySlug.get(slug) ?? `${slug} (not approved)`}</span>
              <button type="button" onClick={() => onChange(value.filter((s) => s !== slug))} className="text-error">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      {listings.length === 0 ? (
        <p className={help}>No approved listings yet (Admin → Directory).</p>
      ) : (
        <div className="flex gap-2">
          <select value={pick} onChange={(e) => setPick(e.target.value)} className={input} aria-label="Listing to add">
            <option value="">Add a listing…</option>
            {listings
              .filter((l) => !value.includes(l.value))
              .map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
          </select>
          <button
            type="button"
            disabled={!pick || value.length >= EXTRA_LIMITS.listings}
            onClick={() => {
              onChange([...value, pick]);
              setPick("");
            }}
            className={cn(smallButton, "mt-1 h-10")}
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Downloads (PDF checklists, resources)                                */
/* ------------------------------------------------------------------ */

export function DownloadsCard({ value, onChange }: { value: ResourceLink[]; onChange: (value: ResourceLink[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadDocument(formData).catch(() => null);
    setUploading(false);
    if (res?.success && res.url) {
      onChange([...value, { label: file.name.replace(/\.pdf$/i, "").replace(/[-_]+/g, " "), url: res.url }]);
    } else {
      setError(res?.error ?? "Upload failed.");
    }
  }

  return (
    <div className={card}>
      <div>
        <h2 className={heading}>Downloads</h2>
        <p className={help}>Checklists, templates or reports readers can download (PDF upload or any link).</p>
      </div>
      {value.map((item, index) => (
        <div key={index} className="space-y-1.5 rounded-xl border border-border bg-background p-3">
          <input
            value={item.label}
            onChange={(e) => onChange(value.map((v, i) => (i === index ? { ...v, label: e.target.value } : v)))}
            placeholder="Name, e.g. AI automation checklist"
            className={input}
          />
          <input
            value={item.url}
            onChange={(e) => onChange(value.map((v, i) => (i === index ? { ...v, url: e.target.value } : v)))}
            placeholder="https://… or /path"
            className={input}
          />
          <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="text-[11px] font-semibold text-error">
            Remove
          </button>
        </div>
      ))}
      {error && <p className="text-[11px] text-error">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={value.length >= EXTRA_LIMITS.resources}
          onClick={() => onChange([...value, { label: "", url: "" }])}
          className={smallButton}
        >
          + Add link
        </button>
        <button
          type="button"
          disabled={uploading || value.length >= EXTRA_LIMITS.resources}
          onClick={() => fileRef.current?.click()}
          className={smallButton}
        >
          {uploading ? "Uploading…" : "Upload PDF"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SEO checklist (the plan's 14 requirements, checked live)             */
/* ------------------------------------------------------------------ */

const lengthTargets: Record<string, [number, number]> = {
  news: [500, 900],
  explainer: [1200, 1800],
  howto: [1500, 2200],
  comparison: [1800, 2500],
  report: [2000, 3000],
  guide: [2500, 3500],
  sponsored: [1000, 1500],
};

const lengthLabels: Record<string, string> = {
  news: "News (500–900)",
  explainer: "Explainer (1,200–1,800)",
  howto: "How-to guide (1,500–2,200)",
  comparison: "Comparison (1,800–2,500)",
  report: "Industry report (2,000–3,000)",
  guide: "Ultimate guide (2,500–3,500)",
  sponsored: "Sponsored (1,000–1,500)",
};

export function SeoChecklist({
  title,
  slug,
  description,
  content,
  focusKeyword,
  metaTitle,
  metaDescription,
  keywords,
  imageUrl,
  imageAlt,
  takeawayCount,
  faqCount,
  siteHost,
  articleType,
}: {
  title: string;
  slug: string;
  description: string;
  content: string;
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  imageUrl: string;
  imageAlt: string;
  takeawayCount: number;
  faqCount: number;
  siteHost: string;
  articleType: string;
}) {
  const [kind, setKind] = useState(articleType === "SPONSORED" ? "sponsored" : "howto");
  const kw = focusKeyword.trim().toLowerCase();
  const has = (text: string) => Boolean(kw) && text.toLowerCase().includes(kw);
  const slugHas = Boolean(kw) && slug.toLowerCase().includes(kw.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  const words = countWords(content);
  const firstWords = content.split(/\s+/).slice(0, 120).join(" ");
  const links = countLinks(content, siteHost);
  const h2 = (content.match(/^##\s+\S/gm) ?? []).length;
  const h1InText = /^#\s+\S/m.test(content);
  const seoTitle = metaTitle || title;
  const seoDescription = metaDescription || description;
  const [min, max] = lengthTargets[kind];

  const checks: Array<{ ok: boolean; text: string; warn?: boolean }> = [
    { ok: Boolean(kw), text: "One focus keyword set" },
    { ok: Boolean(keywords.trim()), text: "Secondary keywords (SEO card)", warn: true },
    { ok: has(title), text: "Focus keyword in the title (the page's only H1)" },
    { ok: !h1InText, text: "No extra H1 in the text (use ## for sections)" },
    { ok: h2 >= 3, text: `Structured with H2/H3 headings (${h2} H2)` },
    { ok: seoTitle.length > 0 && seoTitle.length <= 60, text: `SEO title up to 60 characters (${seoTitle.length})` },
    {
      ok: seoDescription.length >= 120 && seoDescription.length <= 160,
      text: `Meta description 120–160 characters (${seoDescription.length})`,
      warn: true,
    },
    { ok: has(seoDescription), text: "Focus keyword in the meta description", warn: true },
    { ok: slugHas, text: "Descriptive slug with the focus keyword", warn: true },
    { ok: has(firstWords), text: "Focus keyword in the introduction", warn: true },
    { ok: Boolean(imageUrl), text: "Featured image" },
    { ok: Boolean(imageUrl) && Boolean(imageAlt.trim()), text: "Featured image alt text" },
    { ok: !/!\[\s*\]\(/.test(content), text: "Every image in the text has alt text" },
    { ok: links.internal >= 3 && links.internal <= 8, text: `3–5 internal links (${links.internal})` },
    { ok: links.external >= 1, text: `Links to authoritative sources (${links.external})` },
    { ok: takeawayCount >= 4 && takeawayCount <= 6, text: `4–6 key takeaways (${takeawayCount})` },
    { ok: faqCount >= 5 && faqCount <= 8, text: `5–8 FAQs (${faqCount})`, warn: true },
    { ok: words >= min * 0.85, text: `Length for ${lengthLabels[kind]}: ${words.toLocaleString()} words`, warn: words <= max * 1.3 },
  ];
  const done = checks.filter((c) => c.ok).length;

  return (
    <div className={card}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={heading}>SEO checklist</h2>
        <span className={cn("text-xs font-bold", done === checks.length ? "text-success" : "text-text-secondary")}>
          {done}/{checks.length}
        </span>
      </div>
      <label className="block">
        <span className={label}>Article format</span>
        <select value={kind} onChange={(e) => setKind(e.target.value)} className={input}>
          {Object.entries(lengthLabels).map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      </label>
      <ul className="space-y-1.5">
        {checks.map((check) => (
          <li key={check.text} className="flex items-start gap-2 text-[11px] leading-snug">
            <span
              aria-hidden="true"
              className={cn(
                "mt-px grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-bold",
                check.ok ? "bg-success/15 text-success" : check.warn ? "bg-warning/15 text-warning" : "bg-error/10 text-error",
              )}
            >
              {check.ok ? "✓" : "!"}
            </span>
            <span className={check.ok ? "text-text-secondary" : "text-text-primary"}>{check.text}</span>
          </li>
        ))}
      </ul>
      <p className={help}>
        Guidelines, not ranking rules: a complete answer matters more than the word count. Facts must be checked by a
        person before publishing; use the &quot;In review&quot; status for that.
      </p>
    </div>
  );
}
