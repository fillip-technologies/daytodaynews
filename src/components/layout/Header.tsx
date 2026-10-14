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
  /** Categories for the header bar. */
  items?: NavItem[];
  /** Every category, for the menu drawer; defaults to `items`. */
  sections?: NavItem[];
};

export function Header({ items, sections }: HeaderProps) {
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
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border transition-[background-color,box-shadow] duration-200",
        scrolled ? "bg-surface-elevated/95 shadow-header backdrop-blur-sm" : "bg-surface-elevated",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-[4.5rem] lg:gap-6 lg:px-8">
        <Logo />

        <DesktopNav items={items} className="hidden h-full min-w-0 flex-1 justify-center md:flex" />

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Visibility lives on wrappers so it never fights the components' own display classes. */}
          <div className="hidden w-40 xl:block">
            <SearchButton variant="field" placeholder={t.header.searchPlaceholderShort} className="w-full" />
          </div>
          <div className="xl:hidden">
            <SearchButton variant="icon" />
          </div>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <div className="hidden lg:block">
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
              "grid size-10 place-items-center rounded-full text-text-secondary transition-colors duration-150",
              "hover:bg-text-primary/5 hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
              menuOpen && "bg-text-primary/5 text-text-primary",
            )}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      <MobileNav
        id={MENU_ID}
        sections={sections && sections.length > 0 ? sections : items}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </header>
  );
}
