"use client";

import { useState, useMemo } from "react";
import { icons as lucideIcons } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

function pascalToKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

// Convert all available Lucide icons once into clean kebab-case names
const ALL_ICONS: string[] = Object.keys(lucideIcons)
  .map(pascalToKebab)
  .sort((a, b) => a.localeCompare(b));

type IconPickerProps = {
  value: string;
  onChange: (iconName: string) => void;
};

const CATEGORY_TAGS: { label: string; icons: string[] }[] = [
  {
    label: "All",
    icons: [],
  },
  {
    label: "AI & Data",
    icons: [
      "sparkles",
      "bot",
      "brain",
      "cpu",
      "circuit-board",
      "network",
      "binary",
      "activity",
      "zap",
      "atom",
      "lightbulb",
      "flame",
    ],
  },
  {
    label: "Code & Dev",
    icons: [
      "code",
      "terminal",
      "layers",
      "database",
      "server",
      "git-branch",
      "laptop",
      "braces",
      "webhook",
      "bug",
      "file-code",
      "box",
    ],
  },
  {
    label: "Cloud & Ops",
    icons: [
      "cloud",
      "cloud-cog",
      "cloud-rain",
      "hard-drive",
      "workflow",
      "container",
      "boxes",
      "settings",
      "sliders",
      "wrench",
      "gauge",
      "rocket",
    ],
  },
  {
    label: "Security",
    icons: [
      "shield",
      "shield-check",
      "shield-alert",
      "lock",
      "key",
      "fingerprint",
      "file-lock",
      "eye",
      "badge-check",
      "radar",
    ],
  },
  {
    label: "Business & Growth",
    icons: [
      "briefcase",
      "chart",
      "trending-up",
      "line-chart",
      "pie-chart",
      "bar-chart",
      "dollar-sign",
      "wallet",
      "building",
      "award",
      "target",
    ],
  },
  {
    label: "Media & Editorial",
    icons: [
      "newspaper",
      "pen",
      "feather",
      "palette",
      "camera",
      "video",
      "globe",
      "book-open",
      "rss",
      "bookmark",
      "file-text",
      "mail",
    ],
  },
  {
    label: "People & Teams",
    icons: [
      "users",
      "user-check",
      "user-plus",
      "heart-handshake",
      "message-square",
      "messages-square",
      "phone",
      "headset",
    ],
  },
];

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [displayLimit, setDisplayLimit] = useState(60);

  const filteredIcons = useMemo(() => {
    let list: string[] = ALL_ICONS;

    // Filter by category tag if not "All"
    if (selectedTag !== "All") {
      const tagObj = CATEGORY_TAGS.find((t) => t.label === selectedTag);
      if (tagObj && tagObj.icons.length > 0) {
        list = tagObj.icons;
      }
    }

    // Filter by search query
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      list = ALL_ICONS.filter((name) => name.includes(query));
    }

    return list;
  }, [search, selectedTag]);

  const displayedIcons = useMemo(() => {
    return filteredIcons.slice(0, displayLimit);
  }, [filteredIcons, displayLimit]);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-background/60 p-3.5">
      {/* Header and Current Selection */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-text-primary">
          Category Icon <span className="font-normal text-text-muted">({ALL_ICONS.length}+ icons available)</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-muted">Selected:</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            <Icon name={value || "sparkles"} className="size-3.5" />
            <code className="text-[11px]">{value || "sparkles"}</code>
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search icons (e.g. cpu, cloud, database, shield, bot, rocket)..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setDisplayLimit(60);
          }}
          className="h-8.5 w-full rounded-xl border border-border bg-surface-elevated pr-8 pl-8 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
        <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-text-muted">
          <Icon name="search" className="size-3.5" />
        </span>
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <Icon name="close" className="size-3" />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      {!search && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {CATEGORY_TAGS.map((tag) => {
            const isActive = selectedTag === tag.label;
            return (
              <button
                key={tag.label}
                type="button"
                onClick={() => {
                  setSelectedTag(tag.label);
                  setDisplayLimit(60);
                }}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-surface-elevated shadow-xs"
                    : "border border-border bg-surface-elevated text-text-secondary hover:border-text-muted/40 hover:text-text-primary"
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Icons */}
      <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-surface-elevated p-2 [scrollbar-width:thin]">
        {displayedIcons.length === 0 ? (
          <div className="py-6 text-center text-xs text-text-muted">
            No icons matching &ldquo;{search}&rdquo;. Try another keyword.
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
            {displayedIcons.map((ic) => {
              const isSelected = value === ic;
              return (
                <button
                  key={ic}
                  type="button"
                  title={ic}
                  onClick={() => onChange(ic)}
                  className={`group flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center transition-all ${
                    isSelected
                      ? "border border-primary bg-primary/15 text-primary shadow-xs ring-1 ring-primary/40"
                      : "border border-transparent text-text-muted hover:border-border hover:bg-background hover:text-text-primary"
                  }`}
                >
                  <Icon name={ic} className="size-4 shrink-0" />
                  <span className="w-full truncate text-[9px] font-medium leading-none">{ic}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {filteredIcons.length > displayLimit && (
          <div className="mt-2 text-center border-t border-border/60 pt-2">
            <button
              type="button"
              onClick={() => setDisplayLimit((prev) => prev + 60)}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Show More Icons ({filteredIcons.length - displayLimit} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
