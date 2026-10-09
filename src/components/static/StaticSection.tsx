import type { ReactNode } from "react";
import { SectionHeader, sectionContainer } from "@/components/home/SectionHeader";
import { cn } from "@/lib/cn";

type StaticSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

/** Titled page section on the shared container, using the homepage section header. */
export function StaticSection({ id, title, description, children, className }: StaticSectionProps) {
  return (
    <section aria-labelledby={id} className={cn("py-10 sm:py-14", className)}>
      <div className={sectionContainer}>
        <SectionHeader id={id} title={title} description={description} />
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
