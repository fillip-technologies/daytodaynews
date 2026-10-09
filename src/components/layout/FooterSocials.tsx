import type { ReactNode } from "react";
import { socialLinks, type SocialNetwork } from "@/config/footerNavigation";
import { toneStyle } from "@/lib/tones";

// Simplified brand glyphs on a 24px grid, filled with currentColor.
const glyphs: Record<SocialNetwork, ReactNode> = {
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.05c.53-1 1.83-1.8 3.77-1.8 4.03 0 4.78 2.55 4.78 5.87v5.43h-4v-4.8c0-1.15-.02-2.62-1.6-2.62-1.6 0-1.85 1.25-1.85 2.54v4.88h-4v-11Z" />
  ),
  x: <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.2" />
    </>
  ),
  youtube: (
    <path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42A2.5 2.5 0 0 0 2.42 7.2C2 8.76 2 12 2 12s0 3.24.42 4.81a2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77C22 15.24 22 12 22 12s0-3.24-.42-4.81ZM10 15.02V8.98L15.2 12 10 15.02Z" />
  ),
};

export function FooterSocials() {
  return (
    <div className="flex items-center gap-3">
      <p className="text-sm font-medium text-text-secondary">Follow Us</p>
      <ul className="flex items-center gap-2">
        {socialLinks.map((social) => (
          <li key={social.network} style={toneStyle(social.tone)}>
            <a
              href={social.href}
              aria-label={social.label}
              {...(social.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
              className="grid size-10 place-items-center rounded-full border border-border bg-surface-elevated text-text-secondary transition-[background-color,border-color,color,translate] duration-200 hover:-translate-y-0.5 hover:border-transparent hover:bg-(color:--tone) hover:text-surface-elevated outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-[18px]">
                {glyphs[social.network]}
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
