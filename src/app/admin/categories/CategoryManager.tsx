"use client";

import { useState } from "react";
import Link from "next/link";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconPicker } from "./IconPicker";
import { formatDate } from "@/lib/format";
import { useAdminDataTable } from "@/hooks/useAdminDataTable";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import type { Tone } from "@/lib/tones";
import { SeoFields } from "@/components/admin/SeoFields";
import type { Locale } from "@/i18n/config";
import { emptySeoFields, toSeoFields, type CleanSeo, type SeoFieldsValue } from "@/lib/seo/validate";

type CategoryItem = {
  id: string;
  slug: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  tone: string;
  createdAt: Date;
  _count: {
    articles: number;
  };
  /** Hindi name/description, if set. */
  translations: { label: string; description: string | null }[];
  /** SEO overrides, one row per language. */
  seo: Array<Partial<CleanSeo> & { locale: string }>;
};

type CategoryManagerProps = {
  initialCategories: CategoryItem[];
  /** Site URL and title formats, for the SEO previews. */
  seoContext: { siteUrl: string; titleTemplate: Record<Locale, string> };
};

const AVAILABLE_TONES: { value: Tone; label: string; bgClass: string; textClass: string; borderClass: string }[] = [
  {
    value: "primary",
    label: "Primary (Navy / Blue)",
    bgClass: "bg-primary/10",
    textClass: "text-primary",
    borderClass: "border-primary/30",
  },
  {
    value: "accent-secondary",
    label: "Cyan / Teal",
    bgClass: "bg-accent-secondary/10",
    textClass: "text-accent-secondary",
    borderClass: "border-accent-secondary/30",
  },
  {
    value: "accent",
    label: "Amber / Coral",
    bgClass: "bg-accent/10",
    textClass: "text-accent",
    borderClass: "border-accent/30",
  },
  {
    value: "pink",
    label: "Magenta / Pink",
    bgClass: "bg-pink/10",
    textClass: "text-pink",
    borderClass: "border-pink/30",
  },
];

export function CategoryManager({ initialCategories, seoContext }: CategoryManagerProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<string>("sparkles");
  const [tone, setTone] = useState<Tone>("primary");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [hiLabel, setHiLabel] = useState("");
  const [hiDescription, setHiDescription] = useState("");
  const [seo, setSeo] = useState<Record<Locale, SeoFieldsValue>>({ en: emptySeoFields, hi: emptySeoFields });
  const [seoLang, setSeoLang] = useState<Locale>("en");
  const [showSeo, setShowSeo] = useState(false);

  function openCreateModal() {
    setSelectedCategory(null);
    setLabel("");
    setSlug("");
    setDescription("");
    setIcon("sparkles");
    setTone("primary");
    setHiLabel("");
    setHiDescription("");
    setSeo({ en: emptySeoFields, hi: emptySeoFields });
    setSeoLang("en");
    setShowSeo(false);
    setSlugManuallyEdited(false);
    setMessage(null);
    setModalMode("create");
  }

  function openEditModal(cat: CategoryItem) {
    setSelectedCategory(cat);
    setLabel(cat.label);
    setSlug(cat.slug);
    setDescription(cat.description);
    setIcon(cat.icon || "sparkles");
    setTone((cat.tone as Tone) || "primary");
    setHiLabel(cat.translations[0]?.label ?? "");
    setHiDescription(cat.translations[0]?.description ?? "");
    setSeo({
      en: toSeoFields(cat.seo.find((s) => s.locale === "en")),
      hi: toSeoFields(cat.seo.find((s) => s.locale === "hi")),
    });
    setSeoLang("en");
    setShowSeo(cat.seo.length > 0);
    setSlugManuallyEdited(true);
    setMessage(null);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedCategory(null);
  }

  function handleLabelChange(value: string) {
    setLabel(value);
    if (!slugManuallyEdited && modalMode === "create") {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

    if (modalMode === "create") {
      const res = await createCategory({
        label,
        slug: cleanSlug,
        description,
        icon,
        tone,
        hi: { label: hiLabel, description: hiDescription },
        seo,
      });

      if (res.success) {
        setMessage({ type: "success", text: `Category "${label}" created successfully!` });
        closeModal();
        window.location.reload();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to create category." });
      }
    } else if (modalMode === "edit" && selectedCategory) {
      const res = await updateCategory(selectedCategory.id, {
        label,
        slug: cleanSlug,
        description,
        icon,
        tone,
        hi: { label: hiLabel, description: hiDescription },
        seo,
      });

      if (res.success) {
        setMessage({ type: "success", text: `Category "${label}" updated successfully!` });
        closeModal();
        window.location.reload();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update category." });
      }
    }
    setLoading(false);
  }

  async function handleDelete(cat: CategoryItem) {
    if (cat._count.articles > 0) {
      alert(
        `Cannot delete "${cat.label}":\nThere are currently ${cat._count.articles} article(s) assigned to this category. Please reassign or delete these articles first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${cat.label}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    const res = await deleteCategory(cat.id);
    if (res.success) {
      setCategories((prev) => prev.filter((item) => item.id !== cat.id));
      setMessage({ type: "success", text: `Category "${cat.label}" deleted successfully.` });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to delete category." });
    }
    setLoading(false);
  }

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
    rangeText,
    sortKey,
    sortOrder,
    toggleSort,
  } = useAdminDataTable<CategoryItem>({
    data: categories,
    initialPageSize: 10,
    searchQuery: search,
    searchFields: ["label", "slug", "description", "tone"],
    defaultSortKey: "label",
    defaultSortOrder: "asc",
    sortResolvers: {
      articles: (c) => c._count.articles,
    },
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Categories &amp; Topics</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage publication taxonomy, URL slugs, decorative tones, and icons across the website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-surface-elevated shadow-xs transition-colors hover:bg-primary-hover"
        >
          <Icon name="sparkles" className="size-3.5" />
          Add New Category
        </button>
      </div>

      {message && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            message.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-error/30 bg-error/10 text-error"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search and Metric Overview */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Search categories by name, slug or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface-elevated px-3.5 text-xs text-text-primary shadow-2xs transition-colors hover:border-text-muted/40 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="font-semibold text-text-primary">{categories.length}</span> Total Categories
          <span>•</span>
          <span className="font-semibold text-text-primary">
            {categories.reduce((acc, c) => acc + c._count.articles, 0)}
          </span>{" "}
          Total Articles
        </div>
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-background/50 font-semibold uppercase tracking-wider text-text-muted text-[11px]">
              <tr>
                <th
                  onClick={() => toggleSort("label")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category &amp; Tone</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "label" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("slug")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Slug &amp; Public URL</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "slug" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("description")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Description</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "description" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("articles")}
                  className="px-6 py-3.5 text-center cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Articles</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "articles" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Created</span>
                    <span className="text-[10px] text-text-muted">
                      {sortKey === "createdAt" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    No categories found matching your query.
                  </td>
                </tr>
              ) : (
                paginatedData.map((c) => {
                  const tonePreset = AVAILABLE_TONES.find((t) => t.value === c.tone) || AVAILABLE_TONES[0];
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-background/40">
                      {/* Name & Icon */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid size-9 place-items-center rounded-xl border ${tonePreset.borderClass} ${tonePreset.bgClass} ${tonePreset.textClass} shadow-2xs`}
                          >
                            <Icon name={(c.icon as IconName) || "sparkles"} className="size-4.5" />
                          </div>
                          <div>
                            <p className="font-bold text-text-primary">{c.label}</p>
                            <span
                              className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${tonePreset.bgClass} ${tonePreset.textClass}`}
                            >
                              {c.tone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Slug & Link */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="rounded-md bg-background px-2 py-1 font-mono text-[11px] text-text-secondary border border-border">
                            {c.slug}
                          </code>
                          <Link
                            href={`/en/category/${c.slug}`}
                            target="_blank"
                            title="View public category page"
                            className="rounded-lg p-1 text-text-muted transition-colors hover:bg-background hover:text-text-primary"
                          >
                            <Icon name="arrowRight" className="size-3.5" />
                          </Link>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="max-w-xs px-6 py-4">
                        <p className="line-clamp-2 text-text-muted leading-relaxed">{c.description}</p>
                      </td>

                      {/* Article Count */}
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/admin/articles`}
                          title="View articles in this topic"
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-text-primary transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          <span>{c._count.articles}</span>
                          <span className="text-[10px] text-text-muted">articles</span>
                        </Link>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-text-muted whitespace-nowrap">
                        {formatDate(new Date(c.createdAt).toISOString())}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(c)}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-text-primary transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                              c._count.articles > 0
                                ? "border-border text-text-muted opacity-50 cursor-not-allowed"
                                : "border-error/30 text-error hover:bg-error/10"
                            }`}
                            title={
                              c._count.articles > 0
                                ? `Cannot delete: ${c._count.articles} linked article(s)`
                                : "Delete category"
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          rangeText={rangeText}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Modal Dialog for Add & Edit */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-surface-elevated p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary">
                  {modalMode === "create" ? "Add New Category" : `Edit Category: ${selectedCategory?.label}`}
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Configure display label, URL slug, decorative tone, and navigation icon.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="grid size-7 place-items-center rounded-lg text-text-muted hover:bg-background hover:text-text-primary"
              >
                <Icon name="close" className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              {/* Category Label */}
              <div>
                <label className="block font-semibold text-text-primary">Category Label / Name</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Cloud & DevOps"
                  className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="block font-semibold text-text-primary">
                  URL Slug <span className="font-normal text-text-muted">(/category/[slug])</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  placeholder="e.g. ai-automation, cloud-devops"
                  className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 font-mono text-text-primary focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-text-muted">
                  Used in URLs and referenced by published articles. Use lowercase letters, numbers, and hyphens.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-text-primary">Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary for category headers, meta tags, and navigational chips..."
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              {/* Hindi name and description, shown on /hi pages */}
              <div className="space-y-3 rounded-xl border border-border bg-background/60 p-3">
                <div>
                  <label className="block font-semibold text-text-primary">Hindi Name (हिंदी नाम)</label>
                  <input
                    type="text"
                    lang="hi"
                    value={hiLabel}
                    onChange={(e) => setHiLabel(e.target.value)}
                    placeholder="e.g. AI और ऑटोमेशन"
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-primary">Hindi Description</label>
                  <textarea
                    rows={2}
                    lang="hi"
                    value={hiDescription}
                    onChange={(e) => setHiDescription(e.target.value)}
                    placeholder="e.g. टूल्स, वर्कफ़्लो और उपयोग के उदाहरण"
                    className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-text-muted">Optional. Leave the Hindi name empty and /hi pages use the English name.</p>
              </div>

              {/* SEO for the category page, per language */}
              <div className="rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setShowSeo((v) => !v)}
                  aria-expanded={showSeo}
                  className="flex w-full items-center justify-between px-3 py-2.5 font-semibold text-text-primary"
                >
                  SEO (Google & social sharing)
                  <Icon name="chevronDown" className={`size-4 transition-transform ${showSeo ? "rotate-180" : ""}`} />
                </button>
                {showSeo && (
                  <div className="space-y-3 border-t border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-text-muted">Empty fields use the category name and description.</span>
                      <div role="tablist" aria-label="SEO language" className="flex gap-1 rounded-lg border border-border bg-background p-1">
                        {(["en", "hi"] as const).map((code) => (
                          <button
                            key={code}
                            type="button"
                            role="tab"
                            aria-selected={seoLang === code}
                            onClick={() => setSeoLang(code)}
                            className={`rounded-md px-3 py-1 text-xs font-semibold ${
                              seoLang === code ? "bg-surface-elevated text-primary shadow-2xs" : "text-text-muted hover:text-text-primary"
                            }`}
                          >
                            {code === "en" ? "English" : "हिंदी"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <SeoFields
                      key={seoLang}
                      value={seo[seoLang]}
                      onChange={(next) => setSeo((all) => ({ ...all, [seoLang]: next }))}
                      auto={{
                        title: seoLang === "en" ? `${label} Insights` : hiLabel || label,
                        description: seoLang === "en" ? description : hiDescription || description,
                      }}
                      titleTemplate={seoContext.titleTemplate[seoLang]}
                      url={`${seoContext.siteUrl}/${seoLang}/category/${slug || "your-category"}`}
                      lang={seoLang}
                    />
                  </div>
                )}
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block font-semibold text-text-primary mb-2">Accent Tone / Color</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {AVAILABLE_TONES.map((t) => {
                    const isSelected = tone === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTone(t.value)}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition-all ${
                          isSelected
                            ? `${t.borderClass} ${t.bgClass} shadow-xs ring-1 ring-primary/40`
                            : "border-border bg-background hover:border-text-muted/30"
                        }`}
                      >
                        <span className={`size-3 rounded-full ${t.bgClass} ${t.borderClass} border`} />
                        <span className={`text-[11px] font-semibold ${isSelected ? t.textClass : "text-text-secondary"}`}>
                          {t.value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Searchable 3rd-Party Icon Selection */}
              <IconPicker value={icon} onChange={setIcon} />

              {/* Live Preview Card */}
              <div className="rounded-xl border border-border bg-background/50 p-3.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-2">
                  Live Preview
                </span>
                <div className="flex items-center gap-3">
                  <div
                    className={`grid size-10 place-items-center rounded-xl border ${
                      AVAILABLE_TONES.find((t) => t.value === tone)?.borderClass || "border-border"
                    } ${
                      AVAILABLE_TONES.find((t) => t.value === tone)?.bgClass || "bg-background"
                    } ${
                      AVAILABLE_TONES.find((t) => t.value === tone)?.textClass || "text-text-primary"
                    }`}
                  >
                    <Icon name={icon} className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-text-primary truncate">{label || "Category Name"}</p>
                    <p className="text-[11px] text-text-muted truncate">
                      {description || "Category description will appear here."}
                    </p>
                  </div>
                  <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] font-mono text-text-secondary border border-border">
                    /category/{slug || "slug"}
                  </span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-9 rounded-xl border border-border px-4 font-semibold text-text-secondary hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 rounded-xl bg-primary px-5 font-semibold text-surface-elevated transition-colors hover:bg-primary-hover disabled:opacity-60"
                >
                  {loading ? "Saving..." : modalMode === "create" ? "Create Category" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
