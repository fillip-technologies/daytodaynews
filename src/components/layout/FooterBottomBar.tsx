"use client";

import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import { BackToTop } from "./BackToTop";
import { FooterSocials } from "./FooterSocials";

export function FooterBottomBar() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-5 border-t border-border py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="text-sm text-text-muted">
        {format(t.footer.copyright, { year: new Date().getFullYear() })}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 sm:justify-end">
        <FooterSocials />
        <BackToTop />
      </div>
    </div>
  );
}
