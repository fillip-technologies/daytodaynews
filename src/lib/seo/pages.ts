import type { Locale } from "@/i18n/config";

// Fixed pages whose SEO is edited under Admin → SEO → Pages. `title` is the bare
// page name (the site's title format adds the brand); null means "use the site
// default title" (the home page). These defaults apply until an admin overrides them.

export type SeoPage = {
  key: string;
  /** Unprefixed path; the locale is added per page view. */
  path: string;
  /** Name shown in the admin list. */
  label: string;
  /** False for pages whose body text exists only in English (canonical points to /en). */
  translated: boolean;
  /** Not listed in the sitemap (e.g. search results). */
  hideFromSitemap?: boolean;
  defaults: Record<Locale, { title: string | null; description: string }>;
};

export const seoPages: SeoPage[] = [
  {
    key: "home",
    path: "/",
    label: "Home",
    translated: true,
    defaults: {
      en: {
        title: null,
        description: "AI, software development and technology insights for founders, CTOs and technology teams.",
      },
      hi: {
        title: null,
        description:
          "फ़ाउंडर्स, CTO और टेक्नोलॉजी टीमों के लिए AI, सॉफ़्टवेयर डेवलपमेंट और टेक्नोलॉजी से जुड़ी काम की जानकारी।",
      },
    },
  },
  {
    key: "blog",
    path: "/blog",
    label: "All articles (Blog)",
    translated: true,
    defaults: {
      en: {
        title: "Technology, AI & Software Insights",
        description:
          "Explore practical insights on AI, automation, software development, business technology and the trends shaping modern digital teams.",
      },
      hi: {
        title: "टेक्नोलॉजी, AI और सॉफ़्टवेयर इनसाइट्स",
        description:
          "AI, ऑटोमेशन, सॉफ़्टवेयर डेवलपमेंट, बिज़नेस टेक्नोलॉजी और आधुनिक डिजिटल टीमों को आकार देने वाले ट्रेंड्स पर काम की जानकारी।",
      },
    },
  },
  {
    key: "search",
    path: "/search",
    label: "Search",
    translated: true,
    hideFromSitemap: true,
    defaults: {
      en: {
        title: "Search",
        description:
          "Search DayTodayNews for insights on AI, automation, software development, business technology and more.",
      },
      hi: {
        title: "खोज",
        description:
          "AI, ऑटोमेशन, सॉफ़्टवेयर डेवलपमेंट, बिज़नेस टेक्नोलॉजी और बहुत कुछ पर जानकारी के लिए DayTodayNews पर खोजें।",
      },
    },
  },
  {
    key: "newsletter",
    path: "/newsletter",
    label: "Newsletter",
    translated: true,
    defaults: {
      en: {
        title: "Newsletter",
        description:
          "Subscribe to the DayTodayNews weekly brief: practical insights on AI, software, automation, business and startups, every Friday.",
      },
      hi: {
        title: "न्यूज़लेटर",
        description:
          "DayTodayNews का साप्ताहिक ब्रीफ़ सब्सक्राइब करें: AI, सॉफ़्टवेयर, ऑटोमेशन, बिज़नेस और स्टार्टअप्स पर काम की जानकारी, हर शुक्रवार।",
      },
    },
  },
  {
    key: "about",
    path: "/about",
    label: "About",
    translated: false,
    defaults: {
      en: {
        title: "About Us",
        description:
          "Learn about DayTodayNews and our approach to practical technology, AI, software, automation and business insights.",
      },
      hi: {
        title: "हमारे बारे में",
        description:
          "DayTodayNews और टेक्नोलॉजी, AI, सॉफ़्टवेयर, ऑटोमेशन और बिज़नेस पर हमारी काम की जानकारी के बारे में जानें।",
      },
    },
  },
  {
    key: "contact",
    path: "/contact",
    label: "Contact",
    translated: false,
    defaults: {
      en: { title: "Contact Us", description: "Get in touch with the DayTodayNews editorial and business team." },
      hi: { title: "संपर्क करें", description: "DayTodayNews की संपादकीय और बिज़नेस टीम से संपर्क करें।" },
    },
  },
  {
    key: "write-for-us",
    path: "/write-for-us",
    label: "Write for Us",
    translated: false,
    defaults: {
      en: {
        title: "Write for Us",
        description: "Submit technology, AI, software, business and startup ideas to DayTodayNews.",
      },
      hi: {
        title: "हमारे लिए लिखें",
        description: "DayTodayNews को टेक्नोलॉजी, AI, सॉफ़्टवेयर, बिज़नेस और स्टार्टअप से जुड़े आइडियाज़ भेजें।",
      },
    },
  },
  {
    key: "privacy-policy",
    path: "/privacy-policy",
    label: "Privacy Policy",
    translated: false,
    defaults: {
      en: {
        title: "Privacy Policy",
        description: "How DayTodayNews collects, uses and protects information when you use our website.",
      },
      hi: {
        title: "प्राइवेसी पॉलिसी",
        description: "हमारी वेबसाइट इस्तेमाल करते समय DayTodayNews जानकारी कैसे इकट्ठा, उपयोग और सुरक्षित करता है।",
      },
    },
  },
  {
    key: "terms",
    path: "/terms",
    label: "Terms & Conditions",
    translated: false,
    defaults: {
      en: {
        title: "Terms & Conditions",
        description: "The terms that apply when you use the DayTodayNews website and its content.",
      },
      hi: {
        title: "नियम और शर्तें",
        description: "DayTodayNews वेबसाइट और उसके कंटेंट के उपयोग पर लागू होने वाली शर्तें।",
      },
    },
  },
  {
    key: "disclaimer",
    path: "/disclaimer",
    label: "Disclaimer",
    translated: false,
    defaults: {
      en: {
        title: "Disclaimer",
        description: "Important information about how to use the content published on DayTodayNews.",
      },
      hi: {
        title: "अस्वीकरण",
        description: "DayTodayNews पर प्रकाशित कंटेंट के उपयोग से जुड़ी ज़रूरी जानकारी।",
      },
    },
  },
];

export function getSeoPage(key: string): SeoPage | undefined {
  return seoPages.find((page) => page.key === key);
}
