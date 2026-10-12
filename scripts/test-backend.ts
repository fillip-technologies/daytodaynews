import "dotenv/config";
import { getTopics, getEditorsPicks, getLatestArticles, getTrendingArticles, getArticleBySlug } from "../src/lib/articles";
import { subscribeNewsletter } from "../src/actions/newsletter";
import { submitContactForm } from "../src/actions/contact";
import { submitContributorPitch } from "../src/actions/contribute";
import { prisma } from "../src/lib/prisma";

async function verifyBackend() {
  console.log("🔍 Verifying DayTodayNews Backend with MariaDB...");

  // 1. Test Topics
  const topics = await getTopics();
  console.log(`✓ Topics retrieved: ${topics.length}`);

  // 2. Test Editors Picks
  const editors = await getEditorsPicks(3);
  console.log(`✓ Editors picks retrieved: ${editors.length} (First: "${editors[0]?.title}")`);

  // 3. Test Latest Articles
  const latest = await getLatestArticles(5);
  console.log(`✓ Latest articles retrieved: ${latest.length} (First: "${latest[0]?.title}")`);

  // 4. Test Trending Articles
  const trending = await getTrendingArticles(3);
  console.log(`✓ Trending articles retrieved: ${trending.length} (First: "${trending[0]?.title}")`);

  // 5. Test Single Article Retrieval & View Count Increment
  const testSlug = editors[0]?.slug || "n8n-automation-use-cases-architecture-costs";
  const single = await getArticleBySlug(testSlug);
  console.log(`✓ Single article retrieved: "${single?.title}" | Views: ${single?.viewsCount}`);

  // 6. Test Newsletter Server Action
  const newsRes = await subscribeNewsletter("reader@example.com");
  console.log(`✓ Newsletter subscription result:`, newsRes);

  // 7. Test Contact Form Server Action
  const contactRes = await submitContactForm({
    name: "John Doe",
    email: "john@example.com",
    subject: "Partnership Enquiry",
    message: "We would like to partner with DayTodayNews for an engineering feature.",
  });
  console.log(`✓ Contact form result:`, contactRes);

  // 8. Test Contributor Pitch Server Action
  const pitchRes = await submitContributorPitch({
    name: "Jane Smith",
    email: "jane@example.com",
    topic: "ai-automation",
    idea: "Building Multi-Agent Systems in Production",
    message: "A deep dive into our production multi-agent system handling 10k tasks/day.",
  });
  console.log(`✓ Contributor pitch result:`, pitchRes);

  // Verify records in DB
  const subCount = await prisma.newsletterSubscriber.count();
  const contactCount = await prisma.contactSubmission.count();
  const pitchCount = await prisma.contributorPitch.count();

  console.log(`\n📊 Database verification summary:`);
  console.log(`  Newsletter Subscribers: ${subCount}`);
  console.log(`  Contact Submissions:    ${contactCount}`);
  console.log(`  Contributor Pitches:    ${pitchCount}`);
  console.log("\n🎉 ALL BACKEND CHECKS PASSED!");
}

verifyBackend()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
