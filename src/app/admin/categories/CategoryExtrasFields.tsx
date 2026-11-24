"use client";

import { inputClass, labelClass, TextPair, type BilingualText } from "@/components/admin/fields";
import { defaultCategoryCta } from "@/lib/category-cta";

// Category page content beyond name and description: a longer introduction,
// the pillar guide shown as "Start here", and the call to action at the end of
// the category's articles (90-day plan: commercial CTAs per category).

export type CategoryExtras = {
  intro: BilingualText;
  pillarSlug: string;
  ctaTitle: BilingualText;
  ctaText: BilingualText;
  ctaLabel: BilingualText;
  ctaHref: string;
};

export const emptyCategoryExtras: CategoryExtras = {
  intro: { en: "", hi: "" },
  pillarSlug: "",
  ctaTitle: { en: "", hi: "" },
  ctaText: { en: "", hi: "" },
  ctaLabel: { en: "", hi: "" },
  ctaHref: "",
};

export function CategoryExtrasFields({
  slug,
  value,
  onChange,
  pillars,
}: {
  slug: string;
  value: CategoryExtras;
  onChange: (value: CategoryExtras) => void;
  pillars: Array<{ value: string; label: string }>;
}) {
  const set = (patch: Partial<CategoryExtras>) => onChange({ ...value, ...patch });
  const en = defaultCategoryCta(slug, "en");
  const hi = defaultCategoryCta(slug, "hi");
  return (
    <div className="space-y-4">
      <TextPair
        label="Introduction (markdown, shown on the category's first page)"
        rows={4}
        value={value.intro}
        onChange={(intro) => set({ intro })}
        maxLength={5000}
      />
      <label className="block">
        <span className={labelClass}>Pillar guide (&quot;Start here&quot;)</span>
        <select value={value.pillarSlug} onChange={(e) => set({ pillarSlug: e.target.value })} className={`${inputClass} h-10`}>
          <option value="">None</option>
          {pillars.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-[11px] text-text-muted">
          Articles marked as pillar guides in the article editor appear here.
        </span>
      </label>

      <div className="rounded-xl border border-border bg-background p-4 space-y-3">
        <p className="text-xs font-semibold text-text-primary">Call to action (end of every article in this category)</p>
        <p className="text-[11px] text-text-muted">Empty fields use the default shown in grey.</p>
        <TextPair
          label="Heading"
          value={value.ctaTitle}
          onChange={(ctaTitle) => set({ ctaTitle })}
          placeholder={{ en: en.title, hi: hi.title }}
          maxLength={150}
        />
        <TextPair
          label="Text"
          rows={2}
          value={value.ctaText}
          onChange={(ctaText) => set({ ctaText })}
          placeholder={{ en: en.text, hi: hi.text }}
          maxLength={500}
        />
        <TextPair
          label="Button"
          value={value.ctaLabel}
          onChange={(ctaLabel) => set({ ctaLabel })}
          placeholder={{ en: en.label, hi: hi.label }}
          maxLength={80}
        />
        <label className="block">
          <span className={labelClass}>Button link (a /path on this site or https://)</span>
          <input
            value={value.ctaHref}
            onChange={(e) => set({ ctaHref: e.target.value })}
            placeholder={en.href}
            className={`${inputClass} h-10 font-mono`}
          />
        </label>
      </div>
    </div>
  );
}
