"use client";

import { useState } from "react";
import Link from "next/link";
import { updateHeaderCategories } from "@/actions/settings";
import { Icon } from "@/components/ui/Icon";
import { toneStyle, type Tone } from "@/lib/tones";

type TopicItem = {
  id: string;
  slug: string;
  label: string;
  description: string;
  icon: string;
  tone: string;
  _count: { articles: number };
};

type SiteSettingsManagerProps = {
  topics: TopicItem[];
  initialSelectedSlugs: string[];
};

const MAX_CATEGORIES = 5;

export function SiteSettingsManager({
  topics,
  initialSelectedSlugs,
}: SiteSettingsManagerProps) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(
    initialSelectedSlugs.slice(0, MAX_CATEGORIES)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const topicMap = new Map(topics.map((t) => [t.slug, t]));
  const activeTopics = selectedSlugs
    .map((slug) => topicMap.get(slug))
    .filter((t): t is TopicItem => Boolean(t));

  const availableTopics = topics.filter(
    (t) => !selectedSlugs.includes(t.slug)
  );

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const next = [...selectedSlugs];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setSelectedSlugs(next);
    setSuccess(false);
  }

  function handleMoveDown(index: number) {
    if (index === selectedSlugs.length - 1) return;
    const next = [...selectedSlugs];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setSelectedSlugs(next);
    setSuccess(false);
  }

  function handleRemove(slug: string) {
    if (selectedSlugs.length <= 1) {
      setError("At least 1 category must remain in the header navigation.");
      return;
    }
    setError(null);
    setSelectedSlugs((prev) => prev.filter((s) => s !== slug));
    setSuccess(false);
  }

  function handleAdd(slug: string) {
    if (selectedSlugs.length >= MAX_CATEGORIES) {
      setError(`Maximum ${MAX_CATEGORIES} categories can be shown in the header.`);
      return;
    }
    setError(null);
    setSelectedSlugs((prev) => [...prev, slug]);
    setSuccess(false);
  }

  async function handleSave() {
    if (selectedSlugs.length === 0) {
      setError("Please select at least 1 category.");
      return;
    }
    if (selectedSlugs.length > MAX_CATEGORIES) {
      setError(`You can select at most ${MAX_CATEGORIES} categories for the header.`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await updateHeaderCategories(selectedSlugs);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to update settings.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Site Configuration
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Configure global website settings, header navigation, and category visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs font-semibold text-text-primary shadow-xs transition-colors hover:border-primary/40 hover:text-primary"
          >
            👁️ View Public Header ↗
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-semibold text-surface-elevated shadow-xs transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-xs font-medium text-error">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-xs font-medium text-success">
          <span className="flex items-center gap-2">
            ✓ Header categories updated live! The public website header now reflects your changes.
          </span>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline hover:opacity-80"
          >
            Check Home Page ↗
          </Link>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (2 Cols): Active Header Categories */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary">
                  Header Navigation Categories
                </h2>
                <p className="mt-0.5 text-xs text-text-muted">
                  Choose up to <strong>{MAX_CATEGORIES} categories</strong> to display in the main website header. Reorder from left to right.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                    selectedSlugs.length === MAX_CATEGORIES
                      ? "bg-accent/15 text-accent"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {selectedSlugs.length} / {MAX_CATEGORIES} Selected
                </span>
              </div>
            </div>

            {/* List of Selected Categories */}
            <div className="mt-6 space-y-3">
              {activeTopics.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-text-muted">
                  No categories selected. Click &quot;Add to Header&quot; below to add categories.
                </div>
              ) : (
                activeTopics.map((topic, index) => (
                  <div
                    key={topic.slug}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-3.5 transition-colors hover:border-primary/40 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Position Badge */}
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-xs font-mono font-bold text-text-muted ring-1 ring-border">
                        #{index + 1}
                      </span>

                      {/* Icon & Label */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          style={toneStyle(topic.tone as Tone)}
                          className="grid size-8 shrink-0 place-items-center rounded-lg bg-(color:--tone)/10 text-(color:--tone)"
                        >
                          <Icon name={topic.icon as any} className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-text-primary truncate">
                            {topic.label}
                          </p>
                          <p className="text-[11px] font-mono text-text-muted truncate">
                            /category/{topic.slug} • {topic._count.articles} stories
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Reorder & Remove */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Move left/earlier in navbar"
                        className="grid size-8 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === activeTopics.length - 1}
                        title="Move right/later in navbar"
                        className="grid size-8 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(topic.slug)}
                        title="Remove from header"
                        className="grid size-8 place-items-center rounded-lg border border-border bg-surface-elevated text-xs text-error transition-colors hover:bg-error/10 hover:border-error/40"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Available Categories to Add */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Available Categories
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">
                Add other published categories to the header bar.
              </p>
            </div>

            {selectedSlugs.length >= MAX_CATEGORIES ? (
              <div className="rounded-xl border border-accent/20 bg-accent/10 p-3.5 text-xs font-medium text-accent">
                Maximum limit reached ({MAX_CATEGORIES} of {MAX_CATEGORIES}). Remove a category on the left to add a different one.
              </div>
            ) : availableTopics.length === 0 ? (
              <p className="text-xs text-text-muted">
                All available categories are already in the header navigation.
              </p>
            ) : null}

            <div className="space-y-2.5">
              {availableTopics.map((topic) => (
                <div
                  key={topic.slug}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      style={toneStyle(topic.tone as Tone)}
                      className="grid size-7 shrink-0 place-items-center rounded-lg bg-(color:--tone)/10 text-(color:--tone)"
                    >
                      <Icon name={topic.icon as any} className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">
                        {topic.label}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {topic._count.articles} articles
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdd(topic.slug)}
                    disabled={selectedSlugs.length >= MAX_CATEGORIES}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface-elevated px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <Link
                href="/admin/categories"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Manage all categories &amp; add new topics →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
