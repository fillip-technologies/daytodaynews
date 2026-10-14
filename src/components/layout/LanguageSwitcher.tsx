"use client";

import NextLink, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/i18n/client";
import { format, LOCALE_COOKIE, localeNames, locales, stripLocale, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Globe, or a spinner while the other language's page loads. */
function SwitchIcon({ busy }: { busy: boolean }) {
  const { pending } = useLinkStatus();
  return pending || busy ? (
    <Icon name="loader-circle" className="size-4 shrink-0 animate-spin motion-reduce:animate-none" />
  ) : (
    <Icon name="globe" className="size-4 shrink-0" />
  );
}

/**
 * Link to the current page in the other language. The choice is remembered in a
 * cookie, which the proxy uses when a reader next opens the home page.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const target: Locale = locales.find((l) => l !== locale) ?? locale;
  const rest = stripLocale(pathname);
  const href = `/${target}${rest === "/" ? "" : rest}`;

  return (
    <NextLink
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={format(t.header.switchTo, { language: localeNames[target] })}
      onClick={(event) => {
        document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
        // Keep the query (e.g. a search) when switching; read at click time so static pages stay static.
        if (window.location.search && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
          event.preventDefault();
          startTransition(() => router.push(href + window.location.search));
        }
      }}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-text-secondary transition-colors duration-150",
        "hover:bg-text-primary/5 hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary",
        className,
      )}
    >
      <SwitchIcon busy={isPending} />
      {localeNames[target]}
    </NextLink>
  );
}
