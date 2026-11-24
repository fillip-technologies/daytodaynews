import { prisma } from "@/lib/prisma";
import { RedirectsManager } from "./RedirectsManager";

export const metadata = { title: "Redirects — Admin Portal" };

export default async function AdminRedirectsPage() {
  const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  return (
    <RedirectsManager
      initial={redirects.map((r) => ({
        id: r.id,
        fromPath: r.fromPath,
        toPath: r.toPath,
        note: r.note ?? "",
        hits: r.hits,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
