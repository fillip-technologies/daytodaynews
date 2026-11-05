import Link from "@/i18n/Link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getI18n } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { toneStyle, type Tone } from "@/lib/tones";
import type { Article } from "@/types/article";
import { Byline, CardMedia, CardTitleLink, CategoryBadge } from "./ArticleCardParts";
import { SecondaryArticleCard } from "./SecondaryArticleCard";
import { ViewAllLink, sectionContainer } from "./SectionHeader";

type CategoryBlockProps = {
  id: string;
  title: string;
  /** The category page. */
  href: string;
  icon: IconName;
  tone: Tone;
  /** The big story first, then up to four smaller ones. */
  articles: Article[];
};

/** A category's news on the homepage: one big story and a grid of smaller ones. */
export async function CategoryBlock({ id, title, href, icon, tone, articles }: CategoryBlockProps) {
  const [lead, ...rest] = articles;
  if (!lead) return null;
  const { t } = await getI18n();

  return (
    <section aria-labelledby={id} style={toneStyle(tone)} className="py-8 sm:py-10">
      <div className={sectionContainer}>
        <header className="flex items-center justify-between gap-4 border-b-2 border-(color:--tone) pb-3">
          <h2 id={id} className="flex min-w-0 items-center gap-2.5 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-(color:--tone)/10 text-(color:--tone)"
            >
              <Icon name={icon} className="size-[18px]" />
            </span>
            <Link
              href={href}
              className="truncate rounded-sm text-text-primary transition-colors hover:text-(color:--tone) outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
            >
              {title}
            </Link>
          </h2>
          <ViewAllLink label={t.common.viewAll} href={href} />
        </header>

        <div className="mt-6 grid gap-8 lg:grid-cols-12">
          <article className={cn("group relative flex flex-col", rest.length > 0 ? "lg:col-span-6" : "lg:col-span-8")}>
            <CardMedia
              article={lead}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-video rounded-2xl"
            >
              <div className="absolute top-4 left-4">
                <CategoryBadge article={lead} />
              </div>
            </CardMedia>
            <div className="pt-5">
              <h3
                lang={lead.locale}
                className="text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance text-text-primary transition-colors group-hover:text-text-primary sm:text-[1.75rem]"
              >
                <CardTitleLink article={lead}>{lead.title}</CardTitleLink>
              </h3>
              {lead.description && (
                <p lang={lead.locale} className="mt-3 line-clamp-3 text-base leading-relaxed text-text-secondary">
                  {lead.description}
                </p>
              )}
              <div className="mt-4">
                <Byline article={lead} />
              </div>
            </div>
          </article>

          {rest.length > 0 && (
            <ul className="grid content-start gap-x-6 gap-y-8 sm:grid-cols-2 lg:col-span-6">
              {rest.map((article) => (
                <li key={article.href}>
                  <SecondaryArticleCard article={article} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
