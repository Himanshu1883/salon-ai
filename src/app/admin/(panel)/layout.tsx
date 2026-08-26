import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { resolvePlatformRole } from "@/lib/platform-permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  const platformRole = resolvePlatformRole(session?.user ?? {});

  if (!platformRole) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-dashboard-bg">
      <AdminSidebar
        userName={session!.user.name}
        platformRole={platformRole}
        supportUnreadCount={0}
      />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1800px] p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
