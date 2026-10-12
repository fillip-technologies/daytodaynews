import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserManager } from "./UserManager";

export const metadata = {
  title: "User Management — Admin Portal",
};

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      bio: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { articles: true },
      },
    },
  });

  return (
    <UserManager
      initialUsers={users}
      currentUserId={currentUser?.id || ""}
    />
  );
}
