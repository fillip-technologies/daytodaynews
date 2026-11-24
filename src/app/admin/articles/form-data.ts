import { prisma } from "@/lib/prisma";
import { directoryKindLabel } from "@/lib/directory-config";

// Choices the article editor needs besides the article itself.

/** Pillar guides (slug → title) and approved directory listings (slug → "Name · Business"). */
export async function getEditorChoices() {
  const [pillars, listings] = await Promise.all([
    prisma.article
      .findMany({ where: { isPillar: true }, orderBy: { title: "asc" }, select: { slug: true, title: true } })
      .catch(() => []),
    prisma.listing
      .findMany({ where: { status: "APPROVED" }, orderBy: { name: "asc" }, select: { slug: true, name: true, kind: true } })
      .catch(() => []),
  ]);
  return {
    pillars: pillars.map((p) => ({ value: p.slug, label: p.title })),
    listings: listings.map((l) => ({ value: l.slug, label: `${l.name} · ${directoryKindLabel[l.kind]}` })),
  };
}
