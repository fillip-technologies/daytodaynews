import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { fontVariables } from "../fonts";
import { AdminNav } from "./AdminNav";
import "../globals.css";

export const metadata = {
  title: "Admin Portal — DayTodayNews",
  robots: { index: false, follow: false },
};

// Root layout for /admin; the public site has its own under app/[lang].
function AdminDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    // Already signed in (and still an active staff member): skip the login form.
    if (await getCurrentUser()) {
      redirect("/admin");
    }
    return (
      <AdminDocument>
        <div className="min-h-screen bg-background">{children}</div>
      </AdminDocument>
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <AdminDocument>
      <div className="flex min-h-screen flex-col bg-background md:flex-row">
        <AdminNav user={user} />
        <main className="min-w-0 flex-1 bg-background">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AdminDocument>
  );
}
