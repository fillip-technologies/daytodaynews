// Conversion events for Google Analytics 4 / Tag Manager (Admin → SEO →
// Verification & Analytics). Without either, calls do nothing. Event names
// follow GA4's recommended events, so they can be marked as key events
// (conversions) in GA4 without custom setup:
//   generate_lead  form = contact | pitch | advertising | listing_enquiry | listing_submission
//   sign_up        method = newsletter

type Params = Record<string, string | number>;

export function trackEvent(name: "generate_lead" | "sign_up", params: Params = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  try {
    if (typeof w.gtag === "function") {
      w.gtag("event", name, params);
    } else if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event: name, ...params });
    }
  } catch {
    // Analytics must never break a form.
  }
}

/** Name of the hidden "honeypot" field: people never see or fill it, form-filling bots do. */
export const HONEYPOT_FIELD = "hp_company_site";
