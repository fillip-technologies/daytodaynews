import type { Metadata } from "next";
import { DirectorySubmit } from "@/components/directory/DirectorySubmit";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";

type Props = PageProps<"/[lang]/software-directory/submit">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return fixedPageMetadata("software-directory-submit", await localeFromParams(params));
}

// Submissions arrive as Pending in Admin → Directory.
export default async function SubmitSoftwarePage({ params }: Props) {
  return <DirectorySubmit kind="SOFTWARE" locale={await localeFromParams(params)} seoPage="software-directory-submit" />;
}
