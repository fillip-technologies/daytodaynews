// Adds Hindi names and descriptions for the built-in categories. Safe to re-run:
// it only fills in missing translations and never overwrites edits made in admin.
// Run with: npm run db:seed:hi
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const hindi: Record<string, { label: string; description: string }> = {
  "ai-automation": { label: "AI और ऑटोमेशन", description: "टूल्स, वर्कफ़्लो और उपयोग के उदाहरण" },
  software: { label: "सॉफ़्टवेयर डेवलपमेंट", description: "गाइड और बेस्ट प्रैक्टिस" },
  development: { label: "डेवलपमेंट", description: "वेब, मोबाइल और इंजीनियरिंग" },
  "hiring-outsourcing": { label: "हायरिंग और आउटसोर्सिंग", description: "अपनी टेक्नोलॉजी टीम बनाएँ" },
  business: { label: "बिज़नेस", description: "टेक्नोलॉजी और ग्रोथ" },
  startups: { label: "स्टार्टअप्स", description: "आइडियाज़ और ट्रेंड्स" },
  insights: { label: "इनसाइट्स", description: "विश्लेषण और नज़रिया" },
};

async function main() {
  for (const [slug, text] of Object.entries(hindi)) {
    const topic = await prisma.topic.findUnique({ where: { slug } });
    if (!topic) {
      console.log(`  - ${slug}: not in the database, skipped`);
      continue;
    }
    const existing = await prisma.topicTranslation.findUnique({
      where: { topicId_locale: { topicId: topic.id, locale: "hi" } },
    });
    if (existing) {
      console.log(`  = ${slug}: already "${existing.label}", kept`);
      continue;
    }
    await prisma.topicTranslation.create({ data: { topicId: topic.id, locale: "hi", ...text } });
    console.log(`  + ${slug}: ${text.label}`);
  }
}

main()
  .catch((error) => {
    console.error("Seeding Hindi category names FAILED");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
