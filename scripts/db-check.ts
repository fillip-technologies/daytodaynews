// Verifies the database connection through Prisma Client with MariaDB/MySQL.
// Run with: npm run db:check
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const [result] = await prisma.$queryRaw<
    { database: string; version: string }[]
  >`SELECT DATABASE() AS \`database\`, VERSION() AS \`version\``;

  console.log("Database connection OK");
  console.log(`  database: ${result.database}`);
  console.log(`  server:   ${result.version}`);

  const topics = await prisma.topic.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { slug: "asc" },
  });

  console.log("\nTopics in DB:");
  for (const t of topics) {
    console.log(`  - ${t.slug} (${t.label}): ${t._count.articles} articles`);
    const articles = await prisma.article.findMany({
      where: { topicSlug: t.slug },
      select: { title: true, slug: true, status: true, featured: true, trending: true, editorsPick: true },
    });
    for (const a of articles) {
      console.log(`      * [${a.status}] "${a.title}" (slug: ${a.slug}) featured=${a.featured} trending=${a.trending}`);
    }
  }
}

main()
  .catch((error) => {
    console.error("Database connection FAILED");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
