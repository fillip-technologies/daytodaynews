"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  cleanFaq,
  cleanResources,
  cleanSlugList,
  cleanTakeaways,
  EXTRA_LIMITS,
} from "@/lib/article-extras";
import { recordMove } from "@/lib/redirects";
import { seoCreate, seoUpdate } from "@/lib/seo/nested";
import { cleanLocalizedSeo } from "@/lib/seo/validate";
import { cleanHttpUrl, cleanLine } from "@/lib/validation";
import type { ArticleStatus, ArticleType } from "@/generated/prisma";

export type ArticleMutationResult = {
  success: boolean;
  error?: string;
  slug?: string;
};

/** Text of an article in another language; an empty title means "no translation". */
type TranslationInput = {
  title?: string;
  description?: string | null;
  content?: string | null;
  focusKeyword?: string | null;
  takeaways?: string | null;
  faq?: unknown;
};

/** Everything the article editor sends. */
type ArticleInput = {
  title: string;
  slug: string;
  topicSlug: string;
  authorId?: string;
  description?: string;
  content?: string;
  readTime?: number;
  featured?: boolean;
  editorsPick?: boolean;
  trending?: boolean;
  status?: ArticleStatus;
  /** ISO date-time; a future one schedules the article. Empty: now (new) / unchanged (edit). */
  publishedAt?: string | null;
  coverPattern?: string;
  coverTones?: string;
  coverIcon?: string;
  imageUrl?: string;
  imageAlt?: string;
  focusKeyword?: string | null;
  takeaways?: string | null;
  faq?: unknown;
  articleType?: ArticleType;
  sponsorName?: string | null;
  sponsorUrl?: string | null;
  isPillar?: boolean;
  pillarSlug?: string | null;
  relatedListings?: unknown;
  resources?: unknown;
  hi?: TranslationInput;
  /** SEO overrides per language ({ en, hi }); empty fields mean automatic. */
  seo?: unknown;
};

const ARTICLE_TYPES: ArticleType[] = ["EDITORIAL", "GUEST", "SPONSORED"];
const STATUSES: ArticleStatus[] = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"];

function translationData(input: TranslationInput) {
  return {
    title: input.title?.trim() ?? "",
    description: input.description?.trim() || null,
    content: input.content?.trim() || null,
    focusKeyword: cleanLine(input.focusKeyword, EXTRA_LIMITS.focusKeyword) || null,
    takeaways: cleanTakeaways(input.takeaways),
    faq: cleanFaq(input.faq),
  };
}

async function requireStaff() {
  const current = await getCurrentUser();
  if (!current || (current.role !== "ADMIN" && current.role !== "EDITOR")) {
    throw new Error("Unauthorized: Staff editorial access required.");
  }
  return current;
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** A publish date from the editor, or null for "not given". */
function parsePublishDate(value: string | null | undefined): Result<Date | null> {
  if (!value) return { ok: true, value: null };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { ok: false, error: "The publish date is not a valid date." };
  const year = date.getUTCFullYear();
  if (year < 2000 || year > 2100) return { ok: false, error: "The publish date is out of range." };
  return { ok: true, value: date };
}

/** The editorial-framework fields shared by create and update, validated. */
async function extrasData(data: ArticleInput, slug: string) {
  const articleType = ARTICLE_TYPES.find((t) => t === data.articleType) ?? "EDITORIAL";
  const sponsorName = cleanLine(data.sponsorName, 150) || null;
  const sponsorUrlTyped = cleanLine(data.sponsorUrl, 2048);
  const sponsorUrl = sponsorUrlTyped ? cleanHttpUrl(sponsorUrlTyped) : null;
  if (articleType === "SPONSORED" && !sponsorName) {
    return { ok: false as const, error: "A sponsored article needs the sponsor's name (it is shown to readers)." };
  }
  if (sponsorUrlTyped && !sponsorUrl) return { ok: false as const, error: "Sponsor website must start with https://" };

  const isPillar = Boolean(data.isPillar);
  let pillarSlug = isPillar ? null : cleanLine(data.pillarSlug, 191).toLowerCase() || null;
  if (pillarSlug === slug) pillarSlug = null;
  if (pillarSlug) {
    const pillar = await prisma.article.findUnique({ where: { slug: pillarSlug }, select: { id: true } });
    if (!pillar) return { ok: false as const, error: `The pillar guide "${pillarSlug}" does not exist.` };
  }

  const resources = cleanResources(data.resources);
  if (!resources.ok) return { ok: false as const, error: resources.error };

  return {
    ok: true as const,
    value: {
      focusKeyword: cleanLine(data.focusKeyword, EXTRA_LIMITS.focusKeyword) || null,
      takeaways: cleanTakeaways(data.takeaways),
      faq: cleanFaq(data.faq),
      articleType,
      sponsorName: articleType === "SPONSORED" ? sponsorName : null,
      sponsorUrl: articleType === "SPONSORED" ? sponsorUrl : null,
      isPillar,
      pillarSlug,
      relatedListings: cleanSlugList(data.relatedListings, EXTRA_LIMITS.listings),
      resources: resources.value,
    },
  };
}

export async function createArticle(data: ArticleInput): Promise<ArticleMutationResult> {
  try {
    const staff = await requireStaff();

    const seo = cleanLocalizedSeo(data.seo);
    if (!seo.ok) return { success: false, error: seo.error };

    const title = data.title.trim();
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

    if (!title || !slug || !data.topicSlug) {
      return { success: false, error: "Title, slug, and topic are required." };
    }

    const publishedAt = parsePublishDate(data.publishedAt);
    if (!publishedAt.ok) return { success: false, error: publishedAt.error };
    const extras = await extrasData(data, slug);
    if (!extras.ok) return { success: false, error: extras.error };

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: "An article with this URL slug already exists." };
    }

    const author = data.authorId
      ? await prisma.user.findUnique({ where: { id: data.authorId } })
      : null;

    await prisma.article.create({
      data: {
        title,
        slug,
        topicSlug: data.topicSlug,
        authorId: author?.id || staff.id,
        authorName: author?.name || staff.name,
        description: data.description?.trim() || null,
        content: data.content?.trim() || null,
        readTime: Number(data.readTime) || 5,
        featured: Boolean(data.featured),
        editorsPick: Boolean(data.editorsPick),
        trending: Boolean(data.trending),
        status: STATUSES.find((s) => s === data.status) ?? "PUBLISHED",
        coverPattern: data.coverPattern || "orbit",
        coverTones: data.coverTones || JSON.stringify(["primary", "accent-secondary"]),
        coverIcon: data.coverIcon || "sparkles",
        imageUrl: data.imageUrl?.trim() || null,
        imageAlt: data.imageAlt?.trim() || null,
        publishedAt: publishedAt.value ?? new Date(),
        ...extras.value,
        translations: data.hi?.title?.trim()
          ? { create: { locale: "hi", ...translationData(data.hi) } }
          : undefined,
        seo: seoCreate(seo.value),
      },
    });

    revalidatePath("/", "layout"); // Every public page in every language; header menus show articles too.
    revalidatePath("/admin/articles");
    return { success: true, slug };
  } catch (error) {
    console.error("Create article error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create article." };
  }
}

export async function updateArticle(id: string, data: ArticleInput): Promise<ArticleMutationResult> {
  try {
    await requireStaff();

    const seo = cleanLocalizedSeo(data.seo);
    if (!seo.ok) return { success: false, error: seo.error };

    const title = data.title.trim();
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

    if (!title || !slug || !data.topicSlug) {
      return { success: false, error: "Title, slug, and topic are required." };
    }

    const existing = await prisma.article.findUnique({
      where: { id },
      include: { translations: { where: { locale: "hi" } } },
    });
    if (!existing) {
      return { success: false, error: "Article not found." };
    }

    // Slug conflict check
    if (slug !== existing.slug) {
      const slugTaken = await prisma.article.findUnique({ where: { slug } });
      if (slugTaken) {
        return { success: false, error: "Slug is already used by another article." };
      }
    }

    const publishedAt = parsePublishDate(data.publishedAt);
    if (!publishedAt.ok) return { success: false, error: publishedAt.error };
    const extras = await extrasData(data, slug);
    if (!extras.ok) return { success: false, error: extras.error };

    const author = data.authorId
      ? await prisma.user.findUnique({ where: { id: data.authorId } })
      : null;

    const description = data.description?.trim() || null;
    const content = data.content?.trim() || null;
    const hi = data.hi?.title?.trim() ? translationData(data.hi) : null;
    const oldHi = existing.translations[0];

    // "Updated" date: only when the text readers see changed on an article that was already live.
    const wasLive = existing.status === "PUBLISHED" && existing.publishedAt.getTime() <= Date.now();
    const textChanged =
      title !== existing.title ||
      description !== existing.description ||
      content !== existing.content ||
      extras.value.takeaways !== existing.takeaways ||
      extras.value.faq !== existing.faq ||
      (hi ? hi.title !== oldHi?.title || hi.content !== oldHi?.content || hi.description !== oldHi?.description : false);

    await prisma.article.update({
      where: { id },
      data: {
        title,
        slug,
        topicSlug: data.topicSlug,
        authorId: author ? author.id : existing.authorId,
        authorName: author ? author.name : existing.authorName,
        description,
        content,
        readTime: Number(data.readTime) || existing.readTime,
        featured: data.featured !== undefined ? data.featured : existing.featured,
        editorsPick: data.editorsPick !== undefined ? data.editorsPick : existing.editorsPick,
        trending: data.trending !== undefined ? data.trending : existing.trending,
        status: STATUSES.find((s) => s === data.status) ?? existing.status,
        publishedAt: publishedAt.value ?? existing.publishedAt,
        contentUpdatedAt: wasLive && textChanged ? new Date() : existing.contentUpdatedAt,
        coverPattern: data.coverPattern || existing.coverPattern,
        coverTones: data.coverTones || existing.coverTones,
        coverIcon: data.coverIcon || existing.coverIcon,
        imageUrl: data.imageUrl !== undefined ? (data.imageUrl?.trim() || null) : existing.imageUrl,
        imageAlt: data.imageAlt !== undefined ? (data.imageAlt?.trim() || null) : existing.imageAlt,
        ...extras.value,
        // Hindi version: saved with the article, or removed when its title is cleared.
        translations: !data.hi
          ? undefined
          : hi
            ? {
                upsert: {
                  where: { articleId_locale: { articleId: id, locale: "hi" } },
                  update: hi,
                  create: { locale: "hi", ...hi },
                },
              }
            : { deleteMany: { locale: "hi" } },
        seo: seoUpdate(seo.value, { articleId: id }),
      },
    });

    // A new slug keeps the old address working (301), and supporting articles follow their pillar.
    if (slug !== existing.slug) {
      await recordMove(`/articles/${existing.slug}`, `/articles/${slug}`, `Slug changed: ${title}`);
      await prisma.article.updateMany({ where: { pillarSlug: existing.slug }, data: { pillarSlug: slug } });
    }

    revalidatePath("/", "layout"); // Every public page in every language; header menus show articles too.
    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${id}/edit`);
    return { success: true, slug };
  } catch (error) {
    console.error("Update article error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update article." };
  }
}

export async function deleteArticle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireStaff();

    await prisma.article.delete({
      where: { id },
    });

    revalidatePath("/", "layout"); // Every public page in every language; header menus show articles too.
    revalidatePath("/admin/articles");
    return { success: true };
  } catch (error) {
    console.error("Delete article error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete article." };
  }
}

export async function toggleArticleStatus(
  id: string,
  newStatus: ArticleStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireStaff();
    if (!STATUSES.includes(newStatus)) return { success: false, error: "Unknown status." };

    await prisma.article.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath("/", "layout"); // Every public page in every language; header menus show articles too.
    revalidatePath("/admin/articles");
    return { success: true };
  } catch (error) {
    console.error("Toggle status error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle status." };
  }
}

export async function toggleArticleFlag(
  id: string,
  flag: "featured" | "editorsPick" | "trending"
): Promise<{ success: boolean; error?: string; newValue?: boolean }> {
  try {
    await requireStaff();

    const current = await prisma.article.findUnique({
      where: { id },
      select: { featured: true, editorsPick: true, trending: true },
    });

    if (!current) {
      return { success: false, error: "Article not found." };
    }

    const nextVal = !current[flag];

    await prisma.article.update({
      where: { id },
      data: { [flag]: nextVal },
    });

    revalidatePath("/", "layout"); // Every public page in every language; header menus show articles too.
    revalidatePath("/admin/articles");
    return { success: true, newValue: nextVal };
  } catch (error) {
    console.error("Toggle flag error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle flag." };
  }
}

export async function duplicateArticle(id: string): Promise<ArticleMutationResult> {
  try {
    const staff = await requireStaff();

    const original = await prisma.article.findUnique({ where: { id } });
    if (!original) {
      return { success: false, error: "Original article not found." };
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newSlug = `${original.slug}-copy-${randomSuffix}`;
    const newTitle = `${original.title} (Draft Copy)`;

    const duplicate = await prisma.article.create({
      data: {
        title: newTitle,
        slug: newSlug,
        topicSlug: original.topicSlug,
        authorId: staff.id,
        authorName: staff.name,
        description: original.description,
        content: original.content,
        readTime: original.readTime,
        featured: false,
        editorsPick: false,
        trending: false,
        status: "DRAFT",
        coverPattern: original.coverPattern,
        coverTones: original.coverTones,
        coverIcon: original.coverIcon,
        focusKeyword: original.focusKeyword,
        takeaways: original.takeaways,
        faq: original.faq,
        articleType: original.articleType,
        sponsorName: original.sponsorName,
        sponsorUrl: original.sponsorUrl,
        pillarSlug: original.pillarSlug,
        relatedListings: original.relatedListings,
        resources: original.resources,
        publishedAt: new Date(),
      },
    });

    revalidatePath("/admin/articles");
    return { success: true, slug: duplicate.slug };
  } catch (error) {
    console.error("Duplicate article error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to duplicate article." };
  }
}
