// Verifies the database connection through Prisma Client + the pg adapter.
// Run with: npm run db:check
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const [result] = await prisma.$queryRaw<
    { database: string; version: string }[]
  >`SELECT current_database() AS database, version() AS version`;

  console.log("Database connection OK");
  console.log(`  database: ${result.database}`);
  console.log(`  server:   ${result.version.split(",")[0]}`);
}

main()
  .catch((error) => {
    console.error("Database connection FAILED");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
