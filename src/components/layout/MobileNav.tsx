"use client";

import Link from "@/i18n/Link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import { isActivePath, primaryNavigation, secondaryNavigation } from "@/config/navigation";
import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import type { NavItem } from "@/config/navigation";
import { SearchButton } from "./SearchButton";
import { SubscribeButton } from "./SubscribeButton";

type MobileNavProps = {
  id: string;
  /** Every category; each one's topics expand in place. */
  sections?: NavItem[];
  open: boolean;
  onClose: () => void;
};

/**
 * Site menu drawer. It is the full navigation on mobile and the "Menu"
 * overflow on larger screens, so it lists every category plus secondary links.
 * Categories with topics expand accordion-style, which works by touch.
 */
export function MobileNav({ id, sections, open, onClose }: MobileNavProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const navList = sections && sections.length > 0 ? sections : primaryNavigation;
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Sheet id={id} open={open} onClose={onClose} label={t.header.siteMenu}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-5">
          <Logo onClick={onClose} />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={onClose}
              aria-label={t.header.closeMenu}
              className="grid size-10 place-items-center rounded-full text-text-secondary transition-colors hover:bg-text-primary/5 hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Icon name="close" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <SearchButton variant="field" placeholder={t.header.searchPlaceholder} className="w-full" />

          <nav aria-label={t.header.sections} className="mt-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
              {t.header.sections}
            </p>
            <ul className="mt-2 space-y-0.5">
              {navList.map((item, index) => {
                const active = isActivePath(pathname, item.href);
                const topics = item.topics ?? [];
                const isExpanded = expanded === item.href;
                const panelId = `${id}-topics-${index}`;
                return (
                  <li key={item.href}>
                    <div className="flex items-center gap-1">
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150",
                          "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
                          active ? "bg-primary/10" : "hover:bg-text-primary/5",
                        )}
                      >
                        {item.icon && (
                          <span
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-lg border transition-colors",
                              active
                                ? "border-transparent bg-primary text-surface-elevated"
                                : "border-border bg-surface text-text-secondary group-hover:text-primary",
                            )}
                          >
                            <Icon name={item.icon} className="size-[18px]" />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span
                            className={cn(
                              "block text-[0.9375rem] font-medium",
                              active ? "text-primary" : "text-text-primary",
                            )}
                          >
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="block truncate text-sm text-text-muted">
                              {item.description}
                            </span>
                          )}
                        </span>
                      </Link>
                      {topics.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpanded(isExpanded ? null : item.href)}
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                          aria-label={format(t.header.topicsFor, { label: item.label })}
                          className={cn(
                            "grid size-11 shrink-0 place-items-center rounded-xl transition-colors duration-150",
                            "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
                            isExpanded
                              ? "bg-text-primary/5 text-text-primary"
                              : "text-text-muted hover:bg-text-primary/5 hover:text-text-primary",
                          )}
                        >
                          <Icon
                            name="chevronDown"
                            className={cn(
                              "size-4 transition-transform duration-200 motion-reduce:transition-none",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </button>
                      )}
                    </div>
                    {topics.length > 0 && (
                      <ul id={panelId} hidden={!isExpanded} className="mt-1 mb-2 ml-15 border-l border-border pl-2">
                        {topics.map((topic, topicIndex) => (
                          <li key={`${topicIndex}:${topic.href}`}>
                            <Link
                              href={topic.href}
                              onClick={onClose}
                              className="block rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-text-primary/5 hover:text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                            >
                              {topic.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <nav aria-label={t.header.more} className="mt-6 border-t border-border pt-5">
            <ul className="grid grid-cols-2 gap-1">
              {secondaryNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-text-primary/5 hover:text-text-primary aria-[current=page]:text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {t.secondaryNav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="shrink-0 border-t border-border bg-background px-4 py-4 sm:px-5">
          <p className="mb-3 text-sm text-text-secondary">
            {t.header.drawerPitch}
          </p>
          <SubscribeButton size="md" className="w-full" onClick={onClose} />
        </div>
      </div>
    </Sheet>
  );
}
