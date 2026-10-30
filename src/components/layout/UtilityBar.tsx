"use client";

import Link from "@/i18n/Link";
import { usePathname } from "next/navigation";
import { isActivePath, utilityNavigation } from "@/config/navigation";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { LanguageSwitcher } from "./LanguageSwitcher";

/** Thin strip above the header: about, contributor and contact links, and the language switch. */
export function UtilityBar({ className }: { className?: string }) {
  const { t } = useI18n();
  const pathname = usePathname();
  // Several links can share a page; only the first is marked current.
  const current = utilityNavigation.find((link) => isActivePath(pathname, link.href))?.key;

  return (
    <div className={cn("border-b border-border bg-surface", className)}>
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <nav aria-label={t.header.utilityNav} className="min-w-0">
          <ul className="flex items-center gap-x-5">
            {utilityNavigation.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  aria-current={link.key === current ? "page" : undefined}
                  className={cn(
                    "rounded-sm text-xs font-medium whitespace-nowrap text-text-muted transition-colors duration-150",
                    "hover:text-text-primary aria-[current=page]:text-primary",
                    "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
                  )}
                >
                  {t.utilityNav[link.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <LanguageSwitcher size="sm" className="-mr-2 shrink-0" />
      </div>
    </div>
  );
}
