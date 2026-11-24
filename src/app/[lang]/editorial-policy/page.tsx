import type { Metadata } from "next";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";
import { EditableLegalPage } from "@/components/static/LegalPageLayout";

export async function generateMetadata({ params }: PageProps<"/[lang]/editorial-policy">): Promise<Metadata> {
  return fixedPageMetadata("editorial-policy", await localeFromParams(params));
}

// Content: Admin → Pages → Editorial Policy (standards, sources, review, AI use,
// corrections, guest and sponsored content, directory labels, independence).
export default function EditorialPolicyPage() {
  return <EditableLegalPage page="editorial-policy" />;
}
