import Link from "@/i18n/Link";
import { Icon } from "@/components/ui/Icon";

/** Page-width container shared by homepage sections. */
export const sectionContainer = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

type SectionHeaderProps = {
  id: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
};

/** Section masthead: a hairline rule with a short brand stroke, then the title. */
export function SectionHeader({ id, title, description, action }: SectionHeaderProps) {
  return (
    <header className="relative flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-border pt-5">
      <span aria-hidden="true" className="absolute -top-px left-0 h-[3px] w-12 bg-gradient-primary" />
      <div className="max-w-2xl">
        <h2 id={id} className="text-2xl font-semibold tracking-[-0.02em] text-text-primary sm:text-[1.875rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-base leading-relaxed text-text-secondary">{description}</p>
        )}
      </div>
      {action && <ViewAllLink {...action} />}
    </header>
  );
}

export function ViewAllLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 rounded-full py-1 text-sm font-semibold text-primary transition-colors hover:text-primary-hover outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
    >
      {label}
      <Icon
        name="arrowRight"
        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </Link>
  );
}
