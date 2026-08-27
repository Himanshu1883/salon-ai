import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminPageContext } from "@/lib/admin-page-context";
import { AdminUsersContent } from "./users-content";

function UsersSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-40 rounded-lg bg-stone-200" />
      <div className="h-64 rounded-2xl bg-stone-100" />
    </div>
  );
}

export default async function AdminUsersPage() {
  const { superAdmin } = await getAdminPageContext();

  if (!superAdmin) {
    redirect("/admin/support");
  }

  return (
    <Suspense fallback={<UsersSkeleton />}>
      <AdminUsersContent />
    </Suspense>
  );
}
