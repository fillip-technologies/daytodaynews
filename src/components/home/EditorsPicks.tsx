import { ArticleCard } from "@/components/blog/ArticleCard";
import { getI18n } from "@/i18n/server";
import type { Article } from "@/types/article";
import { SectionHeader, sectionContainer } from "./SectionHeader";

export async function EditorsPicks({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;
  const { t } = await getI18n();

  return (
    <section aria-labelledby="editors-picks-title" className="py-10 sm:py-14">
      <div className={sectionContainer}>
        <SectionHeader
          id="editors-picks-title"
          title={t.home.editorsPicksTitle}
          description={t.home.editorsPicksDescription}
          action={{ label: t.common.viewAll, href: "/editors-picks" }}
        />

        {/* Swipeable on phones, 2×2 on tablet, one row of four on desktop. */}
        <ul className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-1 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
          {articles.map((article) => (
            <li key={article.href} className="w-[82%] max-w-sm shrink-0 snap-start sm:w-auto sm:max-w-none">
              <ArticleCard article={article} imageAspect="classic" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
