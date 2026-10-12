import { prisma } from "@/lib/prisma";
import { InboxManager } from "./InboxManager";

export const metadata = {
  title: "Inbox & Submissions — Admin Portal",
};

export default async function AdminInboxPage() {
  const [contacts, pitches, subscribers] = await Promise.all([
    prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.contributorPitch.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
    }),
  ]);

  return (
    <InboxManager
      contacts={contacts}
      pitches={pitches}
      subscribers={subscribers}
    />
  );
}
