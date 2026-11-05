import type { Metadata } from "next";
import { fixedPageMetadata, localeFromParams } from "@/lib/seo/page-metadata";
import { EditableLegalPage } from "@/components/static/LegalPageLayout";

export async function generateMetadata({ params }: PageProps<"/[lang]/disclaimer">): Promise<Metadata> {
  return fixedPageMetadata("disclaimer", await localeFromParams(params));
}

// Content: Admin → Pages → Disclaimer.
export default function DisclaimerPage() {
  return <EditableLegalPage page="disclaimer" />;
}
