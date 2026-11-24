import type { Metadata } from "next";
import { DirectorySubmit } from "@/components/directory/DirectorySubmit";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";

type Props = PageProps<"/[lang]/business-directory/submit">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return fixedPageMetadata("business-directory-submit", await localeFromParams(params));
}

// Submissions arrive as Pending in Admin → Directory.
export default async function SubmitBusinessPage({ params }: Props) {
  return <DirectorySubmit kind="BUSINESS" locale={await localeFromParams(params)} seoPage="business-directory-submit" />;
}
