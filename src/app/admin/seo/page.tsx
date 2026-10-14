import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seoPages } from "@/lib/seo/pages";
import { getSiteSeo } from "@/lib/seo/site";
import { toSeoFields } from "@/lib/seo/validate";
import { SeoManager } from "./SeoManager";

export const metadata = {
  title: "SEO — Admin Portal",
};

// Site-wide and fixed-page SEO: admins only. Editors manage the SEO of their
// articles and categories from those forms instead.
export default async function AdminSeoPage() {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") {
    redirect("/admin");
  }

  const [site, rows] = await Promise.all([
    getSiteSeo(),
    prisma.seoMeta.findMany({ where: { pageKey: { not: null } } }),
  ]);

  const pages = seoPages.map((page) => ({
    key: page.key,
    path: page.path,
    label: page.label,
    translated: page.translated,
    defaults: page.defaults,
    seo: {
      en: toSeoFields(rows.find((r) => r.pageKey === page.key && r.locale === "en")),
      hi: toSeoFields(rows.find((r) => r.pageKey === page.key && r.locale === "hi")),
    },
  }));

  return <SeoManager initialSite={site} pages={pages} />;
}
