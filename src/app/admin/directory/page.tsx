import { prisma } from "@/lib/prisma";
import { DirectoryManager } from "./DirectoryManager";

export const metadata = { title: "Directory — Admin Portal" };

export default async function AdminDirectoryPage() {
  const [listings, leadCounts] = await Promise.all([
    prisma.listing.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] }).catch(() => []),
    prisma.lead
      .groupBy({ by: ["listingId"], where: { listingId: { not: null } }, _count: { _all: true } })
      .catch(() => []),
  ]);
  const leadsBy = new Map(leadCounts.map((row) => [row.listingId, row._count._all]));
  return (
    <DirectoryManager
      initial={listings.map((l) => ({
        ...l,
        foundedYear: l.foundedYear,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
        approvedAt: l.approvedAt ? l.approvedAt.toISOString() : null,
        leads: leadsBy.get(l.id) ?? 0,
      }))}
    />
  );
}
