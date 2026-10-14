"use client";

import Image from "next/image";
import Link from "@/i18n/Link";
import { CoverArt } from "@/components/blog/CoverArt";
import { Icon } from "@/components/ui/Icon";
import type { NavItem, NavStory } from "@/config/navigation";
import { useI18n } from "@/i18n/client";
import { format, plural } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

/** True when a nav item has anything to show in a mega menu. */
export function hasMegaMenu(item: NavItem) {
  return Boolean(item.topics?.length || item.stories?.length);
}

/** Mega-menu body for one category: intro, topic links and top stories. */
export function MegaMenu({ item, id }: { item: NavItem; id: string }) {
  const { t } = useI18n();
  const topics = item.topics ?? [];
  const stories = item.stories ?? [];

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:gap-0 lg:px-8">
      <div className="lg:col-span-3 lg:pr-8">
        <p className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.01em] text-text-primary">
          {item.icon && (
            <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name={item.icon} className="size-[18px]" />
            </span>
          )}
          {item.label}
        </p>
        {item.description && (
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{item.description}</p>
        )}
        <Link
          href={item.href}
          className="group mt-5 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary transition-colors hover:text-primary-hover outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
        >
          {format(t.megaMenu.allCoverage, { label: item.label })}
          <Icon
            name="arrowRight"
            className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
        {item.articleCount ? (
          <p className="mt-1.5 text-xs text-text-muted">
            {plural(t.common.articles, item.articleCount)}
          </p>
        ) : null}
      </div>

      {topics.length > 0 && (
        <div
          className={cn(
            "lg:border-l lg:border-border lg:px-8",
            stories.length > 0 ? "lg:col-span-4" : "lg:col-span-9",
          )}
        >
          <MenuHeading id={`${id}-topics`}>{t.megaMenu.topics}</MenuHeading>
          <ul
            aria-labelledby={`${id}-topics`}
            className={cn("mt-3 grid grid-cols-2 gap-x-6", stories.length === 0 && "lg:grid-cols-3")}
          >
            {topics.map((topic, index) => (
              <li key={`${index}:${topic.href}`}>
                <Link
                  href={topic.href}
                  className="block rounded-sm py-1.5 text-sm text-text-secondary transition-colors hover:text-primary outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {topic.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stories.length > 0 && (
        <div
          className={cn(
            "lg:border-l lg:border-border lg:pl-8",
            topics.length > 0 ? "lg:col-span-5" : "lg:col-span-9",
          )}
        >
          <MenuHeading id={`${id}-stories`}>{t.megaMenu.topStories}</MenuHeading>
          <ul
            aria-labelledby={`${id}-stories`}
            className={cn("mt-3 grid gap-4", topics.length === 0 && "lg:grid-cols-3 lg:gap-6")}
          >
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
      className="group flex items-start gap-3.5 rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <span className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-md bg-text-primary/5">
        {story.image ? (
          <Image src={story.image.src} alt="" fill sizes="112px" className="object-cover" />
        ) : story.cover ? (
          <CoverArt cover={story.cover} compact className="size-full" />
        ) : null}
      </span>
      <span className="min-w-0">
        <span
          lang={story.locale && story.locale !== locale ? story.locale : undefined}
          className="line-clamp-2 text-sm leading-snug font-semibold text-text-primary transition-colors group-hover:text-primary"
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
