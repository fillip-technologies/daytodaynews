import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { prisma } from "../src/lib/prisma";

// One-time fix for the 90-day plan's "future publication dates" issue: published
// articles dated in the future (e.g. December 2026) are moved into the past,
// keeping their order and spacing, so the newest one ends up just before now.
//
// Scheduling (src/lib/visibility.ts, SCHEDULING_ENABLED) is off until this has
// run: once on, a published article with a future date is hidden until that
// date, so run this first or those articles would disappear until December.
//
//   npm run fix:dates            → shows what would change (nothing is written)
//   npm run fix:dates -- --apply → backs up the old dates, then changes them
//
// The backup (scripts/backups/future-dates-*.json) can be used to restore.

async function main() {
  const apply = process.argv.includes("--apply");
  const now = new Date();
  const future = await prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { gt: now } },
    orderBy: { publishedAt: "asc" },
    select: { id: true, slug: true, title: true, publishedAt: true },
  });

  if (future.length === 0) {
    console.log("✓ No published article has a future date. Nothing to do.");
    return;
  }

  // The latest future article lands one hour ago; the rest keep their gaps.
  const latest = future[future.length - 1].publishedAt.getTime();
  const offset = latest - (now.getTime() - 60 * 60 * 1000);
  const changes = future.map((a) => ({ ...a, newDate: new Date(a.publishedAt.getTime() - offset) }));

  console.log(`${future.length} published article(s) have a future date:\n`);
  for (const c of changes) {
    console.log(`  ${c.publishedAt.toISOString().slice(0, 10)} → ${c.newDate.toISOString().slice(0, 10)}  ${c.title}`);
  }

  if (!apply) {
    console.log("\nDry run: nothing was changed. Run with --apply to update the dates (a backup is written first).");
    return;
  }

  const dir = path.join(process.cwd(), "scripts", "backups");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `future-dates-${now.toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(
    file,
    JSON.stringify(
      changes.map((c) => ({ id: c.id, slug: c.slug, publishedAt: c.publishedAt.toISOString() })),
      null,
      2,
    ),
  );
  console.log(`\nBackup written: ${file}`);

  for (const c of changes) {
    // contentUpdatedAt is left alone: moving a date is not a content update.
    await prisma.article.update({ where: { id: c.id }, data: { publishedAt: c.newDate } });
  }
  console.log(`✓ Updated ${changes.length} article(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
