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
  /**
   * False for pages whose body text exists only in English (canonical points to
   * /en). Pages edited under Admin → Pages ignore it: they count as translated
   * once all their Hindi is filled in (see isFixedPageTranslated).
   */
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

// Commercial and trust pages of the 90-day plan. Directory pages show
// listings in English only, so their Hindi copies point at English.
seoPages.push(
  {
    key: "advertise",
    path: "/advertise",
    label: "Advertise",
    translated: false,
    defaults: {
      en: {
        title: "Advertise: Technology Website Advertising",
        description:
          "Sponsored technology articles, display advertising, newsletter sponsorship and product launches to reach founders, CTOs and business decision-makers.",
      },
      hi: {
        title: "विज्ञापन दें",
        description: "प्रायोजित लेख, डिस्प्ले विज्ञापन, न्यूज़लेटर स्पॉन्सरशिप और प्रोडक्ट लॉन्च के ज़रिए टेक्नोलॉजी और बिज़नेस के फ़ैसले लेने वालों तक पहुँचें।",
      },
    },
  },
  {
    key: "editorial-policy",
    path: "/editorial-policy",
    label: "Editorial Policy",
    translated: false,
    defaults: {
      en: {
        title: "Editorial Policy",
        description: "How DayTodayNews researches, writes, reviews and corrects its articles, and labels guest, sponsored and directory content.",
      },
      hi: {
        title: "संपादकीय नीति",
        description: "DayTodayNews लेखों पर रिसर्च, लेखन, समीक्षा और सुधार कैसे करता है, और अतिथि, प्रायोजित व डायरेक्टरी कंटेंट को कैसे लेबल करता है।",
      },
    },
  },
  {
    key: "business-directory",
    path: "/business-directory",
    label: "Business Directory",
    translated: false,
    defaults: {
      en: {
        title: "Business Directory: Technology & IT Companies",
        description:
          "Online business directory of technology companies, software development firms, AI automation providers, IT service companies and digital agencies worldwide.",
      },
      hi: {
        title: "बिज़नेस डायरेक्टरी",
        description: "दुनिया भर की टेक्नोलॉजी कंपनियाँ, सॉफ़्टवेयर डेवलपमेंट फ़र्म, AI ऑटोमेशन प्रोवाइडर और IT सर्विस कंपनियाँ।",
      },
    },
  },
  {
    key: "software-directory",
    path: "/software-directory",
    label: "Software Directory",
    translated: false,
    defaults: {
      en: {
        title: "Software Directory: SaaS & AI Tools",
        description:
          "Business software directory: SaaS products, AI tools, CRM, ERP and automation software with features, pricing models and alternatives.",
      },
      hi: {
        title: "सॉफ़्टवेयर डायरेक्टरी",
        description: "SaaS प्रोडक्ट, AI टूल, CRM, ERP और ऑटोमेशन सॉफ़्टवेयर, फ़ीचर, प्राइसिंग और विकल्पों के साथ।",
      },
    },
  },
  {
    key: "startup-directory",
    path: "/startup-directory",
    label: "Startup Directory",
    translated: false,
    defaults: {
      en: {
        title: "Startup Directory",
        description: "Discover technology startups in AI, SaaS, fintech, healthtech and more, from idea stage to growth.",
      },
      hi: {
        title: "स्टार्टअप डायरेक्टरी",
        description: "AI, SaaS, फ़िनटेक, हेल्थटेक और अन्य क्षेत्रों के टेक्नोलॉजी स्टार्टअप देखें।",
      },
    },
  },
  {
    key: "business-directory-submit",
    path: "/business-directory/submit",
    label: "List Your Business",
    translated: false,
    defaults: {
      en: {
        title: "List Your Business in Our Online Business Directory",
        description: "Add your company to the DayTodayNews business directory for free and receive enquiries from technology buyers.",
      },
      hi: { title: "अपना बिज़नेस लिस्ट करें", description: "अपनी कंपनी को DayTodayNews बिज़नेस डायरेक्टरी में मुफ़्त जोड़ें।" },
    },
  },
  {
    key: "software-directory-submit",
    path: "/software-directory/submit",
    label: "Submit a Tool",
    translated: false,
    defaults: {
      en: {
        title: "Submit Your Software or AI Tool",
        description: "List your SaaS product or AI tool in the DayTodayNews software directory.",
      },
      hi: { title: "टूल सबमिट करें", description: "अपना SaaS प्रोडक्ट या AI टूल DayTodayNews सॉफ़्टवेयर डायरेक्टरी में लिस्ट करें।" },
    },
  },
  {
    key: "startup-directory-submit",
    path: "/startup-directory/submit",
    label: "Submit Your Startup",
    translated: false,
    defaults: {
      en: {
        title: "Submit Your Startup",
        description: "Get your startup listed in the DayTodayNews startup directory for free.",
      },
      hi: { title: "अपना स्टार्टअप सबमिट करें", description: "अपना स्टार्टअप DayTodayNews स्टार्टअप डायरेक्टरी में मुफ़्त लिस्ट करें।" },
    },
  },
  {
    key: "sponsored-insights",
    path: "/sponsored-insights",
    label: "Sponsored Insights",
    translated: true,
    defaults: {
      en: {
        title: "Sponsored Insights",
        description: "Brand-sponsored technology articles, case studies and product stories, clearly labelled and editorially reviewed.",
      },
      hi: {
        title: "प्रायोजित इनसाइट्स",
        description: "ब्रांड द्वारा प्रायोजित टेक्नोलॉजी लेख, केस स्टडी और प्रोडक्ट स्टोरीज़, साफ़ लेबल और संपादकीय समीक्षा के साथ।",
      },
    },
  },
  {
    key: "guest-contributors",
    path: "/guest-contributors",
    label: "Guest Contributors",
    translated: true,
    defaults: {
      en: {
        title: "Guest Contributors",
        description: "Practical technology and business articles written by industry experts, consultants and founders.",
      },
      hi: {
        title: "अतिथि लेखक",
        description: "इंडस्ट्री विशेषज्ञों, कंसल्टेंट और फ़ाउंडर्स के लिखे व्यावहारिक टेक्नोलॉजी और बिज़नेस लेख।",
      },
    },
  },
);

export function getSeoPage(key: string): SeoPage | undefined {
  return seoPages.find((page) => page.key === key);
}
