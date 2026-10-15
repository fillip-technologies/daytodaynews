import type { ReactNode } from "react";
import type { SocialNetwork } from "@/config/footerNavigation";

// Simplified brand glyphs on a 24px grid, drawn in currentColor.
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const glyphs: Record<SocialNetwork, ReactNode> = {
  facebook: (
    <path d="M13.5 21.5v-8h2.7l.4-3.2h-3.1V8.3c0-.9.3-1.6 1.6-1.6h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4v3.2h2.8v8h3.3Z" />
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" {...stroke} />
      <circle cx="12" cy="12" r="4" {...stroke} />
      <circle cx="17.3" cy="6.7" r="1.2" />
    </>
  ),
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.05c.53-1 1.83-1.8 3.77-1.8 4.03 0 4.78 2.55 4.78 5.87v5.43h-4v-4.8c0-1.15-.02-2.62-1.6-2.62-1.6 0-1.85 1.25-1.85 2.54v4.88h-4v-11Z" />
  ),
  x: <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z" />,
  youtube: (
    <path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42A2.5 2.5 0 0 0 2.42 7.2C2 8.76 2 12 2 12s0 3.24.42 4.81a2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77C22 15.24 22 12 22 12s0-3.24-.42-4.81ZM10 15.02V8.98L15.2 12 10 15.02Z" />
  ),
  threads: (
    <path
      {...stroke}
      d="M17.5 7.5C16.3 5 14.3 3.8 12 3.8 7.6 3.8 5 7 5 12s2.6 8.2 7 8.2c3.6 0 6.2-2 6.2-5 0-2.6-2-4.1-5.2-4.1-2.3 0-3.8 1.1-3.8 2.7 0 1.5 1.3 2.4 2.9 2.4 2.6 0 3.8-2 3.6-5.7"
    />
  ),
  whatsapp: (
    <>
      <path {...stroke} strokeWidth={1.8} d="M4.3 19.7 5.4 15.8A8.2 8.2 0 1 1 8.4 18.7L4.3 19.7Z" />
      <path d="M9.2 7.6c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.9 4.5 4 2.2.9 2.7.7 3.2.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3l-2-.9c-.3-.1-.5-.2-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.1Z" />
    </>
  ),
  telegram: (
    <path
      fillRule="evenodd"
      d="M21.4 3.6 2.9 10.7c-1 .4-.9 1.4.1 1.7l4.6 1.4 1.7 5.3c.3.8 1.2 1 1.8.4l2.5-2.4 4.7 3.5c.8.6 1.8.1 2-.9l3-14.6c.2-1.1-.9-1.9-1.9-1.5Zm-11.3 11.5-.4 3.2-1.3-4.1 8.9-6.4-7.2 7.3Z"
    />
  ),
  pinterest: (
    <path d="M10.2 21.5l1.3-5.1c.4.7 1.4 1.3 2.6 1.3 3.4 0 5.8-3.1 5.8-7.1 0-3.7-3-6.6-7.1-6.6-5 0-7.6 3.4-7.6 7 0 1.7.9 3.8 2.3 4.4.2.1.3 0 .4-.2l.3-1.2c0-.2 0-.3-.1-.5-.5-.6-.8-1.5-.8-2.5 0-3 2.3-5.8 6-5.8 3.2 0 5.5 2.2 5.5 5.4 0 3.6-1.8 6.1-4.2 6.1-1.3 0-2.3-1.1-2-2.4.4-1.6 1.1-3.3 1.1-4.4 0-1-.5-1.9-1.7-1.9-1.3 0-2.4 1.4-2.4 3.3 0 1.2.4 2 .4 2l-1.6 6.8c-.3 1.2-.2 2.8-.1 3.9l.9-.4Z" />
  ),
  tiktok: (
    <path d="M16.7 5.3a4.5 4.5 0 0 1-1.1-2.8h-3.2v12.9a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V9.5a6 6 0 1 0 5.1 5.9V8.9a7.6 7.6 0 0 0 4.4 1.4V7.1a4.5 4.5 0 0 1-3.3-1.8Z" />
  ),
  website: (
    <>
      <circle cx="12" cy="12" r="9" {...stroke} strokeWidth={1.8} />
      <path {...stroke} strokeWidth={1.8} d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" />
    </>
  ),
};

/** A social network's icon, sized by `className`. Decorative: the link carries the name. */
export function SocialIcon({ network, className }: { network: SocialNetwork; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      {glyphs[network]}
    </svg>
  );
}
