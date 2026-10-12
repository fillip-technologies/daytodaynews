import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../src/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "eeoc88be",
  api_key: process.env.CLOUDINARY_API_KEY || "526255767589351",
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Curated high-resolution editorial tech & business photography (Unsplash CDN)
const TOPIC_PHOTO_MAP: Record<string, string> = {
  // AI & Workflow Automation
  "ai-automation-reduce-manual-work":
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  "business-processes-to-automate-with-ai-2026":
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
  "ai-agents-business-use-cases":
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
  "ai-agents-business-use-cases-beyond-chatbots":
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  "n8n-ai-workflow-automation":
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
  "n8n-automation-use-cases-architecture-costs":
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "ai-automation-customer-support":
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",

  // Software Engineering & Architecture
  "custom-software-development-guide-2026":
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  "microservices-vs-monolith-2026":
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  "choose-software-development-company-india":
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  "custom-software-development-cost-india":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",

  // Web & Product Development
  "web-development-trends-2026":
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  "react-vs-nextjs-business-web-apps":
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
  "custom-web-app-cost-2026":
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
  "web-application-cost-2026":
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
  "improve-core-web-vitals-without-sacrificing-design":
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80",

  // Business & Productivity
  "ai-automation-team-productivity":
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  "ai-automation-cost-2026":
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
  "ai-for-startups-growth-strategies":
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
  "turn-website-traffic-into-qualified-leads":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",

  // Startups & Teams
  "startup-technology-stack-2026":
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  "dedicated-developer-vs-freelancer-vs-agency":
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",

  // Insights & CTO Leadership
  "n8n-vs-make-vs-zapier":
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "ai-vs-traditional-automation":
    "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80",
  "cto-guide-ai-governance-2026":
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",

  // Hiring & Outsourcing
  "it-staff-augmentation-india-guide":
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
  "software-outsourcing-india-buyers-guide":
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  "hire-manage-dedicated-developers-india":
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
  "hire-react-nextjs-developers-india":
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
};

// Generic fallbacks by topic
const TOPIC_FALLBACKS: Record<string, string> = {
  "ai-automation": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  software: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  development: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  business: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  startups: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  insights: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "hiring-outsourcing": "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
};

async function main() {
  console.log("🚀 Starting Cloudinary Image Migration for Articles...");

  // 1. Fetch all articles from MariaDB
  const articles = await prisma.article.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      topicSlug: true,
      imageUrl: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${articles.length} articles in database.\n`);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`[${i + 1}/${articles.length}] Processing "${article.title}" (${article.slug})...`);

    // Pick appropriate photo
    const sourcePhotoUrl =
      TOPIC_PHOTO_MAP[article.slug] ||
      TOPIC_FALLBACKS[article.topicSlug] ||
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80";

    try {
      // Upload to Cloudinary with optimization & 16:9 crop
      const uploadRes = await cloudinary.uploader.upload(sourcePhotoUrl, {
        folder: "daytodaynews/articles",
        public_id: article.slug,
        overwrite: true,
        resource_type: "image",
      });

      console.log(`   ✓ Uploaded to Cloudinary: ${uploadRes.secure_url}`);

      // Update article record in MariaDB
      await prisma.article.update({
        where: { id: article.id },
        data: {
          imageUrl: uploadRes.secure_url,
          imageAlt: article.title,
        },
      });

      console.log(`   ✓ Updated DB record for article "${article.slug}"`);
      successCount++;
    } catch (err) {
      console.error(`   ✗ Error uploading/updating "${article.slug}":`, err);
      errorCount++;
    }
  }

  console.log("\n==========================================");
  console.log(`🎉 MIGRATION FINISHED!`);
  console.log(`   Total: ${articles.length}`);
  console.log(`   Uploaded & Updated: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log("==========================================");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
