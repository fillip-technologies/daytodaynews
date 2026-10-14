import type { Metadata } from "next";
import Link from "next/link";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { Newsletter } from "@/components/home/Newsletter";
import { getBlogArticles, getTopics } from "@/lib/articles";
import { parseBlogParams } from "@/lib/blog";

export const metadata: Metadata = {
  title: "DayTodayNews — Technology, AI & Software Insights",
  description:
    "Explore practical insights on AI, automation, software development, business technology and the trends shaping modern digital teams.",
};

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const [params, articles, topics] = await Promise.all([searchParams, getBlogArticles(), getTopics()]);
  const initial = parseBlogParams(params);

  return (
    <main className="flex-1">
      <div className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] overflow-hidden">
          <div className="absolute -top-40 left-[8%] h-80 w-[36rem] rounded-full bg-accent-secondary/12 blur-3xl" />
          <div className="absolute -top-32 right-[4%] h-80 w-[32rem] rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute top-24 left-[42%] h-56 w-[26rem] rounded-full bg-accent/8 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-8 sm:px-6 sm:pt-14 lg:px-8">
          <header className="max-w-3xl">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                <li>
                  <Link href="/" className="text-text-muted transition-colors hover:text-primary">
                    DayTodayNews
                  </Link>
                </li>
                <li aria-hidden="true" className="text-text-muted/60">
                  /
                </li>
                <li aria-current="page" className="text-primary">
                  Insights
                </li>
              </ol>
            </nav>
            <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-text-primary sm:text-5xl lg:text-[3.5rem]">
              Technology, ideas{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">&amp; insights.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
              Explore practical insights on AI, software development, automation, business
              technology and the technologies shaping modern teams.
            </p>
          </header>

          <div className="mt-9">
            <BlogExplorer articles={articles} topics={topics} initial={initial} />
          </div>
        </div>
      </div>

      <Newsletter />
    </main>
  );
}
