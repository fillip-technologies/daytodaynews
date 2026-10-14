"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { seoCreate, seoUpdate } from "@/lib/seo/nested";
import { cleanLocalizedSeo } from "@/lib/seo/validate";
import type { ArticleStatus } from "@/generated/prisma";

export type ArticleMutationResult = {
  success: boolean;
  error?: string;
  slug?: string;
};

/** Text of an article in another language; an empty title means "no translation". */
type TranslationInput = { title?: string; description?: string | null; content?: string | null };

function translationData(input: TranslationInput) {
  return {
    title: input.title?.trim() ?? "",
    description: input.description?.trim() || null,
    content: input.content?.trim() || null,
  };
}

async function requireStaff() {
  const current = await getCurrentUser();
  if (!current || (current.role !== "ADMIN" && current.role !== "EDITOR")) {
    throw new Error("Unauthorized: Staff editorial access required.");
  }
  return current;
}

export async function createArticle(data: {
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
  coverPattern?: string;
  coverTones?: string;
  coverIcon?: string;
  imageUrl?: string;
  imageAlt?: string;
  hi?: TranslationInput;
  /** SEO overrides per language ({ en, hi }); empty fields mean automatic. */
  seo?: unknown;
}): Promise<ArticleMutationResult> {
  try {
    const staff = await requireStaff();

    const seo = cleanLocalizedSeo(data.seo);
    if (!seo.ok) return { success: false, error: seo.error };

    const title = data.title.trim();
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

    if (!title || !slug || !data.topicSlug) {
      return { success: false, error: "Title, slug, and topic are required." };
    }

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
        status: data.status || "PUBLISHED",
        coverPattern: data.coverPattern || "orbit",
        coverTones: data.coverTones || JSON.stringify(["primary", "accent-secondary"]),
        coverIcon: data.coverIcon || "sparkles",
        imageUrl: data.imageUrl?.trim() || null,
        imageAlt: data.imageAlt?.trim() || null,
        publishedAt: new Date(),
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

export async function updateArticle(
  id: string,
  data: {
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
    coverPattern?: string;
    coverTones?: string;
    coverIcon?: string;
    imageUrl?: string;
    imageAlt?: string;
    hi?: TranslationInput;
    /** SEO overrides per language ({ en, hi }); empty fields mean automatic. */
    seo?: unknown;
  }
): Promise<ArticleMutationResult> {
  try {
    const staff = await requireStaff();

    const seo = cleanLocalizedSeo(data.seo);
    if (!seo.ok) return { success: false, error: seo.error };

    const title = data.title.trim();
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

    if (!title || !slug || !data.topicSlug) {
      return { success: false, error: "Title, slug, and topic are required." };
    }

    const existing = await prisma.article.findUnique({ where: { id } });
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

    const author = data.authorId
      ? await prisma.user.findUnique({ where: { id: data.authorId } })
      : null;

    await prisma.article.update({
      where: { id },
      data: {
        title,
        slug,
        topicSlug: data.topicSlug,
        authorId: author ? author.id : existing.authorId,
        authorName: author ? author.name : existing.authorName,
        description: data.description?.trim() || null,
        content: data.content?.trim() || null,
        readTime: Number(data.readTime) || existing.readTime,
        featured: data.featured !== undefined ? data.featured : existing.featured,
        editorsPick: data.editorsPick !== undefined ? data.editorsPick : existing.editorsPick,
        trending: data.trending !== undefined ? data.trending : existing.trending,
        status: data.status || existing.status,
        coverPattern: data.coverPattern || existing.coverPattern,
        coverTones: data.coverTones || existing.coverTones,
        coverIcon: data.coverIcon || existing.coverIcon,
        imageUrl: data.imageUrl !== undefined ? (data.imageUrl?.trim() || null) : existing.imageUrl,
        imageAlt: data.imageAlt !== undefined ? (data.imageAlt?.trim() || null) : existing.imageAlt,
        // Hindi version: saved with the article, or removed when its title is cleared.
        translations: !data.hi
          ? undefined
          : data.hi.title?.trim()
            ? {
                upsert: {
                  where: { articleId_locale: { articleId: id, locale: "hi" } },
                  update: translationData(data.hi),
                  create: { locale: "hi", ...translationData(data.hi) },
                },
              }
            : { deleteMany: { locale: "hi" } },
        seo: seoUpdate(seo.value, { articleId: id }),
      },
    });

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

