// Sets up the header mega menu from the editorial plan: the categories behind
// each menu (with Hindi names), their submenu topics, and the menu bar itself.
//
// Additive and safe to re-run: categories that exist keep their name, icon and
// articles, and a category that already has submenu topics keeps them, as does
// a menu bar already saved in admin. Pass --replace to overwrite those topics
// and the menu bar with the plan (categories are still never renamed).
//
// Run with: npm run db:seed:mega-menu  (or: npm run db:seed:mega-menu -- --replace)
import "dotenv/config";
import { DEFAULT_HEADER_MENUS, HEADER_MENU_SETTING } from "../src/lib/header-menu";
import { MAX_MENU_TOPICS } from "../src/lib/menu-topics";
import { prisma } from "../src/lib/prisma";
import type { Tone } from "../src/lib/tones";

type Text = { en: string; hi: string };
/** A submenu topic: its name, and the search keyword it opens (every word must match). */
type SeedTopic = [label: Text, query: string];
type SeedCategory = {
  slug: string;
  label: Text;
  description: Text;
  icon: string;
  tone: Tone;
  topics: SeedTopic[];
};

const t = (en: string, hi: string): Text => ({ en, hi });

const categories: SeedCategory[] = [
  {
    slug: "technology",
    label: t("Technology & IT", "टेक्नोलॉजी और IT"),
    description: t(
      "Software, cloud, cybersecurity and the IT that runs modern businesses.",
      "सॉफ़्टवेयर, क्लाउड, साइबर सुरक्षा और आधुनिक बिज़नेस को चलाने वाला IT।",
    ),
    icon: "laptop",
    tone: "primary",
    topics: [
      [t("Software Development", "सॉफ़्टवेयर डेवलपमेंट"), "software development"],
      [t("Websites & Web Apps", "वेबसाइट और वेब ऐप्स"), "web"],
      [t("Mobile Apps", "मोबाइल ऐप्स"), "mobile app"],
      [t("Cloud Computing", "क्लाउड कंप्यूटिंग"), "cloud"],
      [t("Cybersecurity", "साइबर सुरक्षा"), "cyber"],
      [t("Data Analytics", "डेटा एनालिटिक्स"), "analytics"],
      [t("IT Infrastructure", "IT इन्फ्रास्ट्रक्चर"), "IT infrastructure"],
      [t("Networking & Telecom", "नेटवर्किंग और टेलीकॉम"), "network"],
      [t("SaaS", "SaaS"), "SaaS"],
      [t("ERP & CRM", "ERP और CRM"), "ERP"],
      [t("Open Source", "ओपन सोर्स"), "open source"],
      [t("Emerging Technologies", "उभरती टेक्नोलॉजी"), "emerging technology"],
    ],
  },
  {
    slug: "ai-automation",
    label: t("AI & Automation", "AI और ऑटोमेशन"),
    description: t(
      "Generative AI, agents and automation for every kind of business.",
      "हर तरह के बिज़नेस के लिए जनरेटिव AI, एजेंट्स और ऑटोमेशन।",
    ),
    icon: "sparkles",
    tone: "accent-secondary",
    topics: [
      [t("Generative AI", "जनरेटिव AI"), "generative AI"],
      [t("AI Agents", "AI एजेंट्स"), "AI agent"],
      [t("Business Automation", "बिज़नेस ऑटोमेशन"), "business automation"],
      [t("Workflow Automation", "वर्कफ़्लो ऑटोमेशन"), "workflow"],
      [t("AI for Industries", "उद्योगों के लिए AI"), "AI industries"],
      [t("Robotics", "रोबोटिक्स"), "robot"],
      [t("Industrial Automation", "इंडस्ट्रियल ऑटोमेशन"), "industrial automation"],
      [t("AI Tools", "AI टूल्स"), "AI tools"],
      [t("AI Development", "AI डेवलपमेंट"), "AI development"],
      [t("Machine Learning", "मशीन लर्निंग"), "machine learning"],
      [t("Computer Vision", "कंप्यूटर विज़न"), "computer vision"],
      [t("Conversational AI", "कन्वर्सेशनल AI"), "conversational"],
      [t("Responsible AI", "ज़िम्मेदार AI"), "responsible AI"],
    ],
  },
  {
    slug: "hardware",
    label: t("Hardware & Electronics", "हार्डवेयर और इलेक्ट्रॉनिक्स"),
    description: t(
      "Computers, chips, IoT devices, surveillance and electronics manufacturing.",
      "कंप्यूटर, चिप्स, IoT डिवाइस, सर्विलांस और इलेक्ट्रॉनिक्स मैन्युफ़ैक्चरिंग।",
    ),
    icon: "cpu",
    tone: "accent-secondary",
    topics: [
      [t("Computers & Servers", "कंप्यूटर और सर्वर"), "server"],
      [t("Computer Components", "कंप्यूटर कंपोनेंट्स"), "components"],
      [t("Semiconductors & Chips", "सेमीकंडक्टर और चिप्स"), "semiconductor"],
      [t("Electronics Manufacturing", "इलेक्ट्रॉनिक्स मैन्युफ़ैक्चरिंग"), "electronics manufacturing"],
      [t("IoT Devices", "IoT डिवाइस"), "IoT"],
      [t("CCTV & Surveillance", "CCTV और सर्विलांस"), "CCTV"],
      [t("Networking Equipment", "नेटवर्किंग उपकरण"), "networking equipment"],
      [t("Storage Systems", "स्टोरेज सिस्टम"), "storage"],
      [t("Consumer Electronics", "कंज़्यूमर इलेक्ट्रॉनिक्स"), "consumer electronics"],
      [t("Embedded Systems", "एम्बेडेड सिस्टम"), "embedded"],
      [t("Drones", "ड्रोन"), "drone"],
      [t("Hardware Repair & AMC", "हार्डवेयर रिपेयर और AMC"), "AMC"],
    ],
  },
  {
    slug: "industries",
    label: t("Industries & Sectors", "उद्योग और सेक्टर"),
    description: t(
      "Sector-by-sector coverage, from manufacturing and farming to health and finance.",
      "मैन्युफ़ैक्चरिंग और खेती से लेकर हेल्थ और फ़ाइनेंस तक, हर सेक्टर की कवरेज।",
    ),
    icon: "factory",
    tone: "accent",
    topics: [
      [t("Manufacturing", "मैन्युफ़ैक्चरिंग"), "manufacturing"],
      [t("Agriculture & AgriTech", "कृषि और एग्रीटेक"), "agri"],
      [t("Healthcare & HealthTech", "हेल्थकेयर और हेल्थटेक"), "health"],
      [t("Education & EdTech", "शिक्षा और एडटेक"), "education"],
      [t("Finance & FinTech", "फ़ाइनेंस और फ़िनटेक"), "fintech"],
      [t("Retail & E-commerce", "रिटेल और ई-कॉमर्स"), "retail"],
      [t("Real Estate & PropTech", "रियल एस्टेट और प्रॉपटेक"), "real estate"],
      [t("Construction & Infrastructure", "कंस्ट्रक्शन और इन्फ्रास्ट्रक्चर"), "construction"],
      [t("Transport & Logistics", "ट्रांसपोर्ट और लॉजिस्टिक्स"), "logistics"],
      [t("Tourism & Hospitality", "पर्यटन और हॉस्पिटैलिटी"), "tourism"],
      [t("Energy & Renewables", "ऊर्जा और रिन्यूएबल्स"), "energy"],
      [t("Automotive & EVs", "ऑटोमोटिव और EV"), "automotive"],
      [t("Telecom", "टेलीकॉम"), "telecom"],
      [t("Media & Entertainment", "मीडिया और एंटरटेनमेंट"), "entertainment"],
      [t("Textiles", "टेक्सटाइल"), "textile"],
      [t("Food Processing", "फ़ूड प्रोसेसिंग"), "food processing"],
      [t("Defence & Aerospace", "रक्षा और एयरोस्पेस"), "defence"],
      [t("Chemicals & Pharmaceuticals", "केमिकल्स और फ़ार्मास्युटिकल्स"), "pharma"],
      [t("Mining & Metals", "माइनिंग और मेटल्स"), "mining"],
      [t("Waste Management & Recycling", "वेस्ट मैनेजमेंट और रीसाइक्लिंग"), "recycling"],
    ],
  },
  {
    slug: "startups",
    label: t("Startups & Entrepreneurship", "स्टार्टअप्स और उद्यमिता"),
    description: t(
      "Ideas, founders, funding and the work of building a company.",
      "आइडियाज़, फ़ाउंडर्स, फ़ंडिंग और कंपनी खड़ी करने का काम।",
    ),
    icon: "rocket",
    tone: "pink",
    topics: [
      [t("Startup Ideas", "स्टार्टअप आइडियाज़"), "startup ideas"],
      [t("Starting a Business", "बिज़नेस शुरू करना"), "start business"],
      [t("Business Models", "बिज़नेस मॉडल"), "business model"],
      [t("Founder Stories", "फ़ाउंडर्स की कहानियाँ"), "founder"],
      [t("Startup Ecosystems", "स्टार्टअप इकोसिस्टम"), "ecosystem"],
      [t("Incubators & Accelerators", "इनक्यूबेटर और एक्सेलेरेटर"), "incubator"],
      [t("Funding & Investors", "फ़ंडिंग और निवेशक"), "funding"],
      [t("Pitch Decks", "पिच डेक"), "pitch deck"],
      [t("Product Development", "प्रोडक्ट डेवलपमेंट"), "product development"],
      [t("MVP & Product Validation", "MVP और प्रोडक्ट वैलिडेशन"), "MVP"],
      [t("Growth & Scaling", "ग्रोथ और स्केलिंग"), "scaling"],
      [t("Women Entrepreneurs", "महिला उद्यमी"), "women"],
      [t("Rural Entrepreneurship", "ग्रामीण उद्यमिता"), "rural"],
      [t("Social Enterprises", "सोशल एंटरप्राइज़"), "social enterprise"],
    ],
  },
  {
    slug: "business-opportunities",
    label: t("Business Opportunities", "बिज़नेस के अवसर"),
    description: t(
      "Business ideas, franchises, trade and the market gaps worth filling.",
      "बिज़नेस आइडियाज़, फ़्रैंचाइज़ी, व्यापार और बाज़ार की वे ज़रूरतें जिन्हें भरा जा सकता है।",
    ),
    icon: "trending-up",
    tone: "pink",
    topics: [
      [t("Emerging Businesses", "उभरते बिज़नेस"), "emerging business"],
      [t("Low-Investment Businesses", "कम निवेश वाले बिज़नेस"), "low investment"],
      [t("Online Businesses", "ऑनलाइन बिज़नेस"), "online business"],
      [t("Service Businesses", "सर्विस बिज़नेस"), "service business"],
      [t("Manufacturing Opportunities", "मैन्युफ़ैक्चरिंग के अवसर"), "manufacturing business"],
      [t("Franchise Opportunities", "फ़्रैंचाइज़ी के अवसर"), "franchise"],
      [t("Dealerships & Distribution", "डीलरशिप और डिस्ट्रीब्यूशन"), "dealership"],
      [t("Import & Export", "इम्पोर्ट और एक्सपोर्ट"), "export"],
      [t("B2B Opportunities", "B2B अवसर"), "B2B"],
      [t("Government Business", "सरकारी बिज़नेस"), "government business"],
      [t("Rural Businesses", "ग्रामीण बिज़नेस"), "rural business"],
      [t("Green Businesses", "ग्रीन बिज़नेस"), "green business"],
      [t("Recurring-Revenue Businesses", "रिकरिंग रेवेन्यू बिज़नेस"), "recurring revenue"],
      [t("Industry Demand & Market Gaps", "इंडस्ट्री डिमांड और मार्केट गैप"), "market gap"],
    ],
  },
  {
    slug: "business-growth",
    label: t("Business Growth & Management", "बिज़नेस ग्रोथ और मैनेजमेंट"),
    description: t(
      "Sales, marketing, people, operations, finance and compliance.",
      "सेल्स, मार्केटिंग, टीम, ऑपरेशंस, फ़ाइनेंस और कंप्लायंस।",
    ),
    icon: "chart-line",
    tone: "primary",
    topics: [
      [t("Sales & Business Development", "सेल्स और बिज़नेस डेवलपमेंट"), "sales"],
      [t("Digital Marketing", "डिजिटल मार्केटिंग"), "digital marketing"],
      [t("SEO & Content Marketing", "SEO और कंटेंट मार्केटिंग"), "SEO"],
      [t("Social Media", "सोशल मीडिया"), "social media"],
      [t("Advertising", "विज्ञापन"), "advertising"],
      [t("Branding", "ब्रांडिंग"), "brand"],
      [t("Customer Experience", "कस्टमर एक्सपीरियंस"), "customer experience"],
      [t("HR & Recruitment", "HR और भर्ती"), "hiring"],
      [t("Operations", "ऑपरेशंस"), "operations"],
      [t("Procurement & Supply Chain", "प्रोक्योरमेंट और सप्लाई चेन"), "supply chain"],
      [t("Project Management", "प्रोजेक्ट मैनेजमेंट"), "project management"],
      [t("Business Finance", "बिज़नेस फ़ाइनेंस"), "business finance"],
      [t("Accounting & Tax", "अकाउंटिंग और टैक्स"), "tax"],
      [t("Legal & Compliance", "लीगल और कंप्लायंस"), "compliance"],
      [t("Quality & Certifications", "क्वालिटी और सर्टिफ़िकेशन"), "certification"],
    ],
  },
  {
    slug: "government-schemes",
    label: t("Government Schemes & Policy", "सरकारी योजनाएँ और नीतियाँ"),
    description: t(
      "Central and state schemes, loans, subsidies and policy updates.",
      "केंद्र और राज्य की योजनाएँ, लोन, सब्सिडी और नीति से जुड़े अपडेट।",
    ),
    icon: "landmark",
    tone: "accent",
    topics: [
      [t("Central Government Schemes", "केंद्र सरकार की योजनाएँ"), "central government scheme"],
      [t("State Government Schemes", "राज्य सरकार की योजनाएँ"), "state scheme"],
      [t("MSME Support", "MSME सहायता"), "MSME"],
      [t("Startup Support", "स्टार्टअप सहायता"), "Startup India"],
      [t("Loans & Subsidies", "लोन और सब्सिडी"), "loan"],
      [t("Manufacturing Incentives", "मैन्युफ़ैक्चरिंग इंसेंटिव"), "incentive"],
      [t("Technology & Innovation Support", "टेक्नोलॉजी और इनोवेशन सहायता"), "innovation"],
      [t("Skill Development", "स्किल डेवलपमेंट"), "skill"],
      [t("Agriculture Support", "कृषि सहायता"), "agriculture scheme"],
      [t("Women & Youth Entrepreneurship", "महिला और युवा उद्यमिता"), "women entrepreneur"],
      [t("Export Support", "निर्यात सहायता"), "export promotion"],
      [t("Public Notices & Policy Updates", "सार्वजनिक सूचनाएँ और नीति अपडेट"), "policy"],
      [t("Application Guides", "आवेदन गाइड"), "how to apply"],
    ],
  },
  {
    slug: "government-tenders",
    label: t("Government Business & Tenders", "सरकारी बिज़नेस और टेंडर"),
    description: t(
      "Tenders, GeM procurement, bidding and public contracts.",
      "टेंडर, GeM ख़रीद, बोली की प्रक्रिया और सरकारी कॉन्ट्रैक्ट।",
    ),
    icon: "clipboard-list",
    tone: "accent-secondary",
    topics: [
      [t("Tender Opportunities", "टेंडर के अवसर"), "tender"],
      [t("Department-wise Tenders", "विभागवार टेंडर"), "department tender"],
      [t("State-wise Tenders", "राज्यवार टेंडर"), "state tender"],
      [t("IT & Software Tenders", "IT और सॉफ़्टवेयर टेंडर"), "IT tender"],
      [t("Hardware & CCTV Tenders", "हार्डवेयर और CCTV टेंडर"), "CCTV tender"],
      [t("Infrastructure Tenders", "इन्फ्रास्ट्रक्चर टेंडर"), "infrastructure tender"],
      [t("GeM Procurement", "GeM ख़रीद"), "GeM"],
      [t("Eligibility & Documentation", "पात्रता और दस्तावेज़"), "eligibility"],
      [t("Bid Preparation", "बोली की तैयारी"), "bid"],
      [t("Public-Private Partnerships", "सार्वजनिक-निजी भागीदारी"), "PPP"],
      [t("Work Orders & Award Analysis", "वर्क ऑर्डर और अवॉर्ड विश्लेषण"), "work order"],
    ],
  },
  {
    slug: "global-markets",
    label: t("India & Global Markets", "भारत और ग्लोबल मार्केट्स"),
    description: t(
      "Opportunities across India's states and in markets around the world.",
      "भारत के राज्यों और दुनिया भर के बाज़ारों में बिज़नेस के अवसर।",
    ),
    icon: "earth",
    tone: "primary",
    topics: [
      [t("India Business", "भारत में बिज़नेस"), "India"],
      [t("State-wise Opportunities", "राज्यवार अवसर"), "state-wise"],
      [t("Asia-Pacific", "एशिया-पैसिफ़िक"), "Asia"],
      [t("Middle East", "मिडिल ईस्ट"), "Middle East"],
      [t("Europe", "यूरोप"), "Europe"],
      [t("North America", "नॉर्थ अमेरिका"), "North America"],
      [t("Latin America", "लैटिन अमेरिका"), "Latin America"],
      [t("Africa", "अफ़्रीका"), "Africa"],
      [t("Country Business Guides", "देशवार बिज़नेस गाइड"), "country guide"],
      [t("Global Trade", "ग्लोबल ट्रेड"), "global trade"],
      [t("Market Entry", "मार्केट एंट्री"), "market entry"],
      [t("Cross-Border Business", "क्रॉस-बॉर्डर बिज़नेस"), "cross-border"],
      [t("International Partnerships", "अंतरराष्ट्रीय साझेदारी"), "international partnership"],
      [t("Global Startup Ecosystems", "ग्लोबल स्टार्टअप इकोसिस्टम"), "global startup"],
    ],
  },
  {
    slug: "insights",
    label: t("Research & Insights", "रिसर्च और इनसाइट्स"),
    description: t(
      "Reports, trends, case studies and expert analysis.",
      "रिपोर्ट्स, ट्रेंड्स, केस स्टडी और विशेषज्ञों का विश्लेषण।",
    ),
    icon: "lightbulb",
    tone: "primary",
    topics: [
      [t("Industry Reports", "इंडस्ट्री रिपोर्ट्स"), "report"],
      [t("Market Trends", "मार्केट ट्रेंड्स"), "market trends"],
      [t("Sector Analysis", "सेक्टर विश्लेषण"), "sector analysis"],
      [t("Technology Trends", "टेक्नोलॉजी ट्रेंड्स"), "technology trends"],
      [t("Business Case Studies", "बिज़नेस केस स्टडी"), "case study"],
      [t("Company Profiles", "कंपनी प्रोफ़ाइल"), "company profile"],
      [t("Founder Interviews", "फ़ाउंडर इंटरव्यू"), "interview"],
      [t("Expert Opinions", "विशेषज्ञों की राय"), "opinion"],
      [t("Investment Trends", "निवेश ट्रेंड्स"), "investment trends"],
      [t("Future Opportunities", "भविष्य के अवसर"), "future"],
    ],
  },
  {
    slug: "resources",
    label: t("Tools & Resources", "टूल्स और संसाधन"),
    description: t(
      "Tool directories, comparisons, templates, calculators and guides.",
      "टूल डायरेक्टरी, तुलनाएँ, टेम्पलेट, कैलकुलेटर और गाइड।",
    ),
    icon: "toolbox",
    tone: "pink",
    topics: [
      [t("Software & AI Tool Directory", "सॉफ़्टवेयर और AI टूल डायरेक्टरी"), "tools"],
      [t("Product Comparisons", "प्रोडक्ट तुलनाएँ"), "vs"],
      [t("Buying Guides", "ख़रीदारी गाइड"), "buying guide"],
      [t("Business Calculators", "बिज़नेस कैलकुलेटर"), "calculator"],
      [t("Business Plan Templates", "बिज़नेस प्लान टेम्पलेट"), "business plan"],
      [t("Proposal & Tender Templates", "प्रपोज़ल और टेंडर टेम्पलेट"), "template"],
      [t("Checklists", "चेकलिस्ट"), "checklist"],
      [t("Tutorials", "ट्यूटोरियल"), "tutorial"],
      [t("Courses & Certifications", "कोर्स और सर्टिफ़िकेशन"), "course"],
      [t("Events & Exhibitions", "इवेंट्स और प्रदर्शनियाँ"), "event"],
      [t("Glossary", "शब्दावली"), "glossary"],
    ],
  },
];

async function main() {
  const replace = process.argv.includes("--replace");

  // Catch plan mistakes before writing anything.
  const planned = new Set(categories.map((c) => c.slug));
  for (const menu of DEFAULT_HEADER_MENUS) {
    for (const slug of menu.categories) {
      if (!planned.has(slug)) throw new Error(`Menu "${menu.labelEn}" uses "${slug}", which isn't in the plan.`);
    }
  }
  for (const c of categories) {
    if (c.topics.length > MAX_MENU_TOPICS) throw new Error(`${c.slug} has more than ${MAX_MENU_TOPICS} topics.`);
  }

  console.log(replace ? "Mode: --replace (plan topics and menu bar overwrite saved ones)\n" : "Mode: additive\n");

  for (const c of categories) {
    const existing = await prisma.topic.findUnique({
      where: { slug: c.slug },
      select: { id: true, label: true, _count: { select: { menuTopics: true } } },
    });

    let topicId: string;
    if (existing) {
      topicId = existing.id;
      console.log(`  = ${c.slug}: category exists ("${existing.label}"), kept`);
    } else {
      const created = await prisma.topic.create({
        data: {
          slug: c.slug,
          label: c.label.en,
          description: c.description.en,
          href: `/category/${c.slug}`,
          icon: c.icon,
          tone: c.tone,
          translations: { create: { locale: "hi", label: c.label.hi, description: c.description.hi } },
        },
        select: { id: true },
      });
      topicId = created.id;
      console.log(`  + ${c.slug}: category created ("${c.label.en}")`);
    }

    const saved = existing?._count.menuTopics ?? 0;
    if (saved > 0 && !replace) {
      console.log(`      submenu: ${saved} topics already saved, kept (use --replace for the plan's ${c.topics.length})`);
      continue;
    }
    // Delete and recreate together, so a failure never leaves a half-saved menu.
    await prisma.$transaction([
      prisma.menuTopic.deleteMany({ where: { topicId } }),
      prisma.menuTopic.createMany({
        data: c.topics.map(([label, query], sortOrder) => ({
          topicId,
          labelEn: label.en,
          labelHi: label.hi,
          query,
          // Show the full plan now; most keywords have no articles yet.
          alwaysShow: true,
          sortOrder,
        })),
      }),
    ]);
    console.log(`      submenu: ${c.topics.length} topics${saved > 0 ? ` (replaced ${saved})` : ""}`);
  }

  const menuSetting = await prisma.siteSetting.findUnique({ where: { key: HEADER_MENU_SETTING } });
  if (menuSetting && !replace) {
    console.log("\n  = menu bar: already saved in admin, kept (use --replace for the plan's menus)");
  } else {
    const value = JSON.stringify(DEFAULT_HEADER_MENUS);
    await prisma.siteSetting.upsert({
      where: { key: HEADER_MENU_SETTING },
      update: { value },
      create: { key: HEADER_MENU_SETTING, value },
    });
    console.log(`\n  + menu bar: ${DEFAULT_HEADER_MENUS.map((m) => m.labelEn).join(" | ")}`);
  }
}

main()
  .catch((error) => {
    console.error("Seeding the mega menu FAILED");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
