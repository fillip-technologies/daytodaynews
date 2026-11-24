import { getDictionary } from "@/i18n/server";
import type { Locale } from "@/i18n/config";
import { getAds, type AdPlacement } from "@/lib/ads";
import { cn } from "@/lib/cn";
import { AdsenseUnit } from "./AdsenseUnit";

/** One ad placement from Admin → Ads; renders nothing while it is off. */
export async function AdSlot({ placement, locale, className }: { placement: AdPlacement; locale: Locale; className?: string }) {
  const [ads, t] = await Promise.all([getAds(), getDictionary(locale)]);
  const slot = ads.slots[placement];
  if (slot.mode === "off") return null;

  return (
    <aside aria-label={t.common.advertisement} className={cn("my-8", className)}>
      <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
        {t.common.advertisement}
      </p>
      {slot.mode === "banner" ? (
        <a
          href={slot.linkUrl}
          target="_blank"
          rel="sponsored noopener"
          className="block overflow-hidden rounded-2xl border border-border bg-surface-elevated"
        >
          {/* Banners come from the advertiser's own image host. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slot.imageUrl} alt={slot.alt || t.common.advertisement} loading="lazy" className="mx-auto block h-auto w-full" />
        </a>
      ) : (
        <AdsenseUnit client={ads.adsenseClient} slot={slot.adsenseSlot} />
      )}
    </aside>
  );
}
