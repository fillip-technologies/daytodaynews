"use client";

import Image from "next/image";
import Link from "@/i18n/Link";
import { CoverArt } from "@/components/blog/CoverArt";
import { Icon } from "@/components/ui/Icon";
import type { NavGroup, NavItem, NavStory } from "@/config/navigation";
import { useI18n } from "@/i18n/client";
import { format, plural } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

/** True when a nav item has anything to show in a mega menu. */
export function hasMegaMenu(item: NavItem) {
  return Boolean(item.groups?.some((group) => group.topics.length > 0) || item.stories?.length);
}

// Full class names so Tailwind can see them.
const groupColumns: Record<number, string> = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3" };

/**
 * Mega-menu body for one menu. A single category gets an intro beside its
 * topics; several categories get a column each. Top stories sit on the right
 * (from `xl` only when there are several columns, which need the width).
 */
export function MegaMenu({ item, id }: { item: NavItem; id: string }) {
  const { t } = useI18n();
  const groups = item.groups ?? [];
  const stories = item.stories ?? [];
  const single = groups.length === 1 ? groups[0] : null;

  return (
    <div
      className={cn(
        "mx-auto grid w-full max-w-7xl gap-8 px-4 py-7 sm:px-6 lg:px-8",
        stories.length > 0 && (single ? "lg:grid-cols-[minmax(0,1fr)_17rem]" : "xl:grid-cols-[minmax(0,1fr)_17rem]"),
      )}
    >
      {single ? (
        <SingleGroup group={single} id={id} wide={stories.length === 0} />
      ) : (
        <div className={cn("grid gap-x-10 gap-y-8", groupColumns[groups.length])}>
          {groups.map((group, index) => (
            <GroupColumn key={group.href} group={group} id={`${id}-${index}`} />
          ))}
        </div>
      )}

      {stories.length > 0 && (
        <div className={cn("lg:border-l lg:border-border lg:pl-8", !single && "hidden xl:block")}>
          <MenuHeading id={`${id}-stories`}>{t.megaMenu.topStories}</MenuHeading>
          <ul aria-labelledby={`${id}-stories`} className="mt-3 grid gap-4">
            {stories.map((story) => (
              <li key={story.href}>
                <StoryLink story={story} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SingleGroup({ group, id, wide }: { group: NavGroup; id: string; wide: boolean }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-0">
      <div className="lg:pr-8">
        <p className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.01em] text-text-primary">
          <GroupIcon group={group} />
          {group.label}
        </p>
        {group.description && <p className="mt-3 text-sm leading-relaxed text-text-secondary">{group.description}</p>}
        <AllCoverage group={group} className="mt-5" />
        {group.articleCount > 0 && (
          <p className="mt-1.5 text-xs text-text-muted">{plural(t.common.articles, group.articleCount)}</p>
        )}
      </div>

      {group.topics.length > 0 && (
        <div className="lg:border-l lg:border-border lg:pl-8">
          <MenuHeading id={`${id}-topics`}>{t.megaMenu.topics}</MenuHeading>
          <TopicList
            group={group}
            labelledBy={`${id}-topics`}
            className={wide ? "columns-2 lg:columns-3 xl:columns-4" : "columns-2 xl:columns-3"}
          />
        </div>
      )}
    </div>
  );
}

function GroupColumn({ group, id }: { group: NavGroup; id: string }) {
  return (
    <div>
      <p id={id} className="flex items-center gap-2.5">
        <GroupIcon group={group} />
        <Link
          href={group.href}
          className="rounded-sm text-base font-semibold tracking-[-0.01em] text-text-primary transition-colors hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
        >
          {group.label}
        </Link>
      </p>
      {group.description && <p className="mt-2 text-sm leading-relaxed text-text-muted">{group.description}</p>}
      {group.topics.length > 0 && <TopicList group={group} labelledBy={id} className="columns-2" />}
      <AllCoverage group={group} className="mt-4" />
    </div>
  );
}

function TopicList({ group, labelledBy, className }: { group: NavGroup; labelledBy: string; className: string }) {
  return (
    <ul aria-labelledby={labelledBy} className={cn("mt-3 gap-x-6", className)}>
      {group.topics.map((topic, index) => (
        <li key={`${index}:${topic.href}`} className="break-inside-avoid">
          <Link
            href={topic.href}
            className="block rounded-sm py-1.5 text-sm leading-snug text-text-secondary transition-colors hover:text-text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
          >
            {topic.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function GroupIcon({ group }: { group: NavGroup }) {
  if (!group.icon) return null;
  return (
    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
      <Icon name={group.icon} className="size-[18px]" />
    </span>
  );
}

function AllCoverage({ group, className }: { group: NavGroup; className?: string }) {
  const { t } = useI18n();
  return (
    <Link
      href={group.href}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary transition-colors hover:text-text-primary outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary",
        className,
      )}
    >
      {format(t.megaMenu.allCoverage, { label: group.label })}
      <Icon
        name="arrowRight"
        className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </Link>
  );
}

function MenuHeading({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
      {children}
    </p>
  );
}

function StoryLink({ story }: { story: NavStory }) {
  const { locale, t } = useI18n();
  return (
    <Link
      href={story.href}
      className="group flex items-start gap-3 rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <span className="relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-md bg-text-primary/5">
        {story.image ? (
          <Image src={story.image.src} alt="" fill sizes="80px" className="object-cover" />
        ) : story.cover ? (
          <CoverArt cover={story.cover} compact className="size-full" />
        ) : null}
      </span>
      <span className="min-w-0">
        <span
          lang={story.locale && story.locale !== locale ? story.locale : undefined}
          className="line-clamp-2 text-sm leading-snug font-semibold text-text-primary transition-colors group-hover:text-text-primary"
        >
          {story.title}
        </span>
        <span className="mt-1 block text-xs text-text-muted">
          <time dateTime={story.date}>{formatDate(story.date, locale)}</time>
          {story.readTime ? <> · {format(t.common.minRead, { n: story.readTime })}</> : null}
        </span>
      </span>
    </Link>
  );
}
