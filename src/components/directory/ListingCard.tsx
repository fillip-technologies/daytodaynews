import Link from "@/i18n/Link";
import { Icon } from "@/components/ui/Icon";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/cn";
import { listingPath } from "@/lib/directory-config";
import type { ListingCardData } from "@/lib/directory";

/**
 * Featured = paid placement, Verified = details checked by the team. Both are
 * labelled in words (not just colour), as the plan's commercial rule requires.
 */
export function TierBadge({ tier, t, className }: { tier: string; t: Dictionary; className?: string }) {
  if (tier === "FEATURED") {
    return (
      <span
        title={t.directory.featuredHint}
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning",
          className,
        )}
      >
        <Icon name="star" className="size-3" />
        {t.common.featured}
        <span className="font-semibold normal-case tracking-normal">· {t.directory.featuredHint}</span>
      </span>
    );
  }
  if (tier === "VERIFIED") {
    return (
      <span
        title={t.directory.verifiedHint}
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success",
          className,
        )}
      >
        <Icon name="badge-check" className="size-3" />
        {t.common.verified}
      </span>
    );
  }
  return null;
}

export function ListingLogo({ name, logoUrl, size = "md" }: { name: string; logoUrl: string | null; size?: "md" | "lg" }) {
  const box = size === "lg" ? "size-16 rounded-2xl text-xl" : "size-12 rounded-xl text-base";
  if (logoUrl) {
    // Logos come from any host the company uses; next/image would need each one configured.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt="" loading="lazy" className={cn(box, "shrink-0 border border-border bg-background object-contain p-1")} />;
  }
  return (
    <span aria-hidden="true" className={cn(box, "grid shrink-0 place-items-center bg-gradient-primary font-bold text-surface-elevated")}>
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export function ListingCard({ listing, t, from }: { listing: ListingCardData; t: Dictionary; from?: string }) {
  const location = [listing.city, listing.country].filter(Boolean).join(", ");
  const href = listingPath(listing.kind, listing.slug) + (from ? `?from=${encodeURIComponent(from)}` : "");
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border bg-surface-elevated p-5 transition-all duration-200 hover:shadow-md",
        listing.tier === "FEATURED" ? "border-warning/40" : "border-border hover:border-primary/40",
      )}
    >
      <div className="flex items-start gap-3.5">
        <ListingLogo name={listing.name} logoUrl={listing.logoUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug text-text-primary">
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary"
            >
              {listing.name}
            </Link>
          </h3>
          {listing.category && <p className="mt-0.5 truncate text-xs font-medium text-text-muted">{listing.category}</p>}
        </div>
      </div>
      {listing.tagline && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-secondary">{listing.tagline}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        <TierBadge tier={listing.tier} t={t} />
        {location && (
          <span className="inline-flex items-center gap-1 text-xs text-text-muted">
            <Icon name="map-pin" className="size-3.5" />
            {location}
          </span>
        )}
      </div>
    </article>
  );
}
