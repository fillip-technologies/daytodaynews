"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, primaryNavigation, type NavItem } from "@/config/navigation";
import { cn } from "@/lib/cn";

// Full class names so Tailwind can see them.
const visibility: Record<NonNullable<NavItem["showFrom"]>, string> = {
  md: "",
  lg: "hidden lg:block",
  xl: "hidden xl:block",
};

export function DesktopNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className={className}>
      <ul className="flex items-center gap-0.5 lg:gap-1">
        {primaryNavigation.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href} className={visibility[item.showFrom ?? "md"]}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium transition-colors duration-150 xl:px-3",
                  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-text-primary/5 hover:text-text-primary",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
