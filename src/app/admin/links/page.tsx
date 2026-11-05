import { prisma } from "@/lib/prisma";
import { getSiteLinks } from "@/lib/settings";
import { LinksManager } from "./LinksManager";

export const metadata = {
  title: "Links & Footer — Admin Portal",
};

export default async function AdminLinksPage() {
  const [links, categories] = await Promise.all([
    getSiteLinks(),
    prisma.topic.findMany({ orderBy: { label: "asc" }, select: { slug: true, label: true } }),
  ]);
  return <LinksManager initial={links} categories={categories} />;
}
