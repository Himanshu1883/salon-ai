import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminSupportUnreadCount } from "@/actions/support-chat";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect("/admin/login");
  }

  const supportUnreadCount = await getAdminSupportUnreadCount();

  return (
    <div className="flex min-h-screen bg-dashboard-bg">
      <AdminSidebar
        userName={session.user.name}
        supportUnreadCount={supportUnreadCount}
      />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
