import type { Metadata } from "next";
import { DirectorySubmit } from "@/components/directory/DirectorySubmit";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";

type Props = PageProps<"/[lang]/startup-directory/submit">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return fixedPageMetadata("startup-directory-submit", await localeFromParams(params));
}

// Submissions arrive as Pending in Admin → Directory.
export default async function SubmitStartupPage({ params }: Props) {
  return <DirectorySubmit kind="STARTUP" locale={await localeFromParams(params)} seoPage="startup-directory-submit" />;
}
