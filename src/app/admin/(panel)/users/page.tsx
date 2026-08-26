import { listPlatformUsers } from "@/actions/platform-users";
import { UsersListClient } from "./users-list-client";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { isSuperAdminRole, resolvePlatformRole } from "@/lib/platform-permissions";

export default async function AdminUsersPage() {
  const session = await getAuthSession();
  const platformRole = resolvePlatformRole(session?.user ?? {});

  if (!isSuperAdminRole({ platformRole, isSuperAdmin: session?.user?.isSuperAdmin })) {
    redirect("/admin/support");
  }

  const result = await listPlatformUsers();

  if ("error" in result) {
    redirect("/admin/login");
  }

  return <UsersListClient users={result.users} />;
}
