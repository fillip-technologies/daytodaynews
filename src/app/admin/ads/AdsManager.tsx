"use client";

import { useState } from "react";
import { saveAds } from "@/actions/ads";
import { inputClass, labelClass, NoticeBox, primaryButtonClass, type Notice } from "@/components/admin/fields";
import { adPlacements, type AdPlacement, type AdsSettings, type AdSlotConfig } from "@/lib/ads-config";

export function AdsManager({ initial }: { initial: AdsSettings }) {
  const [ads, setAds] = useState<AdsSettings>(initial);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);

  const setSlot = (placement: AdPlacement, patch: Partial<AdSlotConfig>) =>
    setAds((all) => ({ ...all, slots: { ...all.slots, [placement]: { ...all.slots[placement], ...patch } } }));

  async function save() {
    setBusy(true);
    const res = await saveAds(ads);
    setBusy(false);
    setNotice(res.success ? { kind: "success", text: "Ads saved. The site shows them within a few minutes." } : { kind: "error", text: res.error ?? "Failed." });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Ads</h1>
        <p className="mt-1 max-w-3xl text-sm text-text-secondary">
          Display advertising. Each placement shows a banner you sold directly, or a Google AdSense unit. Every ad is
          labelled &quot;Advertisement&quot;, and banner links carry rel=&quot;sponsored&quot;. Sponsored articles are set in
          the article editor; newsletter sponsors in Newsletter.
        </p>
      </div>

      <NoticeBox notice={notice} />

      <section className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-2xs">
        <label className="block max-w-md">
          <span className={labelClass}>Google AdSense publisher ID (only for AdSense placements)</span>
          <input
            value={ads.adsenseClient}
            onChange={(e) => setAds({ ...ads, adsenseClient: e.target.value })}
            placeholder="ca-pub-1234567890123456"
            className={`${inputClass} h-10 font-mono`}
          />
        </label>
      </section>

      {(Object.keys(adPlacements) as AdPlacement[]).map((placement) => {
        const slot = ads.slots[placement];
        return (
          <section key={placement} className="space-y-4 rounded-2xl border border-border bg-surface-elevated p-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-text-primary">{adPlacements[placement]}</h2>
              <select
                value={slot.mode}
                onChange={(e) => setSlot(placement, { mode: e.target.value as AdSlotConfig["mode"] })}
                className={`${inputClass} mt-0 h-9 w-auto`}
                aria-label={`${adPlacements[placement]}: mode`}
              >
                <option value="off">Off</option>
                <option value="banner">Banner (image + link)</option>
                <option value="adsense">Google AdSense</option>
              </select>
            </div>
            {slot.mode === "banner" && (
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className={labelClass}>Banner image URL (https://)</span>
                  <input value={slot.imageUrl} onChange={(e) => setSlot(placement, { imageUrl: e.target.value })} className={`${inputClass} h-10`} />
                </label>
                <label className="block">
                  <span className={labelClass}>Link (advertiser&apos;s page)</span>
                  <input value={slot.linkUrl} onChange={(e) => setSlot(placement, { linkUrl: e.target.value })} className={`${inputClass} h-10`} />
                </label>
                <label className="block">
                  <span className={labelClass}>Image description (alt text)</span>
                  <input value={slot.alt} onChange={(e) => setSlot(placement, { alt: e.target.value })} className={`${inputClass} h-10`} />
                </label>
                {slot.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slot.imageUrl} alt="" className="max-h-40 rounded-xl border border-border sm:col-span-3" />
                )}
              </div>
            )}
            {slot.mode === "adsense" && (
              <label className="block max-w-xs">
                <span className={labelClass}>AdSense ad slot ID</span>
                <input
                  value={slot.adsenseSlot}
                  onChange={(e) => setSlot(placement, { adsenseSlot: e.target.value })}
                  placeholder="1234567890"
                  className={`${inputClass} h-10 font-mono`}
                />
              </label>
            )}
          </section>
        );
      })}

      <button type="button" onClick={save} disabled={busy} className={primaryButtonClass}>
        {busy ? "Saving…" : "Save ads"}
      </button>
    </div>
  );
}
