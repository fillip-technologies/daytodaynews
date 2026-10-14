// Copies the mega-menu topics that used to be hard-coded into the database,
// where Admin → Mega Menu manages them. Safe to re-run: a category that already
// has topics is left as it is, so edits made in admin are never overwritten.
// Run with: npm run db:seed:menu
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

type SeedTopic = { label: { en: string; hi: string }; query: string };

const categoryTopics: Record<string, SeedTopic[]> = {
  "ai-automation": [
    { label: { en: "Artificial Intelligence", hi: "आर्टिफ़िशियल इंटेलिजेंस" }, query: "AI" },
    { label: { en: "Generative AI", hi: "जनरेटिव AI" }, query: "generative AI" },
    { label: { en: "AI Agents", hi: "AI एजेंट्स" }, query: "AI agents" },
    { label: { en: "Machine Learning", hi: "मशीन लर्निंग" }, query: "machine learning" },
    { label: { en: "Business Automation", hi: "बिज़नेस ऑटोमेशन" }, query: "business automation" },
    { label: { en: "AI Tools", hi: "AI टूल्स" }, query: "AI tools" },
    { label: { en: "Robotics", hi: "रोबोटिक्स" }, query: "robotics" },
    { label: { en: "Industry Applications", hi: "इंडस्ट्री में उपयोग" }, query: "use cases" },
    { label: { en: "Workflow Automation", hi: "वर्कफ़्लो ऑटोमेशन" }, query: "workflow" },
    { label: { en: "n8n", hi: "n8n" }, query: "n8n" },
    { label: { en: "Customer Support", hi: "कस्टमर सपोर्ट" }, query: "customer support" },
  ],
  software: [
    { label: { en: "Custom Software", hi: "कस्टम सॉफ़्टवेयर" }, query: "custom software" },
    { label: { en: "Software Architecture", hi: "सॉफ़्टवेयर आर्किटेक्चर" }, query: "architecture" },
    { label: { en: "Microservices", hi: "माइक्रोसर्विसेज़" }, query: "microservices" },
    { label: { en: "APIs & Integrations", hi: "API और इंटीग्रेशन" }, query: "API" },
    { label: { en: "Cloud & DevOps", hi: "क्लाउड और DevOps" }, query: "cloud" },
    { label: { en: "Software Tools", hi: "सॉफ़्टवेयर टूल्स" }, query: "tools" },
    { label: { en: "Development Costs", hi: "डेवलपमेंट की लागत" }, query: "cost" },
    { label: { en: "Choosing a Partner", hi: "सही पार्टनर चुनना" }, query: "company" },
    { label: { en: "Outsourcing to India", hi: "भारत में आउटसोर्सिंग" }, query: "India" },
  ],
  development: [
    { label: { en: "Web Development", hi: "वेब डेवलपमेंट" }, query: "web" },
    { label: { en: "Frontend Development", hi: "फ्रंटएंड डेवलपमेंट" }, query: "frontend" },
    { label: { en: "Backend Development", hi: "बैकएंड डेवलपमेंट" }, query: "backend" },
    { label: { en: "Full-Stack Development", hi: "फुल-स्टैक डेवलपमेंट" }, query: "full-stack" },
    { label: { en: "Mobile App Development", hi: "मोबाइल ऐप डेवलपमेंट" }, query: "mobile" },
    { label: { en: "React & Next.js", hi: "React और Next.js" }, query: "React" },
    { label: { en: "Web Performance", hi: "वेब परफ़ॉर्मेंस" }, query: "performance" },
    { label: { en: "Web Apps", hi: "वेब ऐप्स" }, query: "web app" },
    { label: { en: "Development Trends", hi: "डेवलपमेंट ट्रेंड्स" }, query: "trends" },
    { label: { en: "Project Costs", hi: "प्रोजेक्ट की लागत" }, query: "cost" },
  ],
  business: [
    { label: { en: "Business Opportunities", hi: "बिज़नेस के अवसर" }, query: "opportunities" },
    { label: { en: "Entrepreneurship", hi: "उद्यमिता" }, query: "entrepreneur" },
    { label: { en: "MSME & Small Business", hi: "MSME और छोटे व्यवसाय" }, query: "small business" },
    { label: { en: "Marketing & Growth", hi: "मार्केटिंग और ग्रोथ" }, query: "growth" },
    { label: { en: "Business Strategy", hi: "बिज़नेस रणनीति" }, query: "strategies" },
    { label: { en: "Funding & Investment", hi: "फ़ंडिंग और निवेश" }, query: "funding" },
    { label: { en: "Government Schemes", hi: "सरकारी योजनाएँ" }, query: "government schemes" },
    { label: { en: "Tenders & Procurement", hi: "टेंडर और ख़रीद" }, query: "tenders" },
    { label: { en: "Lead Generation", hi: "लीड जनरेशन" }, query: "leads" },
    { label: { en: "Team Productivity", hi: "टीम की उत्पादकता" }, query: "productivity" },
    { label: { en: "Automation Costs", hi: "ऑटोमेशन की लागत" }, query: "cost" },
    { label: { en: "AI for Business", hi: "बिज़नेस के लिए AI" }, query: "AI" },
  ],
  startups: [
    { label: { en: "Startup Ideas", hi: "स्टार्टअप आइडियाज़" }, query: "ideas" },
    { label: { en: "Startup News", hi: "स्टार्टअप न्यूज़" }, query: "news" },
    { label: { en: "Funding & Investors", hi: "फ़ंडिंग और निवेशक" }, query: "funding" },
    { label: { en: "Founder Stories", hi: "फ़ाउंडर्स की कहानियाँ" }, query: "founder" },
    { label: { en: "Startup Resources", hi: "स्टार्टअप संसाधन" }, query: "resources" },
    { label: { en: "Product Development", hi: "प्रोडक्ट डेवलपमेंट" }, query: "product" },
    { label: { en: "Growth Strategies", hi: "ग्रोथ रणनीतियाँ" }, query: "growth" },
    { label: { en: "Tech Stack", hi: "टेक स्टैक" }, query: "stack" },
    { label: { en: "Building a Team", hi: "टीम बनाना" }, query: "developer" },
  ],
  "hiring-outsourcing": [
    { label: { en: "Hire Developers", hi: "डेवलपर्स हायर करें" }, query: "hire" },
    { label: { en: "Outsourcing", hi: "आउटसोर्सिंग" }, query: "outsourcing" },
    { label: { en: "Staff Augmentation", hi: "स्टाफ़ ऑगमेंटेशन" }, query: "staff augmentation" },
    { label: { en: "Dedicated Teams", hi: "डेडिकेटेड टीमें" }, query: "dedicated" },
    { label: { en: "React & Next.js Developers", hi: "React और Next.js डेवलपर्स" }, query: "React" },
    { label: { en: "Hiring in India", hi: "भारत में हायरिंग" }, query: "India" },
  ],
  insights: [
    { label: { en: "Comparisons", hi: "तुलनाएँ" }, query: "vs" },
    { label: { en: "AI Governance", hi: "AI गवर्नेंस" }, query: "governance" },
    { label: { en: "Technology Trends", hi: "टेक्नोलॉजी ट्रेंड्स" }, query: "trends" },
    { label: { en: "Automation", hi: "ऑटोमेशन" }, query: "automation" },
    { label: { en: "CTO Guides", hi: "CTO गाइड" }, query: "CTO" },
  ],
};

async function main() {
  for (const [slug, topics] of Object.entries(categoryTopics)) {
    const topic = await prisma.topic.findUnique({
      where: { slug },
      select: { id: true, _count: { select: { menuTopics: true } } },
    });
    if (!topic) {
      console.log(`  - ${slug}: not in the database, skipped`);
      continue;
    }
    if (topic._count.menuTopics > 0) {
      console.log(`  = ${slug}: already has ${topic._count.menuTopics} topics, kept`);
      continue;
    }
    await prisma.menuTopic.createMany({
      data: topics.map((t, sortOrder) => ({
        topicId: topic.id,
        labelEn: t.label.en,
        labelHi: t.label.hi,
        query: t.query,
        sortOrder,
      })),
    });
    console.log(`  + ${slug}: ${topics.length} topics`);
  }
}

main()
  .catch((error) => {
    console.error("Seeding menu topics FAILED");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
