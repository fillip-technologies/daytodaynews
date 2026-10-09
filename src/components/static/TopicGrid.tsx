import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { toneStyle, type Tone } from "@/lib/tones";

export type TopicGridItem = {
  label: string;
  description?: string;
  icon: IconName;
  tone: Tone;
  /** When set, the card links to this page. */
  href?: string;
};

type TopicGridProps = {
  items: TopicGridItem[];
  className?: string;
};

/** Grid of topic cards with a colored icon tile; linked cards get a hover lift. */
export function TopicGrid({ items, className }: TopicGridProps) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4", className)}>
      {items.map((item) => {
        const body = (
          <>
            <span className="flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-(color:--tone)/10 text-(color:--tone) transition-colors duration-200 group-hover:bg-(color:--tone) group-hover:text-surface-elevated">
                <Icon name={item.icon} className="size-5" />
              </span>
              {item.href && (
                <Icon
                  name="arrowRight"
                  className="size-4 -translate-x-1 text-(color:--tone) opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                />
              )}
            </span>
            <span className="mt-4 block font-semibold text-text-primary">{item.label}</span>
            {item.description && (
              <span className="mt-1 block text-sm leading-relaxed text-text-muted">{item.description}</span>
            )}
          </>
        );
        const cardClass =
          "group flex h-full flex-col rounded-2xl border border-border bg-surface-elevated p-5";
        return (
          <li key={item.label} style={toneStyle(item.tone)}>
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  cardClass,
                  "transition-[translate,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-(color:--tone)/35 hover:shadow-[0_14px_28px_-18px] hover:shadow-(color:--tone)/50",
                  "outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0",
                )}
              >
                {body}
              </Link>
            ) : (
              <div className={cardClass}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
