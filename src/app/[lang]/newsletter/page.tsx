import type { Metadata } from "next";
import { Newsletter } from "@/components/home/Newsletter";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { getI18n } from "@/i18n/server";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/newsletter">): Promise<Metadata> {
  return fixedPageMetadata("newsletter", await localeFromParams(params));
}

// Target of every Subscribe button in the header, menu and footer.
export default async function NewsletterPage() {
  const { t } = await getI18n();
  return (
    <main className="flex-1">
      <StaticPageHero
        eyebrow={t.newsletter.pageEyebrow}
        title={
          <>
            {t.newsletter.pageHeading}{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">{t.newsletter.pageHeadingHighlight}</span>
          </>
        }
        description={t.newsletter.pageIntro}
      />
      <Newsletter />
    </main>
  );
}
