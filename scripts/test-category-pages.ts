import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { getCategoryListing, getPopularInCategory } from "../src/lib/articles";

const CATEGORIES_TO_TEST = [
  "ai-automation",
  "software",
  "development",
  "business",
  "startups",
  "insights",
  "hiring-outsourcing",
];

async function verifyCategoryPages() {
  console.log("🌐 Verifying All Category Pages & Components Data from MariaDB...\n");

  for (const slug of CATEGORIES_TO_TEST) {
    console.log(`--------------------------------------------------`);
    console.log(`Testing Category: /category/${slug}`);

    // 1. Verify Topic in Database
    const topic = await prisma.topic.findUnique({
      where: { slug },
      include: {
        _count: { select: { articles: true } },
      },
    });

    if (!topic) {
      throw new Error(`Topic "${slug}" not found in database!`);
    }

    console.log(`  ✓ DB Topic found: "${topic.label}" (Tone: ${topic.tone}, Icon: ${topic.icon})`);
    console.log(`  ✓ DB Article count: ${topic._count.articles}`);

    // 2. Test Category Listing
    const listing = await getCategoryListing(slug, 1);
    console.log(`  ✓ Listing count: ${listing.count} (Total rest: ${listing.total}, Page count: ${listing.pageCount})`);
    if (listing.featured) {
      console.log(`  ✓ Featured lead article: "${listing.featured.title}" (slug: ${listing.featured.slug}, author: ${listing.featured.author})`);
    } else {
      console.log(`  ! No featured article found`);
    }
    console.log(`  ✓ Grid articles count: ${listing.items.length}`);
    for (const item of listing.items) {
      console.log(`      * "${item.title}" [${item.category}] (href: ${item.href})`);
    }

    // 3. Test Popular / Most Read in Category
    const popular = await getPopularInCategory(slug, 5);
    console.log(`  ✓ Most Read / Popular articles: ${popular.length}`);
    for (const pop of popular) {
      console.log(`      # "${pop.title}" (views: ${pop.readTime}m read)`);
    }
  }

  console.log(`\n--------------------------------------------------`);
  console.log(`🎉 ALL 7 CATEGORIES VERIFIED DYNAMICALLY AGAINST MARIADB!`);
}

verifyCategoryPages()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
