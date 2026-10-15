"use client";

import { socialNetworkNames, socialTones, type SocialLink } from "@/config/footerNavigation";
import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import { toneStyle } from "@/lib/tones";
import { SocialIcon } from "./SocialIcon";

/** "facebook" → "Facebook"; an "Other website" link is named by its domain. */
function networkName({ network, url }: SocialLink) {
  if (network !== "website") return socialNetworkNames[network];
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Profile icons from Admin → SEO → Brand & Credits, in the admin's order; hidden until one is added. */
export function FooterSocials({ links }: { links: SocialLink[] }) {
  const { t } = useI18n();
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm font-medium text-text-secondary">{t.footer.followUs}</p>
      <ul className="flex flex-wrap items-center gap-2">
        {links.map((social) => (
          <li key={social.url} style={toneStyle(socialTones[social.network])}>
            <a
              href={social.url}
              aria-label={format(t.footer.socialLabel, { network: networkName(social) })}
              target="_blank"
              rel="noopener noreferrer me"
              className="grid size-10 place-items-center rounded-full border border-border bg-surface-elevated text-text-secondary transition-[background-color,border-color,color,translate] duration-200 hover:-translate-y-0.5 hover:border-transparent hover:bg-(color:--tone) hover:text-surface-elevated outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0"
            >
              <SocialIcon network={social.network} className="size-[18px]" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
