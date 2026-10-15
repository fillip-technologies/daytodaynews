"use client";

import { createContext, use, type ReactNode } from "react";
import type { LogoSize } from "@/lib/seo/site-config";

/** The site logo from Admin → SEO → Brand & Credits: file, its pixel size and display heights. */
export type SiteLogo = LogoSize & { src: string; width: number; height: number };

const BrandContext = createContext<SiteLogo | null>(null);

export function BrandProvider({ logo, children }: { logo: SiteLogo; children: ReactNode }) {
  return <BrandContext value={logo}>{children}</BrandContext>;
}

/** The site logo for Client Components under the `[lang]` layout. */
export function useSiteLogo(): SiteLogo {
  const logo = use(BrandContext);
  if (!logo) throw new Error("useSiteLogo must be used inside <BrandProvider>.");
  return logo;
}
