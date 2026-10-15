"use client";

import type { CSSProperties } from "react";
import Link from "@/i18n/Link";
import Image from "next/image";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { useSiteLogo } from "./BrandProvider";

type LogoProps = {
  className?: string;
  onClick?: () => void;
  /** Which admin-set height to use: the header pair (phone / wider screens) or the footer one. */
  variant?: "header" | "footer";
};

/** Files in /public and admin uploads (Cloudinary) are resized by next/image; other hosts are shown as they are. */
const isOptimizable = (src: string) => src.startsWith("/") || src.startsWith("https://res.cloudinary.com/");

export function Logo({ className, onClick, variant = "header" }: LogoProps) {
  const { t } = useI18n();
  const logo = useSiteLogo();

  const [mobile, desktop] = variant === "footer" ? [logo.footer, logo.footer] : [logo.headerMobile, logo.header];
  // Requested at the largest height shown, so next/image serves a file sized for the slot, not the original.
  const height = Math.max(mobile, desktop);
  const width = Math.max(1, Math.round((height * logo.width) / logo.height));

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={t.site.homeLabel}
      className={cn(
        "group flex shrink-0 items-center rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary",
        className,
      )}
    >
      <Image
        src={logo.src}
        alt={t.site.logoAlt}
        width={width}
        height={height}
        priority={variant === "header"}
        unoptimized={!isOptimizable(logo.src)}
        style={{ "--logo-h": `${mobile}px`, "--logo-h-sm": `${desktop}px` } as CSSProperties}
        className="h-(--logo-h) w-auto max-w-[60vw] object-contain transition-transform duration-200 group-hover:scale-[1.02] sm:h-(--logo-h-sm)"
      />
    </Link>
  );
}
