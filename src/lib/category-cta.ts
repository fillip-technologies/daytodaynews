import type { Locale } from "@/i18n/config";

// The call to action at the end of every article and on its category page
// (90-day plan, "Commercial CTAs to integrate"). Each category can set its own
// in Admin → Categories; until then these defaults apply, by category slug.

export type CategoryCta = { title: string; text: string; label: string; href: string };

type Text = { title: string; text: string; label: string };
type Default = { href: string; en: Text; hi: Text };

const findAi: Default = {
  href: "/business-directory?category=AI%20Automation",
  en: {
    title: "Planning an AI automation project?",
    text: "Compare AI automation providers, see what they offer and send them an enquiry.",
    label: "Find AI automation providers",
  },
  hi: {
    title: "AI ऑटोमेशन प्रोजेक्ट की योजना बना रहे हैं?",
    text: "AI ऑटोमेशन प्रोवाइडर की तुलना करें, उनकी सर्विसेज़ देखें और पूछताछ भेजें।",
    label: "AI ऑटोमेशन प्रोवाइडर खोजें",
  },
};

const findDevelopers: Default = {
  href: "/business-directory?category=Software%20Development",
  en: {
    title: "Need a software development partner?",
    text: "Discover software development companies, compare their services and contact them directly.",
    label: "Discover software development companies",
  },
  hi: {
    title: "सॉफ़्टवेयर डेवलपमेंट पार्टनर चाहिए?",
    text: "सॉफ़्टवेयर डेवलपमेंट कंपनियाँ खोजें, उनकी सर्विसेज़ की तुलना करें और सीधे संपर्क करें।",
    label: "सॉफ़्टवेयर डेवलपमेंट कंपनियाँ खोजें",
  },
};

const exploreSoftware: Default = {
  href: "/software-directory",
  en: {
    title: "Choosing business software?",
    text: "Explore software products and AI tools with their features, pricing models and alternatives.",
    label: "Explore software products",
  },
  hi: {
    title: "बिज़नेस सॉफ़्टवेयर चुन रहे हैं?",
    text: "सॉफ़्टवेयर प्रोडक्ट और AI टूल उनके फ़ीचर, प्राइसिंग मॉडल और विकल्पों के साथ देखें।",
    label: "सॉफ़्टवेयर प्रोडक्ट देखें",
  },
};

const findMarketers: Default = {
  href: "/business-directory?category=Digital%20Marketing",
  en: {
    title: "Looking for growth help?",
    text: "Find marketing agencies and growth partners, and send them your brief.",
    label: "Find marketing agencies",
  },
  hi: {
    title: "ग्रोथ के लिए मदद चाहिए?",
    text: "मार्केटिंग एजेंसियाँ और ग्रोथ पार्टनर खोजें, और उन्हें अपनी ज़रूरत भेजें।",
    label: "मार्केटिंग एजेंसियाँ खोजें",
  },
};

const findHardware: Default = {
  href: "/business-directory?category=Hardware",
  en: {
    title: "Sourcing hardware?",
    text: "Discover hardware and electronics suppliers and contact them directly.",
    label: "Discover hardware suppliers",
  },
  hi: {
    title: "हार्डवेयर ख़रीदना है?",
    text: "हार्डवेयर और इलेक्ट्रॉनिक्स सप्लायर खोजें और उनसे सीधे संपर्क करें।",
    label: "हार्डवेयर सप्लायर खोजें",
  },
};

const submitStartup: Default = {
  href: "/startup-directory/submit",
  en: {
    title: "Building a startup?",
    text: "Get your startup in front of founders, investors and technology buyers. Listing is free.",
    label: "Submit your startup",
  },
  hi: {
    title: "स्टार्टअप बना रहे हैं?",
    text: "अपना स्टार्टअप फ़ाउंडर्स, निवेशकों और टेक्नोलॉजी ख़रीदारों तक पहुँचाएँ। लिस्टिंग मुफ़्त है।",
    label: "अपना स्टार्टअप सबमिट करें",
  },
};

const listBusiness: Default = {
  href: "/business-directory/submit",
  en: {
    title: "Want customers to find your business?",
    text: "List your company in the DayTodayNews business directory and receive enquiries from readers.",
    label: "List your business",
  },
  hi: {
    title: "चाहते हैं कि ग्राहक आपका बिज़नेस खोजें?",
    text: "DayTodayNews बिज़नेस डायरेक्टरी में अपनी कंपनी लिस्ट करें और पाठकों से पूछताछ पाएँ।",
    label: "अपना बिज़नेस लिस्ट करें",
  },
};

const findProviders: Default = {
  ...findDevelopers,
  href: "/business-directory",
  en: {
    title: "Looking for a technology partner?",
    text: "Find technology providers for your industry, compare them and send an enquiry.",
    label: "Find technology providers",
  },
  hi: {
    title: "टेक्नोलॉजी पार्टनर खोज रहे हैं?",
    text: "अपनी इंडस्ट्री के लिए टेक्नोलॉजी प्रोवाइडर खोजें, तुलना करें और पूछताछ भेजें।",
    label: "टेक्नोलॉजी प्रोवाइडर खोजें",
  },
};

const defaults: Record<string, Default> = {
  "ai-automation": findAi,
  technology: findDevelopers,
  development: findDevelopers,
  "hiring-outsourcing": findDevelopers,
  software: exploreSoftware,
  resources: exploreSoftware,
  insights: exploreSoftware,
  "business-growth": findMarketers,
  business: findMarketers,
  hardware: findHardware,
  startups: submitStartup,
  industries: findProviders,
  "business-opportunities": listBusiness,
  "government-schemes": listBusiness,
  "government-tenders": listBusiness,
  "global-markets": listBusiness,
};

/** The shipped default for a category, for the admin placeholders. */
export function defaultCategoryCta(slug: string, locale: Locale): CategoryCta {
  const entry = defaults[slug] ?? listBusiness;
  return { ...entry[locale], href: entry.href };
}

/** The category's own CTA (texts already in `locale`, see getArticleBySlug), over the default. */
export function categoryCta(
  topic: { slug: string; ctaTitle?: string | null; ctaText?: string | null; ctaLabel?: string | null; ctaHref?: string | null },
  locale: Locale,
): CategoryCta {
  const fallback = defaultCategoryCta(topic.slug, locale);
  return {
    title: topic.ctaTitle || fallback.title,
    text: topic.ctaText || fallback.text,
    label: topic.ctaLabel || fallback.label,
    href: topic.ctaHref || fallback.href,
  };
}
