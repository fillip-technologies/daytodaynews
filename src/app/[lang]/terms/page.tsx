import type { Metadata } from "next";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";
import { EditableLegalPage } from "@/components/static/LegalPageLayout";

export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  return fixedPageMetadata("terms", await localeFromParams(params));
}

// Content: Admin → Pages → Terms & Conditions.
export default function TermsPage() {
  return <EditableLegalPage page="terms" />;
}
