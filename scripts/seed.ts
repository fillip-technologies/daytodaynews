import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { topics } from "../src/data/topics";
import {
  blogArticles,
  editorsPicks,
  latestArticles,
  trendingArticles,
} from "../src/data/articles";
import type { Article } from "../src/types/article";

async function main() {
  console.log("🌱 Starting MariaDB database seeding for DayTodayNews...");

  const adminPasswordHash = await bcrypt.hash("Admin@2026!", 10);
  const authorPasswordHash = await bcrypt.hash("Author@2026!", 10);

  // 1. Seed Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@daytodaynews.com" },
    update: {
      name: "Super Admin",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
      isActive: true,
      bio: "Master administrator for DayTodayNews platform operations.",
    },
    create: {
      email: "admin@daytodaynews.com",
      name: "Super Admin",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
      isActive: true,
      bio: "Master administrator for DayTodayNews platform operations.",
    },
  });
  console.log(`✓ Seeded Super Admin: ${admin.email} (Password: Admin@2026!)`);

  // 2. Seed Default Author
  const author = await prisma.user.upsert({
    where: { email: "shruti@daytodaynews.com" },
    update: {
      name: "Shruti Singh",
      role: "EDITOR",
      passwordHash: authorPasswordHash,
      isActive: true,
      bio: "Editorial Director & Tech Analyst at DayTodayNews, covering artificial intelligence, cloud architecture, and modern product engineering.",
    },
    create: {
      email: "shruti@daytodaynews.com",
      name: "Shruti Singh",
      role: "EDITOR",
      passwordHash: authorPasswordHash,
      isActive: true,
      bio: "Editorial Director & Tech Analyst at DayTodayNews, covering artificial intelligence, cloud architecture, and modern product engineering.",
    },
  });
  console.log(`✓ Seeded Editor: ${author.name} (${author.email})`);

  // 2. Seed Topics
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {
        label: topic.label,
        description: topic.description,
        href: topic.href,
        icon: topic.icon,
        tone: topic.tone,
      },
      create: {
        slug: topic.slug,
        label: topic.label,
        description: topic.description,
        href: topic.href,
        icon: topic.icon,
        tone: topic.tone,
      },
    });
  }
  console.log(`✓ Seeded ${topics.length} topics`);

  // 3. Aggregate unique articles
  const slugOf = (href: string) => href.split("/").pop() || "";
  const editorsSlugs = new Set(editorsPicks.map((a) => a.slug || slugOf(a.href)));
  const trendingMap = new Map(
    trendingArticles.map((a, idx) => [a.slug || slugOf(a.href), idx + 1])
  );

  const allArticlesMap = new Map<string, Article>();

  for (const article of [...blogArticles, ...latestArticles, ...editorsPicks, ...trendingArticles]) {
    const slug = article.slug || slugOf(article.href);
    if (slug && !allArticlesMap.has(slug)) {
      allArticlesMap.set(slug, article);
    }
  }

  // 4. Seed Articles
  let articleCount = 0;
  for (const [slug, article] of allArticlesMap.entries()) {
    const isEditorsPick = editorsSlugs.has(slug);
    const isTrending = trendingMap.has(slug);
    const trendingRank = trendingMap.get(slug) ?? null;
    const isFeatured = Boolean(article.featured);

    const fallbackDescription =
      article.description ||
      `Essential strategies and practical insights into ${article.title.toLowerCase()} for engineering and business leaders in 2026.`;

    const sampleContent = `
## Overview

In today's fast-moving technology ecosystem, implementing effective strategies around **${article.title}** enables organizations to unlock measurable efficiency gains and scale their operational footprint without accumulating technical debt.

Whether your team is optimizing existing systems or launching greenfield initiatives, understanding key trade-offs early in the development lifecycle prevents costly architectural rewrites and ensures predictable delivery.

---

### Key Takeaways & Architecture Considerations

1. **Strategic Prioritization**: Assess technical debt and architecture resilience before committing to heavy infrastructure changes.
2. **Autonomous Tooling & Automation**: Incorporate reliable verification pipelines, observability, and self-healing mechanisms.
3. **Execution & Team Velocity**: Align product metrics directly with deployment frequency and developer ergonomics.

> *"The most effective technology organizations treat engineering velocity and business outcomes as one and the same."*

---

### Practical Implementation Steps

- **Audit current capabilities:** Identify the specific bottlenecks that currently throttle your delivery cycle.
- **Prototype and iterate:** Deploy minimal vertical slices in staging environments to measure real-world performance.
- **Monitor and optimize:** Keep track of core latency, error budgets, and user feedback continuously.

### Looking Ahead

As tools and paradigms evolve throughout 2026 and beyond, building adaptable architectures backed by modular services and reliable databases ensures long-term agility and resilience.
    `.trim();

    await prisma.article.upsert({
      where: { slug },
      update: {
        title: article.title,
        description: fallbackDescription,
        content: sampleContent,
        readTime: article.readTime || 7,
        authorName: article.author || author.name,
        authorId: author.id,
        topicSlug: article.topic || "development",
        coverPattern: article.cover?.pattern || "orbit",
        coverTones: article.cover?.tones ? JSON.stringify(article.cover.tones) : null,
        coverIcon: article.cover?.icon || "sparkles",
        imageUrl: `https://res.cloudinary.com/eeoc88be/image/upload/daytodaynews/articles/${slug}.jpg`,
        imageAlt: article.title,
        featured: isFeatured,
        editorsPick: isEditorsPick,
        trending: isTrending,
        trendingRank: trendingRank,
        publishedAt: new Date(article.date || "2026-11-01"),
      },
      create: {
        slug,
        title: article.title,
        description: fallbackDescription,
        content: sampleContent,
        readTime: article.readTime || 7,
        authorName: article.author || author.name,
        authorId: author.id,
        topicSlug: article.topic || "development",
        coverPattern: article.cover?.pattern || "orbit",
        coverTones: article.cover?.tones ? JSON.stringify(article.cover.tones) : null,
        coverIcon: article.cover?.icon || "sparkles",
        imageUrl: `https://res.cloudinary.com/eeoc88be/image/upload/daytodaynews/articles/${slug}.jpg`,
        imageAlt: article.title,
        featured: isFeatured,
        editorsPick: isEditorsPick,
        trending: isTrending,
        trendingRank: trendingRank,
        publishedAt: new Date(article.date || "2026-11-01"),
      },
    });
    articleCount++;
  }

  console.log(`✓ Seeded ${articleCount} articles with complete metadata and content`);
  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
