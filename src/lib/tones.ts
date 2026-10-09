import type { CSSProperties } from "react";

/**
 * Decorative accent tones for topics, badges and cover art. Each resolves to a
 * master token (pink is a blend of two), so the palette stays centralized.
 */
export type Tone = "primary" | "accent" | "accent-secondary" | "pink";

export const toneColor: Record<Tone, string> = {
  primary: "var(--color-primary)",
  accent: "var(--color-accent)",
  "accent-secondary": "var(--color-accent-secondary)",
  pink: "color-mix(in srgb, var(--color-accent) 55%, var(--color-accent-secondary))",
};

/**
 * Exposes a tone as the `--tone` custom property, so descendants can use
 * `bg-(color:--tone)`, `text-(color:--tone)`, `bg-(color:--tone)/10`, etc.
 */
export function toneStyle(tone: Tone): CSSProperties {
  return { "--tone": toneColor[tone] } as CSSProperties;
}
