import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { Topic } from "@/data/topics";
import { toneStyle } from "@/lib/tones";
import { SectionHeader, sectionContainer } from "./SectionHeader";

export function ExploreTopics({ topics }: { topics: Topic[] }) {
  return (
    <section aria-labelledby="explore-topics-title" className="py-10 sm:py-12">
      <div className={sectionContainer}>
        <SectionHeader
          id="explore-topics-title"
          title="Explore Topics"
          description="Explore practical insights across the technologies shaping modern businesses."
        />

        {/* Scrolls horizontally below lg; a single row of seven on desktop. */}
        <ul className="-mx-4 mt-7 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:px-0 lg:pb-0">
          {topics.map((topic) => (
            <li key={topic.slug} style={toneStyle(topic.tone)} className="w-40 shrink-0 snap-start sm:w-44 lg:w-auto">
              <Link
                href={topic.href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface-elevated p-4 transition-[translate,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-(color:--tone)/35 hover:bg-(color:--tone)/5 hover:shadow-[0_14px_28px_-18px] hover:shadow-(color:--tone)/50 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0"
              >
                <span className="flex items-start justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-(color:--tone)/10 text-(color:--tone) transition-colors duration-200 group-hover:bg-(color:--tone) group-hover:text-surface-elevated">
                    <Icon name={topic.icon} className="size-5" />
                  </span>
                  <Icon
                    name="arrowRight"
                    className="size-4 -translate-x-1 text-(color:--tone) opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </span>
                <span className="mt-4 text-sm leading-snug font-semibold text-text-primary">
                  {topic.label}
                </span>
                <span className="mt-1 text-xs leading-relaxed text-text-muted">{topic.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
