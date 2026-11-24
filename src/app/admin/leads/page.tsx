import { getCurrentUser } from "@/lib/auth";
import { getIntegrations } from "@/lib/integrations";
import { prisma } from "@/lib/prisma";
import { LeadsManager } from "./LeadsManager";

export const metadata = { title: "Leads — Admin Portal" };

export default async function AdminLeadsPage() {
  const [leads, integrations, user] = await Promise.all([
    prisma.lead
      .findMany({ orderBy: { createdAt: "desc" }, take: 500, include: { listing: { select: { name: true, slug: true, kind: true } } } })
      .catch(() => []),
    getIntegrations(),
    getCurrentUser(),
  ]);
  return (
    <LeadsManager
      isAdmin={user?.role === "ADMIN"}
      webhookUrl={integrations.leadWebhookUrl}
      initial={leads.map((lead) => ({
        id: lead.id,
        type: lead.type,
        status: lead.status,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        phone: lead.phone,
        website: lead.website,
        interest: lead.interest,
        budget: lead.budget,
        message: lead.message,
        sourcePath: lead.sourcePath,
        listing: lead.listing ? `${lead.listing.name}` : null,
        createdAt: lead.createdAt.toISOString(),
      }))}
    />
  );
}
