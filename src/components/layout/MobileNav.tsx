"use client";

import Link from "@/i18n/Link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import { isActivePath, primaryNavigation, type NavGroup } from "@/config/navigation";
import type { LocalizedLink } from "@/lib/site-links";
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
  /** The header menus; each one's topics expand in place. */
  items?: NavItem[];
  /** The top strip's links (Admin → Links & Footer). */
  utilityLinks: LocalizedLink[];
  open: boolean;
  onClose: () => void;
};

const rowLinkClass =
  "block rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-text-primary/5 hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary";

/**
 * Site menu drawer, the navigation below `lg`: the same menus as the header
 * bar, plus the utility links. Menus with topics expand accordion-style, which
 * works by touch; a menu spanning several categories lists each under its name.
 */
export function MobileNav({ id, items, utilityLinks, open, onClose }: MobileNavProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const navList = items && items.length > 0 ? items : primaryNavigation;
  const [expanded, setExpanded] = useState<string | null>(null);
  const currentUtility = utilityLinks.findIndex((link) => isActivePath(pathname, link.href));

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
              <li>
                <MenuRow href="/" label={t.common.home} icon="house" active={isActivePath(pathname, "/")} onClose={onClose} />
              </li>
              {navList.map((item, index) => {
                const groups = (item.groups ?? []).filter((group) => group.topics.length > 0);
                const isExpanded = expanded === item.href;
                const panelId = `${id}-topics-${index}`;
                return (
                  <li key={item.href}>
                    <div className="flex items-center gap-1">
                      <MenuRow
                        href={item.href}
                        label={item.label}
                        description={item.description}
                        icon={item.icon}
                        active={isActivePath(pathname, item.href)}
                        onClose={onClose}
                      />
                      {groups.length > 0 && (
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
                    {groups.length > 0 && (
                      <div id={panelId} hidden={!isExpanded} className="mt-1 mb-2 ml-15 border-l border-border pl-2">
                        {groups.length === 1 ? (
                          <TopicLinks group={groups[0]} onClose={onClose} />
                        ) : (
                          groups.map((group) => (
                            <div key={group.href} className="mb-2 last:mb-0">
                              <Link
                                href={group.href}
                                onClick={onClose}
                                className="block rounded-lg px-3 pt-2.5 pb-1 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted transition-colors hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                              >
                                {group.label}
                              </Link>
                              <TopicLinks group={group} onClose={onClose} />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <nav aria-label={t.header.utilityNav} className="mt-6 border-t border-border pt-5">
            <ul className="grid grid-cols-2 gap-1">
              {utilityLinks.map((link, index) => (
                <li key={`${index}:${link.href}`}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={index === currentUtility ? "page" : undefined}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-text-primary/5 hover:text-text-primary aria-[current=page]:text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="shrink-0 border-t border-border bg-background px-4 py-4 sm:px-5">
          <p className="mb-3 text-sm text-text-secondary">{t.header.drawerPitch}</p>
          <SubscribeButton size="md" className="w-full" onClick={onClose} />
        </div>
      </div>
    </Sheet>
  );
}

function MenuRow({
  href,
  label,
  description,
  icon,
  active,
  onClose,
}: {
  href: string;
  label: string;
  description?: string;
  icon?: NavItem["icon"];
  active: boolean;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150",
        "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
        active ? "bg-primary/10" : "hover:bg-text-primary/5",
      )}
    >
      {icon && (
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg border transition-colors",
            active
              ? "border-transparent bg-primary text-surface-elevated"
              : "border-border bg-surface text-text-secondary group-hover:text-text-primary",
          )}
        >
          <Icon name={icon} className="size-[18px]" />
        </span>
      )}
      <span className="min-w-0">
        <span className={cn("block text-[0.9375rem] font-medium", active ? "text-primary" : "text-text-primary")}>
          {label}
        </span>
        {description && <span className="block truncate text-sm text-text-muted">{description}</span>}
      </span>
    </Link>
  );
}

function TopicLinks({ group, onClose }: { group: NavGroup; onClose: () => void }) {
  return (
    <ul>
      {group.topics.map((topic, index) => (
        <li key={`${index}:${topic.href}`}>
          <Link href={topic.href} onClick={onClose} className={rowLinkClass}>
            {topic.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
