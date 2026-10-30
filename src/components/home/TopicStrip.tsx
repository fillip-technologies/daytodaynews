import Link from "@/i18n/Link";
import { Icon } from "@/components/ui/Icon";
import type { Topic } from "@/data/topics";
import { getI18n } from "@/i18n/server";
import { toneStyle } from "@/lib/tones";
import { sectionContainer } from "./SectionHeader";

/** A compact row of category links; scrolls sideways on phones. */
export async function TopicStrip({ title, topics }: { title?: string; topics: Topic[] }) {
  if (topics.length === 0) return null;
  const { t } = await getI18n();

  return (
    <section aria-labelledby="topic-strip-title" className="pb-4">
      <div className={sectionContainer}>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:gap-5">
          <h2
            id="topic-strip-title"
            className="shrink-0 text-xs font-bold tracking-[0.14em] text-text-primary uppercase"
          >
            {title || t.home.exploreTitle}
          </h2>
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-5 sm:px-5 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
            {topics.map((topic) => (
              <li key={topic.slug} style={toneStyle(topic.tone)} className="shrink-0">
                <Link
                  href={topic.href || `/category/${topic.slug}`}
                  className="group inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background pr-3.5 pl-2 text-sm font-medium whitespace-nowrap text-text-secondary transition-colors hover:border-(color:--tone)/40 hover:bg-(color:--tone)/5 hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-6 place-items-center rounded-full bg-(color:--tone)/10 text-(color:--tone)"
                  >
                    <Icon name={topic.icon} className="size-3.5" />
                  </span>
                  {topic.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
