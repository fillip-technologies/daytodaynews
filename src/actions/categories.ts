"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { seoCreate, seoUpdate } from "@/lib/seo/nested";
import { cleanLocalizedSeo, cleanSeoUrl } from "@/lib/seo/validate";
import { recordMove } from "@/lib/redirects";
import { cleanLine, cleanText } from "@/lib/validation";

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

type Bilingual = { en?: string; hi?: string };

/** Category page introduction, pillar guide and call to action, as the editor sends them. */
type ExtrasInput = {
  intro?: Bilingual;
  pillarSlug?: string;
  ctaTitle?: Bilingual;
  ctaText?: Bilingual;
  ctaLabel?: Bilingual;
  ctaHref?: string;
};

type CleanExtras = {
  en: {
    intro: string | null;
    pillarSlug: string | null;
    ctaTitle: string | null;
    ctaText: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
  };
  hi: { intro: string | null; ctaTitle: string | null; ctaText: string | null; ctaLabel: string | null };
};

async function cleanExtras(input: ExtrasInput | undefined): Promise<{ ok: true; value: CleanExtras } | { ok: false; error: string }> {
  const x = input ?? {};
  const pillarSlug = cleanLine(x.pillarSlug, 191).toLowerCase() || null;
  if (pillarSlug && !(await prisma.article.findUnique({ where: { slug: pillarSlug }, select: { id: true } }))) {
    return { ok: false, error: "The chosen pillar guide no longer exists." };
  }
  const href = cleanSeoUrl(cleanLine(x.ctaHref, 2048));
  if (!href.ok) return { ok: false, error: "Call to action link: " + href.error };
  return {
    ok: true,
    value: {
      en: {
        intro: cleanText(x.intro?.en, 5000) || null,
        pillarSlug,
        ctaTitle: cleanLine(x.ctaTitle?.en, 150) || null,
        ctaText: cleanText(x.ctaText?.en, 500) || null,
        ctaLabel: cleanLine(x.ctaLabel?.en, 80) || null,
        ctaHref: href.value,
      },
      hi: {
        intro: cleanText(x.intro?.hi, 5000) || null,
        ctaTitle: cleanLine(x.ctaTitle?.hi, 150) || null,
        ctaText: cleanText(x.ctaText?.hi, 500) || null,
        ctaLabel: cleanLine(x.ctaLabel?.hi, 80) || null,
      },
    },
  };
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
  extras?: ExtrasInput;
}): Promise<CategoryMutationResult> {
  try {
    await requireStaff();

    const seo = cleanLocalizedSeo(data.seo);
    if (!seo.ok) return { success: false, error: seo.error };
    const extras = await cleanExtras(data.extras);
    if (!extras.ok) return { success: false, error: extras.error };

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
        ...extras.value.en,
        translations: data.hi?.label?.trim()
          ? { create: { locale: "hi", ...translationData(data.hi), ...extras.value.hi } }
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
    extras?: ExtrasInput;
  }
): Promise<CategoryMutationResult> {
  try {
    await requireStaff();

    const seo = cleanLocalizedSeo(data.seo);
    if (!seo.ok) return { success: false, error: seo.error };
    const extrasResult = data.extras ? await cleanExtras(data.extras) : null;
    if (extrasResult && !extrasResult.ok) return { success: false, error: extrasResult.error };
    const extras = extrasResult?.ok ? extrasResult.value : null;

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
      // …and keep the old category address working.
      await recordMove("/category/" + existing.slug, "/category/" + slug, "Category renamed: " + label);
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
        ...(extras ? extras.en : {}),
        // Hindi name: saved with the category, or removed when cleared.
        translations: !data.hi
          ? undefined
          : data.hi.label?.trim()
            ? {
                upsert: {
                  where: { topicId_locale: { topicId: id, locale: "hi" } },
                  update: { ...translationData(data.hi), ...(extras ? extras.hi : {}) },
                  create: { locale: "hi", ...translationData(data.hi), ...(extras ? extras.hi : {}) },
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
