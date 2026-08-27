import { redirect } from "next/navigation";
import { getAdminPageContext } from "@/lib/admin-page-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { platformRole, userName } = await getAdminPageContext();

  if (!platformRole) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-dashboard-bg">
      <AdminSidebar
        userName={userName}
        platformRole={platformRole}
        supportUnreadCount={0}
      />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1800px] p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
