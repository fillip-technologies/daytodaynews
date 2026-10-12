"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/actions/auth";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { UserSession } from "@/lib/auth";

type AdminNavProps = {
  user: UserSession;
};

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "chart" as const },
  { label: "Articles", href: "/admin/articles", icon: "layers" as const },
  { label: "Categories", href: "/admin/categories", icon: "sparkles" as const },
  { label: "Users & Staff", href: "/admin/users", icon: "users" as const },
  { label: "Inbox & Leads", href: "/admin/inbox", icon: "mail" as const },
  { label: "Site Configuration", href: "/admin/settings", icon: "settings" as const },
];

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer upon route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Logo & Portal Branding */}
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-bold text-surface-elevated shadow-xs">
              D
            </span>
            <div>
              <span className="text-base font-bold tracking-tight text-text-primary">
                DayToday<span className="text-primary">News</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-accent-secondary">
                Admin Workspace
              </span>
            </div>
          </Link>
          {mobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1 text-text-muted hover:bg-background hover:text-text-primary md:hidden"
            >
              <Icon name="close" className="size-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="mt-8 space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-surface-elevated shadow-xs font-semibold"
                    : "text-text-secondary hover:bg-background hover:text-text-primary"
                )}
              >
                <Icon name={item.icon} className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Footer Actions */}
      <div className="mt-8 border-t border-border pt-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
            {user.name ? user.name[0].toUpperCase() : "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-text-primary">{user.name}</p>
            <span className="inline-block rounded-full bg-accent-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-secondary">
              {user.role}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-background hover:text-text-primary"
          >
            <Icon name="arrowRight" className="size-3.5" />
            View Public Website
          </Link>

          <form action={logoutAdmin}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-error transition-colors hover:bg-error/10"
            >
              <Icon name="close" className="size-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top App Bar (visible on screens < md) */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-surface-elevated/95 px-4 backdrop-blur-sm md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-1.5 text-text-secondary hover:bg-background hover:text-text-primary"
          aria-label="Open Admin Menu"
        >
          <Icon name="menu" className="size-5" />
        </button>

        <Link href="/admin" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-xs font-bold text-surface-elevated shadow-xs">
            D
          </span>
          <span className="text-sm font-bold tracking-tight text-text-primary">
            DayToday<span className="text-primary">News</span>
          </span>
          <span className="rounded bg-accent-secondary/10 px-1.5 py-0.5 text-[9px] font-bold text-accent-secondary uppercase">
            Admin
          </span>
        </Link>

        <div className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
          {user.name ? user.name[0].toUpperCase() : "A"}
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Slide-out panel */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-text-primary/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-surface-elevated p-6 shadow-2xl">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sticky Sidebar (pinned on screens >= md) */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-surface-elevated md:p-6 overflow-y-auto">
        {navContent}
      </aside>
    </>
  );
}
