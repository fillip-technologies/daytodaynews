"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createArticle, updateArticle } from "@/actions/articles";
import { uploadArticleImage } from "@/actions/upload";
import { ArticleContent } from "@/components/article/ArticleContent";
import { SeoFields } from "@/components/admin/SeoFields";
import type { Locale } from "@/i18n/config";
import { emptySeoFields, type SeoFieldsValue } from "@/lib/seo/validate";
import { CoverImageUploader } from "./CoverImageUploader";
import type { ArticleStatus } from "@/generated/prisma";

type ArticleData = {
  id?: string;
  title: string;
  slug: string;
  topicSlug: string;
  authorId?: string | null;
  description?: string | null;
  content?: string | null;
  readTime?: number;
  featured?: boolean;
  editorsPick?: boolean;
  trending?: boolean;
  status?: ArticleStatus;
  coverPattern?: string | null;
  coverTones?: string | null;
  coverIcon?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  /** Hindi version; empty title means the article has none. */
  hi?: { title: string; description?: string | null; content?: string | null } | null;
  /** SEO overrides per language. */
  seo?: Record<Locale, SeoFieldsValue>;
};

type EditorLanguage = "en" | "hi";

type Option = {
  value: string;
  label: string;
};

type ArticleFormProps = {
  initialData?: ArticleData;
  topics: Option[];
  authors: Option[];
  /** Site URL and title formats, for the SEO previews. */
  seoContext: { siteUrl: string; titleTemplate: Record<Locale, string> };
};

export function ArticleForm({ initialData, topics, authors, seoContext }: ArticleFormProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(initialData?.slug)
  );
  const [topicSlug, setTopicSlug] = useState(initialData?.topicSlug || topics[0]?.value || "");
  const [authorId, setAuthorId] = useState(initialData?.authorId || authors[0]?.value || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [readTime, setReadTime] = useState(initialData?.readTime || 5);
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [editorsPick, setEditorsPick] = useState(initialData?.editorsPick || false);
  const [trending, setTrending] = useState(initialData?.trending || false);
  const [status, setStatus] = useState<ArticleStatus>(initialData?.status || "PUBLISHED");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  // Hindi version. Title, summary and content fields edit whichever language is active.
  const [language, setLanguage] = useState<EditorLanguage>("en");
  const [hiTitle, setHiTitle] = useState(initialData?.hi?.title || "");
  const [hiDescription, setHiDescription] = useState(initialData?.hi?.description || "");
  const [hiContent, setHiContent] = useState(initialData?.hi?.content || "");
  const editorContent = language === "en" ? content : hiContent;
  const setEditorContent = language === "en" ? setContent : setHiContent;

  // SEO overrides per language; the SEO card follows the same language switch.
  const [seo, setSeo] = useState<Record<Locale, SeoFieldsValue>>(
    initialData?.seo ?? { en: emptySeoFields, hi: emptySeoFields },
  );

  // Cover styling states
  const [coverPattern, setCoverPattern] = useState(initialData?.coverPattern || "orbit");
  const [coverTones, setCoverTones] = useState(
    initialData?.coverTones || JSON.stringify(["accent-secondary", "pink"])
  );
  const [coverIcon, setCoverIcon] = useState(initialData?.coverIcon || "sparkles");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [imageAlt, setImageAlt] = useState(initialData?.imageAlt || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  function toSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    if (!slugManuallyEdited && !isEditing) {
      setSlug(toSlug(newTitle));
    }
  }

  function generateSlug() {
    if (!title) return;
    const generated = toSlug(title);
    setSlug(generated);
    setSlugManuallyEdited(false);
  }

  function insertFormatting(prefix: string, suffix: string = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editorContent.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;

    const newContent = editorContent.substring(0, start) + replacement + editorContent.substring(end);
    setEditorContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 0);
  }

  const [uploadingInline, setUploadingInline] = useState(false);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  async function handleInlineUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WebP, etc.).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size exceeds 10MB limit.");
      return;
    }

    // Uploads finish later; keep writing to the language that started them.
    const setTarget = setEditorContent;
    const textarea = textareaRef.current;
    const start = textarea ? textarea.selectionStart : editorContent.length;
    const end = textarea ? textarea.selectionEnd : editorContent.length;

    const cleanName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    const placeholder = `\n\n![Uploading ${cleanName}...]()\n\n`;

    const contentWithPlaceholder =
      editorContent.substring(0, start) + placeholder + editorContent.substring(end);
    setTarget(contentWithPlaceholder);

    setUploadingInline(true);
    setError(null);
    setUploadNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadArticleImage(formData);
      if (res.success && res.url) {
        const finalMarkdown = `\n\n![${cleanName}](${res.url})\n\n`;
        setTarget((prev) => prev.replace(placeholder, finalMarkdown));
        setUploadNotice(`Image "${cleanName}" uploaded to Cloudinary! Click "Save Changes" to publish it live.`);
      } else {
        setError(res.error || "Failed to upload image to Cloudinary.");
        setTarget((prev) => prev.replace(placeholder, ""));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
      setTarget((prev) => prev.replace(placeholder, ""));
    } finally {
      setUploadingInline(false);
    }
  }

  function handleEditorPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleInlineUpload(file);
          return;
        }
      }
    }
  }

  function handleEditorDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    const files = e.dataTransfer?.files;
    if (files && files[0] && files[0].type.startsWith("image/")) {
      e.preventDefault();
      handleInlineUpload(files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      title,
      slug,
      topicSlug,
      authorId,
      description,
      content,
      readTime: Number(readTime),
      featured,
      editorsPick,
      trending,
      status,
      coverPattern,
      coverTones,
      coverIcon,
      imageUrl: imageUrl || undefined,
      imageAlt: imageAlt || undefined,
      hi: { title: hiTitle, description: hiDescription, content: hiContent },
      seo,
    };

    try {
      if (isEditing && initialData?.id) {
        const res = await updateArticle(initialData.id, payload);
        if (!res.success) {
          setError(res.error || "Failed to update article");
          setLoading(false);
          return;
        }
        setSaveSuccess(true);
        setUploadNotice(null);
        setLoading(false);
        router.refresh();
      } else {
        const res = await createArticle(payload);
        if (!res.success) {
          setError(res.error || "Failed to create article");
          setLoading(false);
          return;
        }
        router.push("/admin/articles");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred while saving.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Action Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/articles"
              className="text-xs font-semibold text-text-muted hover:text-primary"
            >
              ← Back to articles list
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
            {isEditing ? `Edit Story: ${initialData?.title}` : "Create New Story"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {isEditing && slug && (
            <Link
              href={`/${language}/articles/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 text-xs font-semibold text-text-primary shadow-xs transition-colors hover:border-primary/40 hover:text-primary"
            >
              👁️ View Live ↗
            </Link>
          )}
          <Link
            href="/admin/articles"
            className="inline-flex h-10 items-center rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-background"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-semibold text-surface-elevated shadow-xs transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? "Saving..." : isEditing ? "Save Changes" : "Publish Article"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-xs font-medium text-error">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-xs font-medium text-success">
          <span className="flex items-center gap-2">
            ✓ Changes saved successfully! Article is updated live.
          </span>
          {isEditing && slug && (
            <Link
              href={`/${language}/articles/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:opacity-80"
            >
              Open Live Public Story ↗
            </Link>
          )}
        </div>
      )}

      {/* Main Form Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Metadata, Excerpt, Markdown Editor */}
        <div className="space-y-5 lg:col-span-2">
          {/* Language switch: the title, summary and content fields below edit this language. */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-elevated px-6 py-4 shadow-2xs">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-primary">Article Language</p>
              <p className="mt-0.5 text-[11px] text-text-muted">
                {language === "en"
                  ? "English is required and appears at /en."
                  : "Optional. Leave the Hindi title empty and /hi shows the English article with a note."}
              </p>
            </div>
            <div role="tablist" aria-label="Article language" className="flex gap-1 rounded-lg border border-border bg-background p-1">
              {(["en", "hi"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  role="tab"
                  aria-selected={language === code}
                  onClick={() => setLanguage(code)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    language === code
                      ? "bg-surface-elevated text-primary shadow-2xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {code === "en" ? "English" : "हिंदी"}
                  {code === "hi" && hiTitle.trim() ? " ✓" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Slug */}
          <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-primary">
                {language === "en" ? "Article Title" : "Hindi Title"}
              </label>
              {language === "en" ? (
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Next.js 16 Architecture Best Practices"
                  className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-base font-semibold text-text-primary focus:border-primary focus:outline-none"
                />
              ) : (
                <input
                  type="text"
                  lang="hi"
                  value={hiTitle}
                  onChange={(e) => setHiTitle(e.target.value)}
                  placeholder="उदाहरण: Next.js 16 आर्किटेक्चर की बेस्ट प्रैक्टिस"
                  className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-base font-semibold text-text-primary focus:border-primary focus:outline-none"
                />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-primary">
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={generateSlug}
                  className="text-[11px] font-semibold text-primary hover:text-primary-hover"
                >
                  Generate from title
                </button>
              </div>
              <div className="mt-1.5 flex rounded-xl border border-border bg-background focus-within:border-primary">
                <span className="flex items-center pl-3.5 text-xs text-text-muted">/articles/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  placeholder="nextjs-16-architecture-best-practices"
                  className="h-10 w-full rounded-xl bg-transparent px-2 text-xs font-mono text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-primary">
                {language === "en" ? "Summary / Excerpt" : "Hindi Summary"}
              </label>
              <textarea
                rows={2}
                lang={language}
                value={language === "en" ? description : hiDescription}
                onChange={(e) => (language === "en" ? setDescription : setHiDescription)(e.target.value)}
                placeholder={
                  language === "en"
                    ? "A compelling one or two sentence summary of the article..."
                    : "लेख का एक-दो वाक्यों में सारांश..."
                }
                className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs leading-relaxed text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Markdown Content Editor with Formatting Toolbar */}
          <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-text-primary">
                {language === "en" ? "Article Content (Markdown)" : "Hindi Content (Markdown)"}
              </label>
              <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    activeTab === "write"
                      ? "bg-surface-elevated text-primary shadow-2xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    activeTab === "preview"
                      ? "bg-surface-elevated text-primary shadow-2xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Quick Markdown Toolbar */}
            {activeTab === "write" && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background/50 p-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => insertFormatting("**", "**")}
                  className="rounded-lg px-2.5 py-1 font-bold hover:bg-surface-elevated"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("*", "*")}
                  className="rounded-lg px-2.5 py-1 italic hover:bg-surface-elevated"
                  title="Italic"
                >
                  I
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={() => insertFormatting("## ")}
                  className="rounded-lg px-2 py-1 font-semibold hover:bg-surface-elevated"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("### ")}
                  className="rounded-lg px-2 py-1 font-semibold hover:bg-surface-elevated"
                  title="Heading 3"
                >
                  H3
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={() => insertFormatting("> ")}
                  className="rounded-lg px-2.5 py-1 hover:bg-surface-elevated"
                  title="Quote"
                >
                  &ldquo; Quote
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("- ")}
                  className="rounded-lg px-2.5 py-1 hover:bg-surface-elevated"
                  title="Bullet list"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("1. ")}
                  className="rounded-lg px-2.5 py-1 hover:bg-surface-elevated"
                  title="Numbered list"
                >
                  1. Numbered
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("```typescript\n", "\n```")}
                  className="rounded-lg px-2 py-1 font-mono hover:bg-surface-elevated"
                  title="Code block"
                >
                  &lt;/&gt; Code
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("[link text](", ")")}
                  className="rounded-lg px-2 py-1 hover:bg-surface-elevated"
                  title="Hyperlink"
                >
                  🔗 Link
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={() => inlineFileInputRef.current?.click()}
                  disabled={uploadingInline}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                  title="Upload image to Cloudinary and insert into article"
                >
                  {uploadingInline ? "⏳ Uploading..." : "🖼️ Image"}
                </button>
                <input
                  ref={inlineFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleInlineUpload(e.target.files[0]);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            )}

            <div className="mt-3">
              {activeTab === "write" ? (
                <>
                  <textarea
                    ref={textareaRef}
                    rows={20}
                    lang={language}
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    onPaste={handleEditorPaste}
                    onDrop={handleEditorDrop}
                    placeholder="Write your story using markdown (## Headings, **bold**, lists, > blockquotes, ![images]...)..."
                    className="w-full rounded-xl border border-border bg-background p-4 font-mono text-xs leading-relaxed text-text-primary focus:border-primary focus:outline-none"
                  />
                  <p className="mt-2 text-[11px] text-text-muted">
                    💡 <strong>Image Support</strong>: Click <strong>🖼️ Image</strong>, drag &amp; drop photos, or paste screenshots (<kbd className="rounded border border-border bg-background px-1 font-mono text-[10px]">Ctrl+V</kbd>) directly into the editor to upload to Cloudinary.
                  </p>
                  {uploadNotice && (
                    <div className="mt-2.5 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-2.5 text-xs font-medium text-primary">
                      <span>💡 {uploadNotice}</span>
                      <button
                        type="button"
                        onClick={() => setUploadNotice(null)}
                        className="ml-2 font-bold hover:opacity-80"
                        title="Dismiss notice"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="min-h-96 rounded-xl border border-border bg-background p-6">
                  {editorContent ? (
                    <ArticleContent content={editorContent} />
                  ) : (
                    <p className="text-xs text-text-muted">Type markdown content to see live preview.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SEO for the active language (switch at the top of the form) */}
          <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                SEO · {language === "en" ? "English" : "हिंदी"}
              </h2>
              <span className="text-[11px] text-text-muted">Empty fields use the article&apos;s own title, summary and cover.</span>
            </div>
            <SeoFields
              key={language}
              value={seo[language]}
              onChange={(next) => setSeo((all) => ({ ...all, [language]: next }))}
              auto={{
                title: language === "en" ? title : hiTitle || title,
                description: language === "en" ? description : hiDescription || description,
                image: imageUrl || undefined,
              }}
              titleTemplate={seoContext.titleTemplate[language]}
              url={`${seoContext.siteUrl}/${language}/articles/${slug || "your-article"}`}
              lang={language}
            />
          </div>
        </div>

        {/* Right Column: Publication settings & Cover Customizer */}
        <div className="space-y-5">
          {/* Publishing Settings */}
          <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Publishing Settings
            </h2>

            <div>
              <label className="block text-xs font-medium text-text-primary">Category / Topic</label>
              <select
                value={topicSlug}
                onChange={(e) => setTopicSlug(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                {topics.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-primary">Author</label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                {authors.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-primary">Read Time (minutes)</label>
              <input
                type="number"
                min={1}
                max={120}
                value={readTime}
                onChange={(e) => setReadTime(parseInt(e.target.value, 10) || 1)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-primary">Publication Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Editorial Promotion Flags */}
          <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs space-y-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Editorial Promotion
            </h2>

            <label className="flex items-center gap-3 text-xs font-medium text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="size-4 rounded accent-primary"
              />
              Featured Story (Hero highlight)
            </label>

            <label className="flex items-center gap-3 text-xs font-medium text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={editorsPick}
                onChange={(e) => setEditorsPick(e.target.checked)}
                className="size-4 rounded accent-primary"
              />
              Editor&apos;s Pick (Curated showcase)
            </label>

            <label className="flex items-center gap-3 text-xs font-medium text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={trending}
                onChange={(e) => setTrending(e.target.checked)}
                className="size-4 rounded accent-primary"
              />
              Trending Now (Sidebar list)
            </label>
          </div>

          {/* Cloudinary Cover Image Uploader */}
          <CoverImageUploader
            imageUrl={imageUrl}
            imageAlt={imageAlt}
            onImageChange={setImageUrl}
            onAltChange={setImageAlt}
          />
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface-elevated/95 p-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          {saveSuccess ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              Changes saved live!
            </span>
          ) : error ? (
            <span className="text-xs font-medium text-error">⚠️ {error}</span>
          ) : uploadNotice ? (
            <span className="text-xs font-medium text-primary line-clamp-1">
              💡 {uploadNotice}
            </span>
          ) : (
            <span className="text-xs text-text-muted">
              {isEditing
                ? "Editing article — click Save Changes to publish."
                : "Drafting new article."}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isEditing && slug && (
            <Link
              href={`/${language}/articles/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs font-semibold text-text-primary shadow-xs transition-colors hover:border-primary/40 hover:text-primary"
            >
              👁️ View Live Article ↗
            </Link>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-6 text-xs font-semibold text-surface-elevated shadow-xs transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? "Saving..." : isEditing ? "Save Changes" : "Publish Article"}
          </button>
        </div>
      </div>
    </form>
  );
}
