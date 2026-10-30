"use client";

import Link from "@/i18n/Link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Icon } from "@/components/ui/Icon";
import { isActivePath, primaryNavigation, type NavItem } from "@/config/navigation";
import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { MegaMenu, hasMegaMenu } from "./MegaMenu";

/** Hover time before a menu opens or switches, so sweeping across the bar doesn't flash menus. */
const OPEN_DELAY = 100;
/** Grace period after the pointer leaves, so it can travel into the panel. */
const CLOSE_DELAY = 150;

/** `pinned` menus were opened by click or keyboard and ignore pointer-leave. */
type OpenMenu = { href: string; pinned: boolean } | null;

/** Hover opens menus only for a mouse. */
const canHover = (event: PointerEvent) => event.pointerType === "mouse";

/** Where a horizontal scroller is: "none" when everything fits. */
type ScrollEdge = "none" | "start" | "middle" | "end";

function useScrollEdge(ref: RefObject<HTMLElement | null>): ScrollEdge {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const el = ref.current;
      if (!el) return () => {};
      // Items resize as fonts load, which changes the overflow without resizing the scroller.
      const observer = new ResizeObserver(onChange);
      observer.observe(el);
      for (const child of el.children) observer.observe(child);
      el.addEventListener("scroll", onChange, { passive: true });
      return () => {
        observer.disconnect();
        el.removeEventListener("scroll", onChange);
      };
    },
    [ref],
  );
  return useSyncExternalStore(
    subscribe,
    () => {
      const el = ref.current;
      if (!el) return "none";
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 1) return "none";
      return el.scrollLeft <= 1 ? "start" : el.scrollLeft >= max - 1 ? "end" : "middle";
    },
    () => "none",
  );
}

/**
 * The menu bar: Home, then each menu. Hover opens a menu's mega panel, the
 * chevron button toggles it for click, touch and keyboard. Escape, an outside
 * click or moving focus elsewhere closes it. When the menus don't fit, the bar
 * scrolls sideways and arrow buttons appear at its ends.
 */
export function DesktopNav({ items, className }: { items?: NavItem[]; className?: string }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const navList = items && items.length > 0 ? items : primaryNavigation;

  const [open, setOpen] = useState<OpenMenu>(null);
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const edge = useScrollEdge(listRef);

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

  const scrollBy = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: direction * list.clientWidth * 0.6, behavior: smooth ? "smooth" : "auto" });
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
    // The nav spans the header's full width and ends at its bottom, so the panels
    // position against it; nothing between it and them is positioned, which
    // also lets them escape the scroller's clipping.
    <nav ref={navRef} aria-label={t.header.primaryNav} className={cn("relative", className)}>
      <div className="mx-auto h-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul
          ref={listRef}
          // Spread across the bar when there is room; packed from the start when it scrolls.
          className="-mx-2 flex h-full items-stretch justify-between overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <li className="flex shrink-0">
            <TopLink href="/" label={t.common.home} active={isActivePath(pathname, "/")} onClick={close} />
          </li>
          {navList.map((item, index) => {
            const active = isActivePath(pathname, item.href);
            const withMenu = hasMegaMenu(item);
            const isOpen = open?.href === item.href;
            const panelId = `mega-menu-${index}`;

            return (
              <li
                key={item.href}
                className="flex shrink-0"
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
                <TopLink
                  href={item.href}
                  label={item.label}
                  active={active}
                  highlighted={isOpen}
                  onClick={close}
                  toggle={
                    withMenu && (
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
                          "mr-0.5 grid size-5 place-items-center rounded-md transition-colors duration-150",
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
                    )
                  }
                />

                {withMenu && (
                  <div
                    id={panelId}
                    // Any link inside navigates away, so close on its click.
                    onClick={(event) => {
                      if ((event.target as Element).closest("a")) close();
                    }}
                    className={cn(
                      "absolute inset-x-0 top-full max-h-[calc(100dvh-9.5rem)] overflow-y-auto overscroll-contain",
                      "border-y border-border bg-surface-elevated shadow-menu",
                      "transition-[opacity,translate,display] transition-discrete duration-150 ease-out motion-reduce:transition-none",
                      isOpen
                        ? "block translate-y-0 opacity-100 starting:-translate-y-1 starting:opacity-0"
                        : "hidden -translate-y-1 opacity-0",
                    )}
                  >
                    <MegaMenu item={item} id={panelId} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {edge !== "none" && (
        <>
          <ScrollButton direction={-1} disabled={edge === "start"} label={t.header.scrollBack} onClick={scrollBy} />
          <ScrollButton direction={1} disabled={edge === "end"} label={t.header.scrollForward} onClick={scrollBy} />
        </>
      )}
    </nav>
  );
}

/** A menu-bar link, its optional menu toggle and the active underline. */
function TopLink({
  href,
  label,
  active,
  highlighted = false,
  onClick,
  toggle,
}: {
  href: string;
  label: string;
  active: boolean;
  highlighted?: boolean;
  onClick: () => void;
  toggle?: ReactNode;
}) {
  return (
    // Positioned wrapper for the underline only; the panel positions against the header.
    <div className="relative flex items-center">
      <Link
        href={href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center rounded-md py-2 pl-2 text-[0.8125rem] font-medium whitespace-nowrap transition-colors duration-150 xl:text-sm",
          "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
          toggle ? "pr-0.5" : "pr-2",
          active ? "text-primary" : highlighted ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
        )}
      >
        {label}
      </Link>
      {toggle}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary transition-transform duration-200 motion-reduce:transition-none",
          active || highlighted ? "scale-x-100" : "scale-x-0",
        )}
      />
    </div>
  );
}

/**
 * Scrolls the menu bar, over a fade at its end. A mouse aid only: keyboard
 * focus scrolls items into view itself.
 */
function ScrollButton({
  direction,
  disabled,
  label,
  onClick,
}: {
  direction: 1 | -1;
  disabled: boolean;
  label: string;
  onClick: (direction: 1 | -1) => void;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      title={label}
      aria-hidden="true"
      disabled={disabled}
      onClick={() => onClick(direction)}
      className={cn(
        "absolute top-0 flex h-12 w-14 items-center from-surface-elevated from-40% to-transparent text-text-muted",
        "transition-[color,opacity] duration-150 hover:text-text-primary disabled:pointer-events-none disabled:opacity-0",
        direction === -1
          ? "left-[max(1.5rem,calc(50%-38.5rem))] justify-start bg-linear-to-r"
          : "right-[max(1.5rem,calc(50%-38.5rem))] justify-end bg-linear-to-l",
      )}
    >
      <Icon name={direction === -1 ? "chevron-left" : "chevron-right"} className="size-4" />
    </button>
  );
}
