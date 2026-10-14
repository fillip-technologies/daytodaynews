"use client";

import NextLink from "next/link";
import type { ComponentPropsWithRef } from "react";
import { localizePath } from "./config";
import { useLocale } from "./client";

type LinkProps = ComponentPropsWithRef<typeof NextLink>;

/**
 * Drop-in `next/link` that keeps internal links in the reader's language:
 * "/blog" renders as "/hi/blog" on Hindi pages. Data and the database keep
 * storing unprefixed paths.
 */
export default function Link({ href, ...props }: LinkProps) {
  const locale = useLocale();
  if (!locale) return <NextLink href={href} {...props} />;

  const localized =
    typeof href === "string"
      ? localizePath(href, locale)
      : { ...href, pathname: href.pathname ? localizePath(href.pathname, locale) : href.pathname };

  return <NextLink href={localized} {...props} />;
}
