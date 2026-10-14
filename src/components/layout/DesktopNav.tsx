"use client";

import Link from "@/i18n/Link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { isActivePath, primaryNavigation, type NavItem } from "@/config/navigation";
import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { MegaMenu, hasMegaMenu } from "./MegaMenu";

// Full class names so Tailwind can see them.
const visibility: Record<NonNullable<NavItem["showFrom"]>, string> = {
  md: "flex",
  lg: "hidden lg:flex",
  xl: "hidden xl:flex",
};

/** Same cap as the admin header setting; every category is also in the menu drawer. */
const MAX_ITEMS = 5;
/** Hover time before a menu opens or switches, so sweeping across the bar doesn't flash menus. */
const OPEN_DELAY = 100;
/** Grace period after the pointer leaves, so it can travel into the panel. */
const CLOSE_DELAY = 150;

/** `pinned` menus were opened by click or keyboard and ignore pointer-leave. */
type OpenMenu = { href: string; pinned: boolean } | null;

/** Hover opens menus only for a mouse, and only where panels show (Tailwind `lg`). */
const canHover = (event: PointerEvent) =>
  event.pointerType === "mouse" && window.matchMedia("(min-width: 64rem)").matches;

/**
 * Category links with mega menus from `lg` up: hover opens a menu, the chevron
 * button toggles it for click, touch and keyboard. Escape, an outside click or
 * moving focus elsewhere closes it. Below `lg` the items are plain links.
 */
export function DesktopNav({ items, className }: { items?: NavItem[]; className?: string }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const navList = (items && items.length > 0 ? items : primaryNavigation).slice(0, MAX_ITEMS);

  const [open, setOpen] = useState<OpenMenu>(null);
  const navRef = useRef<HTMLElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Close whenever the route changes.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(null);
  }

  const cancelPending = () => clearTimeout(timer.current);
  const schedule = (next: OpenMenu, delay: number) => {
    cancelPending();
    timer.current = setTimeout(() => setOpen(next), delay);
  };
  const close = () => {
    cancelPending();
    setOpen(null);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const dismiss = () => {
      clearTimeout(timer.current);
      setOpen(null);
    };
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) dismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Return focus to the trigger if it was inside the menu.
      if (navRef.current?.contains(document.activeElement)) triggers.current.get(open.href)?.focus();
      dismiss();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <nav ref={navRef} aria-label={t.header.primaryNav} className={className}>
      <ul className="flex h-full items-stretch">
        {navList.map((item, index) => {
          const active = isActivePath(pathname, item.href);
          const withMenu = hasMegaMenu(item);
          const isOpen = open?.href === item.href;
          const panelId = `mega-menu-${index}`;

          return (
            <li
              key={item.href}
              className={visibility[item.showFrom ?? "md"]}
              onPointerEnter={(event) => {
                if (!withMenu || !canHover(event)) return;
                if (isOpen) cancelPending();
                else schedule({ href: item.href, pinned: false }, OPEN_DELAY);
              }}
              onPointerLeave={(event) => {
                if (!withMenu || !canHover(event)) return;
                if (open?.pinned) cancelPending();
                else schedule(null, CLOSE_DELAY);
              }}
              onBlur={(event) => {
                // Focus moved to another element outside this item (e.g. tabbing on).
                const next = event.relatedTarget as Node | null;
                if (isOpen && next && !event.currentTarget.contains(next)) close();
              }}
            >
              {/* Positioned wrapper for the underline; the panel positions against the header. */}
              <div className="relative flex items-center">
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center whitespace-nowrap rounded-md py-2 pl-2.5 text-sm font-medium transition-colors duration-150",
                    "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
                    withMenu ? "pr-2.5 lg:pr-1" : "pr-2.5",
                    active ? "text-primary" : isOpen ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {item.label}
                </Link>
                {withMenu && (
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) triggers.current.set(item.href, node);
                      else triggers.current.delete(item.href);
                    }}
                    onClick={() => {
                      cancelPending();
                      setOpen(isOpen && open.pinned ? null : { href: item.href, pinned: true });
                    }}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    aria-label={format(t.header.menuFor, { label: item.label })}
                    className={cn(
                      "mr-1 hidden size-6 place-items-center rounded-md transition-colors duration-150 lg:grid",
                      "outline-offset-1 focus-visible:outline-2 focus-visible:outline-primary",
                      isOpen ? "text-text-primary" : "text-text-muted hover:text-text-primary",
                    )}
                  >
                    <Icon
                      name="chevronDown"
                      className={cn(
                        "size-3.5 transition-transform duration-150 motion-reduce:transition-none",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-primary transition-transform duration-200 motion-reduce:transition-none",
                    active || isOpen ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </div>

              {withMenu && (
                <div
                  id={panelId}
                  // Any link inside navigates away, so close on its click.
                  onClick={(event) => {
                    if ((event.target as Element).closest("a")) close();
                  }}
                  className={cn(
                    "absolute inset-x-0 top-full hidden max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain",
                    "border-y border-border bg-surface-elevated shadow-menu",
                    "transition-[opacity,translate,display] transition-discrete duration-150 ease-out motion-reduce:transition-none",
                    isOpen
                      ? "lg:block translate-y-0 opacity-100 starting:-translate-y-1 starting:opacity-0"
                      : "-translate-y-1 opacity-0",
                  )}
                >
                  <MegaMenu item={item} id={panelId} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
