"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { seoCreate, seoUpdate } from "@/lib/seo/nested";
import { cleanLocalizedSeo } from "@/lib/seo/validate";

export type CategoryMutationResult = {
  success: boolean;
  error?: string;
};

async function requireStaff() {
  const current = await getCurrentUser();
  if (!current || (current.role !== "ADMIN" && current.role !== "EDITOR")) {
    throw new Error("Unauthorized: Staff editorial access required.");
  }
}

/** Category name in another language; an empty label means "no translation". */
type TranslationInput = { label?: string; description?: string | null };

function translationData(input: TranslationInput) {
  return { label: input.label?.trim() ?? "", description: input.description?.trim() || null };
}

export async function createCategory(data: {
  label: string;
  slug: string;
  description: string;
  icon: string;
  tone: string;
  hi?: TranslationInput;
  /** SEO overrides per language ({ en, hi }); empty fields mean automatic. */
  seo?: unknown;
}): Promise<CategoryMutationResult> {
  try {
    await requireStaff();

    const seo = cleanLocalizedSeo(data.seo);
    if (!seo.ok) return { success: false, error: seo.error };

    const label = data.label.trim();
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const description = data.description.trim();
    const icon = data.icon.trim() || "sparkles";
    const tone = data.tone.trim() || "primary";

    if (!label || !slug) {
      return { success: false, error: "Category label and slug are required." };
    }

    const existing = await prisma.topic.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: `A category with slug "${slug}" already exists.` };
    }

    await prisma.topic.create({
      data: {
        label,
        slug,
        description: description || `Latest insights in ${label}.`,
        href: `/category/${slug}`,
        icon,
        tone,
        translations: data.hi?.label?.trim()
          ? { create: { locale: "hi", ...translationData(data.hi) } }
          : undefined,
        seo: seoCreate(seo.value),
      },
    });

    revalidatePath("/", "layout"); // Every public page in every language; header menus list categories too.
    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles");
    return { success: true };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create category." };
  }
}

export async function updateCategory(
  id: string,
  data: {
    label: string;
    slug: string;
    description: string;
    icon: string;
    tone: string;
    hi?: TranslationInput;
    /** SEO overrides per language ({ en, hi }); empty fields mean automatic. */
    seo?: unknown;
  }
): Promise<CategoryMutationResult> {
  try {
    await requireStaff();

    const seo = cleanLocalizedSeo(data.seo);
    if (!seo.ok) return { success: false, error: seo.error };

    const label = data.label.trim();
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const description = data.description.trim();
    const icon = data.icon.trim() || "sparkles";
    const tone = data.tone.trim() || "primary";

    if (!label || !slug) {
      return { success: false, error: "Category label and slug are required." };
    }

    const existing = await prisma.topic.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Category not found." };
    }

    if (slug !== existing.slug) {
      const slugTaken = await prisma.topic.findUnique({ where: { slug } });
      if (slugTaken) {
        return { success: false, error: `Slug "${slug}" is already used by another category.` };
      }

      // If slug changed, update linked articles topicSlug as well
      await prisma.article.updateMany({
        where: { topicSlug: existing.slug },
        data: { topicSlug: slug },
      });
    }

    await prisma.topic.update({
      where: { id },
      data: {
        label,
        slug,
        description: description || existing.description,
        href: `/category/${slug}`,
        icon,
        tone,
        // Hindi name: saved with the category, or removed when cleared.
        translations: !data.hi
          ? undefined
          : data.hi.label?.trim()
            ? {
                upsert: {
                  where: { topicId_locale: { topicId: id, locale: "hi" } },
                  update: translationData(data.hi),
                  create: { locale: "hi", ...translationData(data.hi) },
                },
              }
            : { deleteMany: { locale: "hi" } },
        seo: seoUpdate(seo.value, { topicId: id }),
      },
    });

    revalidatePath("/", "layout"); // Every public page in every language; header menus list categories too.
    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles");
    return { success: true };
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update category." };
  }
}

export async function deleteCategory(id: string): Promise<CategoryMutationResult> {
  try {
    await requireStaff();

    const category = await prisma.topic.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found." };
    }

    if (category._count.articles > 0) {
      return {
        success: false,
        error: `Cannot delete "${category.label}": it has ${category._count.articles} linked article(s). Please reassign or delete those articles first.`,
      };
    }

    await prisma.topic.delete({
      where: { id },
    });

    revalidatePath("/", "layout"); // Every public page in every language; header menus list categories too.
    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles");
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete category." };
  }
}
