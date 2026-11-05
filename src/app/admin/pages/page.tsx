import type { PageValues } from "@/lib/page-content";
import { pageSchemas } from "@/lib/page-defaults";
import { prisma } from "@/lib/prisma";
import { getPageContent } from "@/lib/settings";
import { PagesManager } from "./PagesManager";

export const metadata = {
  title: "Pages — Admin Portal",
};

export default async function AdminPagesPage() {
  const [contents, categories] = await Promise.all([
    Promise.all(pageSchemas.map(async (schema) => [schema.key, await getPageContent(schema.key)] as const)),
    prisma.topic.findMany({ orderBy: { label: "asc" }, select: { slug: true, label: true } }),
  ]);
  const initial: Record<string, PageValues> = Object.fromEntries(contents);
  return <PagesManager initial={initial} categories={categories} />;
}
