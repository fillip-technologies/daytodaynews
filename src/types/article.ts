import type { ArticleVisualName } from "@/components/home/ArticleVisuals";
import type { IconName } from "@/components/ui/Icon";
import type { Tone } from "@/lib/tones";

/** Palette token a category is drawn in (badge color). */
export type CategoryTone = "primary" | "accent" | "accent-secondary";

export type Article = {
  /** Stable identifier (API/database id). */
  id?: string;
  /** URL slug; the article lives at `href`. */
  slug?: string;
  /** Highlighted at the top of listings. */
  featured?: boolean;
  title: string;
  href: string;
  description?: string;
  /** Display label, e.g. "AI & Automation". */
  category: string;
  categoryHref: string;
  categoryTone: CategoryTone;
  author: string;
  /** ISO date, e.g. "2026-12-12". */
  date: string;
  /** Minutes. */
  readTime?: number;
  /** Photo for the card. */
  image?: { src: string; alt: string };
  /** Built-in illustration, used when there is no photo. */
  visual?: ArticleVisualName;
  /** Topic slug (see data/topics), used for filtering and accent color. */
  topic?: string;
  /** Generated cover art, used by listing cards when there is no photo. */
  cover?: CoverSpec;
};

export type CoverSpec = {
  pattern: CoverPattern;
  /** Gradient from → to. */
  tones: [Tone, Tone];
  icon: IconName;
};

export type CoverPattern = "orbit" | "nodes" | "bars" | "stack" | "code" | "waves" | "people" | "grid";
