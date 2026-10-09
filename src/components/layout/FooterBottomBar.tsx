import { BackToTop } from "./BackToTop";
import { FooterSocials } from "./FooterSocials";

export function FooterBottomBar() {
  return (
    <div className="flex flex-col gap-5 border-t border-border py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="text-sm text-text-muted">
        © {new Date().getFullYear()} DayTodayNews. All rights reserved.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 sm:justify-end">
        <FooterSocials />
        <BackToTop />
      </div>
    </div>
  );
}
