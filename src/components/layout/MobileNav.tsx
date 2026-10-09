"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import { isActivePath, primaryNavigation, secondaryNavigation } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { SearchButton } from "./SearchButton";
import { SubscribeButton } from "./SubscribeButton";

type MobileNavProps = {
  id: string;
  open: boolean;
  onClose: () => void;
};

/**
 * Site menu drawer. It is the full navigation on mobile and the "Menu"
 * overflow on larger screens, so it lists every category plus secondary links.
 */
export function MobileNav({ id, open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet id={id} open={open} onClose={onClose} label="Site menu">
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-5">
          <Logo onClick={onClose} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-10 place-items-center rounded-full text-text-secondary transition-colors hover:bg-text-primary/5 hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <SearchButton variant="field" className="w-full" />

          <nav aria-label="Categories" className="mt-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
              Topics
            </p>
            <ul className="mt-2 space-y-0.5">
              {primaryNavigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150",
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
                  </li>
                );
              })}
            </ul>
          </nav>

          <nav aria-label="More" className="mt-6 border-t border-border pt-5">
            <ul className="grid grid-cols-2 gap-1">
              {secondaryNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-text-primary/5 hover:text-text-primary aria-[current=page]:text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="shrink-0 border-t border-border bg-background px-4 py-4 sm:px-5">
          <p className="mb-3 text-sm text-text-secondary">
            The week in AI, software and tech strategy — every Friday.
          </p>
          <SubscribeButton size="md" className="w-full" onClick={onClose} />
        </div>
      </div>
    </Sheet>
  );
}
