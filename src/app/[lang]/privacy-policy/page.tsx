import type { Metadata } from "next";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";
import { EditableLegalPage } from "@/components/static/LegalPageLayout";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy-policy">): Promise<Metadata> {
  return fixedPageMetadata("privacy-policy", await localeFromParams(params));
}

// Content: Admin → Pages → Privacy Policy.
export default function PrivacyPolicyPage() {
  return <EditableLegalPage page="privacy-policy" />;
}
