"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { uploadCoverImage } from "@/actions/upload";
import { Icon } from "@/components/ui/Icon";

type CoverImageUploaderProps = {
  imageUrl: string;
  imageAlt: string;
  onImageChange: (url: string) => void;
  onAltChange: (alt: string) => void;
};

export function CoverImageUploader({
  imageUrl,
  imageAlt,
  onImageChange,
  onAltChange,
}: CoverImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(Boolean(imageUrl && !imageUrl.includes("cloudinary.com")));
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WebP, etc.).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadCoverImage(formData);
      if (result.success && result.url) {
        onImageChange(result.url);
      } else {
        setError(result.error || "Failed to upload image to Cloudinary.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function copyUrl() {
    if (!imageUrl) return;
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
          Article Cover Image
        </h2>
        {imageUrl && (
          <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
            <span className="size-1.5 rounded-full bg-success" />
            Image Ready
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-error/30 bg-error/10 p-3 text-xs text-error">
          <p className="font-semibold">{error}</p>
          {error.includes("CLOUDINARY_API_SECRET") && (
            <p className="mt-1 text-[11px] opacity-90">
              Tip: Add your Cloudinary API Secret to <code className="bg-background/80 px-1 py-0.5 rounded font-mono">.env</code> to enable direct file uploads, or paste a direct image URL below.
            </p>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Preview if image is present */}
      {imageUrl ? (
        <div className="space-y-3">
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-xl border border-border bg-background">
            <Image
              src={imageUrl}
              alt={imageAlt || "Cover preview"}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 380px, 100vw"
            />
            {uploading && (
              <div className="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-xs">
                <div className="flex flex-col items-center gap-2 text-primary font-semibold text-xs">
                  <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Uploading new image...
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50"
              >
                <Icon name="refresh" className="size-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={copyUrl}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
                title="Copy Image URL"
              >
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => onImageChange("")}
              className="inline-flex items-center gap-1 rounded-lg border border-error/20 px-2.5 py-1.5 text-xs font-medium text-error hover:bg-error/10 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* Upload Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-background/40"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs font-semibold text-text-primary">Uploading to Cloudinary...</p>
              <p className="text-[11px] text-text-muted">Optimizing format and resolution</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <Icon name="sparkles" className="size-6" />
              </div>
              <p className="text-xs font-semibold text-text-primary mt-1">
                Click to upload cover image, or drag &amp; drop
              </p>
              <p className="text-[11px] text-text-muted">
                Stored in Cloudinary • PNG, JPG, WebP up to 10MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Alternative URL Input Toggle */}
      <div className="border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-text-muted hover:text-primary transition-colors"
        >
          {showUrlInput ? "− Hide Image URL field" : "+ Or enter direct image URL"}
        </button>

        {showUrlInput && (
          <div className="mt-2 space-y-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => onImageChange(e.target.value)}
              placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
              className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Image Alt Text for Accessibility & SEO */}
      <div>
        <label className="block text-[11px] font-medium text-text-muted">
          Image Alt Text (SEO &amp; Accessibility)
        </label>
        <input
          type="text"
          value={imageAlt}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="Brief description of the image for screen readers"
          className="mt-1 h-8 w-full rounded-lg border border-border bg-background px-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  );
}
