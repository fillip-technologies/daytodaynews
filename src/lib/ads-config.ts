import { cleanHttpUrl, cleanLine } from "@/lib/validation";

// Display advertising (Admin → Ads). Pure module (shared with the admin editor);
// lib/ads reads the saved settings. Each placement shows either a banner
// (image + link, sold directly) or a Google AdSense unit, always labelled
// "Advertisement". Banner links carry rel="sponsored". Nothing shows until a
// placement is switched on.

export const ADS_SETTING = "ads";

export const adPlacements = {
  home: "Homepage, below the first section",
  article: "Article pages, after the article text",
  category: "Category pages, below the article list",
  directory: "Directory pages, above the listings",
} as const;

export type AdPlacement = keyof typeof adPlacements;

export type AdSlotConfig = {
  mode: "off" | "banner" | "adsense";
  imageUrl: string;
  linkUrl: string;
  alt: string;
  /** AdSense ad unit id (data-ad-slot), digits. */
  adsenseSlot: string;
};

export type AdsSettings = {
  /** AdSense publisher id, ca-pub-1234567890123456. */
  adsenseClient: string;
  slots: Record<AdPlacement, AdSlotConfig>;
};

const emptySlot: AdSlotConfig = { mode: "off", imageUrl: "", linkUrl: "", alt: "", adsenseSlot: "" };

export const defaultAds: AdsSettings = {
  adsenseClient: "",
  slots: { home: emptySlot, article: emptySlot, category: emptySlot, directory: emptySlot },
};

const ADSENSE_CLIENT = /^ca-pub-\d{10,20}$/;
const ADSENSE_SLOT = /^\d{6,20}$/;

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** Strict cleaning for an admin save. */
export function cleanAds(input: unknown): Result<AdsSettings> {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const adsenseClient = cleanLine(raw.adsenseClient, 40);
  if (adsenseClient && !ADSENSE_CLIENT.test(adsenseClient)) {
    return { ok: false, error: "AdSense publisher ID must look like ca-pub-1234567890123456." };
  }
  const slotsRaw = (raw.slots && typeof raw.slots === "object" ? raw.slots : {}) as Record<string, unknown>;
  const slots = {} as Record<AdPlacement, AdSlotConfig>;
  for (const placement of Object.keys(adPlacements) as AdPlacement[]) {
    const s = (slotsRaw[placement] && typeof slotsRaw[placement] === "object" ? slotsRaw[placement] : {}) as Record<string, unknown>;
    const mode = s.mode === "banner" || s.mode === "adsense" ? s.mode : "off";
    const imageText = cleanLine(s.imageUrl, 2048);
    const linkText = cleanLine(s.linkUrl, 2048);
    const imageUrl = imageText ? cleanHttpUrl(imageText) : "";
    const linkUrl = linkText ? cleanHttpUrl(linkText) : "";
    const adsenseSlot = cleanLine(s.adsenseSlot, 20);
    const name = adPlacements[placement];
    if (imageText && !imageUrl) return { ok: false, error: `${name}: banner image must be an https:// address.` };
    if (linkText && !linkUrl) return { ok: false, error: `${name}: banner link must be an https:// address.` };
    if (adsenseSlot && !ADSENSE_SLOT.test(adsenseSlot)) return { ok: false, error: `${name}: AdSense slot ID is digits only.` };
    if (mode === "banner" && (!imageUrl || !linkUrl)) {
      return { ok: false, error: `${name}: a banner needs an image and a link (or switch it off).` };
    }
    if (mode === "adsense" && (!adsenseClient || !adsenseSlot)) {
      return { ok: false, error: `${name}: AdSense needs the publisher ID and this placement's slot ID.` };
    }
    slots[placement] = { mode, imageUrl: imageUrl ?? "", linkUrl: linkUrl ?? "", alt: cleanLine(s.alt, 150), adsenseSlot };
  }
  return { ok: true, value: { adsenseClient, slots } };
}

export function parseAds(json: string | null | undefined): AdsSettings {
  try {
    const cleaned = cleanAds(json ? JSON.parse(json) : {});
    return cleaned.ok ? cleaned.value : defaultAds;
  } catch {
    return defaultAds;
  }
}

/** Whether any placement uses AdSense (then its script is loaded once per page). */
export const usesAdsense = (ads: AdsSettings) =>
  Boolean(ads.adsenseClient) && Object.values(ads.slots).some((slot) => slot.mode === "adsense");
