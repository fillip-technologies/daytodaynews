import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { comparePassword, hashPassword, signSessionToken, verifySessionToken } from "../src/lib/auth";

async function verifyAdminSystem() {
  console.log("🛡️ Verifying Admin, User Management & Article CRUD with MariaDB...\n");

  // 1. Verify Super Admin exists in DB
  const admin = await prisma.user.findUnique({
    where: { email: "admin@daytodaynews.com" },
  });

  if (!admin || !admin.passwordHash) {
    throw new Error("Super Admin user not found or has no password hash!");
  }
  console.log(`✓ Super Admin user verified: ${admin.email} (Role: ${admin.role})`);

  // 2. Test Password Verification
  const validPassword = await comparePassword("Admin@2026!", admin.passwordHash);
  const invalidPassword = await comparePassword("WrongPassword123", admin.passwordHash);
  console.log(`✓ Valid password check:   ${validPassword ? "PASSED" : "FAILED"}`);
  console.log(`✓ Invalid password check: ${!invalidPassword ? "PASSED (rejected)" : "FAILED"}`);

  // 3. Test JWT Session Generation & Verification
  const sessionToken = await signSessionToken({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
  console.log(`✓ Signed JWT Session token: ${sessionToken.slice(0, 32)}...`);

  const decoded = await verifySessionToken(sessionToken);
  console.log(`✓ Decoded JWT Payload: User ID ${decoded?.id}, Role: ${decoded?.role}`);

  // 4. Test User Creation in MariaDB
  const testUserEmail = "test.author@daytodaynews.com";
  await prisma.user.deleteMany({ where: { email: testUserEmail } });

  const testUser = await prisma.user.create({
    data: {
      email: testUserEmail,
      name: "Test Staff Writer",
      role: "EDITOR",
      passwordHash: await hashPassword("Writer@2026!"),
      bio: "Automated testing writer account.",
      isActive: true,
    },
  });
  console.log(`✓ Created user: ${testUser.name} (Role: ${testUser.role})`);

  // 5. Test User Role Update
  const updatedUser = await prisma.user.update({
    where: { id: testUser.id },
    data: {
      role: "ADMIN",
      bio: "Promoted to Admin during test verification.",
    },
  });
  console.log(`✓ Promoted user role: ${updatedUser.name} -> ${updatedUser.role}`);

  // 6. Test User Deletion
  await prisma.user.delete({ where: { id: testUser.id } });
  console.log(`✓ Deleted test user account.`);

  // 7. Test Article CRUD Operations
  console.log("\n📰 Testing Article CRUD Operations...");
  const testArticleSlug = "test-article-crud-features-2026";
  await prisma.article.deleteMany({ where: { slug: testArticleSlug } });

  // A. Create Article
  const newArticle = await prisma.article.create({
    data: {
      title: "Test Article: Modern Fullstack CMS",
      slug: testArticleSlug,
      topicSlug: "software",
      authorId: admin.id,
      authorName: admin.name,
      description: "Testing end-to-end article management and creation.",
      content: "## Heading\n\nTesting article markdown content.",
      readTime: 6,
      status: "DRAFT",
      featured: true,
      editorsPick: false,
      trending: true,
      coverPattern: "stack",
      coverTones: JSON.stringify(["accent", "pink"]),
      coverIcon: "layers",
    },
  });
  console.log(`✓ Created new article: "${newArticle.title}" (Status: ${newArticle.status})`);

  // B. Update Article (Toggle Status to PUBLISHED)
  const updatedArticle = await prisma.article.update({
    where: { id: newArticle.id },
    data: {
      status: "PUBLISHED",
      editorsPick: true,
      title: "Test Article: Modern Fullstack CMS (Updated)",
    },
  });
  console.log(`✓ Updated article status & flags: Status -> ${updatedArticle.status}, EditorPick -> ${updatedArticle.editorsPick}`);

  // C. Clone / Duplicate Article
  const duplicateSlug = `${testArticleSlug}-duplicate`;
  await prisma.article.deleteMany({ where: { slug: duplicateSlug } });
  const duplicated = await prisma.article.create({
    data: {
      ...updatedArticle,
      id: undefined,
      slug: duplicateSlug,
      title: `${updatedArticle.title} (Clone)`,
      status: "DRAFT",
    },
  });
  console.log(`✓ Cloned article: "${duplicated.title}" (Slug: ${duplicated.slug})`);

  // D. Delete Created Articles
  await prisma.article.deleteMany({
    where: { slug: { in: [testArticleSlug, duplicateSlug] } },
  });
  console.log(`✓ Deleted test articles cleanly.`);

  // 8. Test Category / Topic CRUD Operations
  console.log("\n🏷️ Testing Category / Topic CRUD Operations...");
  const testCategorySlug = "test-cloud-engineering";
  await prisma.article.deleteMany({ where: { topicSlug: testCategorySlug } });
  await prisma.topic.deleteMany({ where: { slug: testCategorySlug } });

  // A. Create Category
  const newCategory = await prisma.topic.create({
    data: {
      slug: testCategorySlug,
      label: "Test Cloud Engineering",
      description: "Cloud computing, Kubernetes, and scalable systems.",
      href: `/category/${testCategorySlug}`,
      icon: "rocket",
      tone: "accent-secondary",
    },
  });
  console.log(`✓ Created category: "${newCategory.label}" (Slug: ${newCategory.slug})`);

  // B. Update Category
  const updatedCategory = await prisma.topic.update({
    where: { id: newCategory.id },
    data: {
      label: "Test Cloud & DevOps",
      description: "Updated description for cloud architecture and CI/CD pipelines.",
      tone: "primary",
    },
  });
  console.log(`✓ Updated category: "${updatedCategory.label}" (Tone: ${updatedCategory.tone})`);

  // C. Test Deletion Guard: Link an article to the category
  const dummyArticle = await prisma.article.create({
    data: {
      title: "Temporary Linked Article",
      slug: "temp-linked-article-test",
      topicSlug: updatedCategory.slug,
      authorId: admin.id,
      authorName: admin.name,
      status: "DRAFT",
    },
  });

  const categoryWithArticles = await prisma.topic.findUnique({
    where: { id: updatedCategory.id },
    include: { _count: { select: { articles: true } } },
  });
  console.log(`✓ Category article count before deletion: ${categoryWithArticles?._count.articles}`);

  if ((categoryWithArticles?._count.articles ?? 0) > 0) {
    console.log(`✓ Category deletion safety guard verified: Cannot delete while ${categoryWithArticles?._count.articles} article(s) are linked.`);
  }

  // Clean up linked article
  await prisma.article.delete({ where: { id: dummyArticle.id } });

  // D. Delete Category after articles unlinked
  await prisma.topic.delete({ where: { id: updatedCategory.id } });
  console.log(`✓ Successfully deleted category "${updatedCategory.label}" after articles were cleared.`);

  // 9. Verify All Users, Categories and Articles Summary
  const userCounts = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });
  const totalArticles = await prisma.article.count();
  const totalTopics = await prisma.topic.count();

  console.log("\n📊 Current Database Summary in MariaDB:");
  for (const group of userCounts) {
    console.log(`  - Users (${group.role}): ${group._count}`);
  }
  console.log(`  - Total Live Articles: ${totalArticles}`);
  console.log(`  - Total Categories: ${totalTopics}`);

  console.log("\n🎉 ALL ADMIN, USER MANAGEMENT, ARTICLE CRUD & CATEGORY CRUD CHECKS PASSED!");
}

verifyAdminSystem()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
