"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { DesktopNav } from "./DesktopNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { SearchButton } from "./SearchButton";
import { SubscribeButton } from "./SubscribeButton";
import { UtilityBar } from "./UtilityBar";

import type { NavItem } from "@/config/navigation";

const MENU_ID = "site-menu";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** True once the page has scrolled past the top; false during SSR. */
function useScrolled(threshold = 8) {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > threshold,
    () => false,
  );
}

type HeaderProps = {
  /** Menus for the header bar and the menu drawer. */
  items?: NavItem[];
};

/**
 * Utility strip, then the brand row and the menu bar. From `lg` up the header
 * sticks at -4rem, so the brand row scrolls away and the menu bar stays.
 */
export function Header({ items }: HeaderProps) {
  const { t } = useI18n();
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the menu once a navigation lands (e.g. after switching language from it).
  const pathname = usePathname();
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <>
      <UtilityBar className="hidden lg:block" />
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-border transition-[background-color,box-shadow] duration-200 lg:-top-16",
          scrolled ? "bg-surface-elevated/95 shadow-header backdrop-blur-sm" : "bg-surface-elevated",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Logo />

          {/* The search fills the row between the logo and the buttons. Visibility
              lives on wrappers so it never fights the components' own display classes. */}
          <div className="hidden min-w-0 flex-1 md:block md:px-4 lg:px-8">
            <SearchButton variant="field" placeholder={t.header.searchPlaceholder} className="w-full" />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:ml-0">
            <div className="md:hidden">
              <SearchButton variant="icon" />
            </div>
            <div className="hidden sm:block lg:hidden">
              <LanguageSwitcher />
            </div>
            <div className="hidden sm:block">
              <SubscribeButton />
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.header.openMenu}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-controls={MENU_ID}
              className={cn(
                "grid size-10 place-items-center rounded-full text-text-secondary transition-colors duration-150 lg:hidden",
                "hover:bg-text-primary/5 hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
                menuOpen && "bg-text-primary/5 text-text-primary",
              )}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>

        <DesktopNav items={items} className="hidden border-t border-border lg:block" />

        <MobileNav id={MENU_ID} items={items} open={menuOpen} onClose={() => setMenuOpen(false)} />
      </header>
    </>
  );
}
