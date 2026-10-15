"use client";

import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import { BackToTop } from "./BackToTop";
import { FooterSocials, type FooterSocialLink } from "./FooterSocials";

/** The company that designs and manages the site (Admin → SEO → Brand & Credits). */
export type FooterCredit = { label: string; name: string; url: string; logoUrl: string; logoHeight: number };

export function FooterBottomBar({ credit, socials }: { credit: FooterCredit | null; socials: FooterSocialLink[] }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-5 border-t border-border py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
        <p className="text-sm text-text-muted">
          {format(t.footer.copyright, { year: new Date().getFullYear() })}
        </p>
        {credit && (
          <a
            href={credit.url}
            target="_blank"
            rel="noopener"
            className="group inline-flex w-fit items-center gap-2.5 rounded-md text-sm text-text-muted transition-colors hover:text-primary outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
          >
            {credit.label}
            {credit.logoUrl ? (
              // Any address an admin enters, so a plain <img> rather than next/image (which needs known hosts).
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={credit.logoUrl}
                alt={credit.name}
                height={credit.logoHeight}
                loading="lazy"
                decoding="async"
                style={{ height: credit.logoHeight }}
                className="w-auto max-w-[70vw] object-contain transition-opacity duration-200 group-hover:opacity-80"
              />
            ) : (
              <span className="font-semibold text-text-primary group-hover:text-primary">{credit.name}</span>
            )}
          </a>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 sm:justify-end">
        <FooterSocials links={socials} />
        <BackToTop />
      </div>
    </div>
  );
}
