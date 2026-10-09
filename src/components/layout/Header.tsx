"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { DesktopNav } from "./DesktopNav";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { SearchButton } from "./SearchButton";
import { SubscribeButton } from "./SubscribeButton";

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

export function Header() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-border bg-surface/95 shadow-header backdrop-blur-sm"
          : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[4.5rem] lg:gap-6 lg:px-8">
        <Logo />

        <DesktopNav className="hidden min-w-0 flex-1 justify-center md:flex" />

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Visibility lives on wrappers so it never fights the components' own display classes. */}
          <div className="hidden w-56 xl:block">
            <SearchButton variant="field" className="w-full" />
          </div>
          <div className="xl:hidden">
            <SearchButton variant="icon" />
          </div>
          <div className="hidden lg:block">
            <SubscribeButton />
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
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

      <MobileNav id={MENU_ID} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
