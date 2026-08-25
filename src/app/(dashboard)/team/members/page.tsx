import { getTeamMembers } from "@/actions/team";
import { getServiceOptions } from "@/actions/services";
import { hasPermission } from "@/lib/permissions/require";
import { requireSession } from "@/lib/auth";
import { getEmployeeLoginMap } from "@/lib/employee-login-link";
import { TeamMembersClient } from "./team-members-client";

export default async function TeamMembersPage() {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const [
    members,
    services,
    canCreate,
    canUpdate,
    canDelete,
    canManageAccess,
    loginMap,
  ] = await Promise.all([
    getTeamMembers(),
    getServiceOptions(),
    hasPermission("team.create"),
    hasPermission("team.update"),
    hasPermission("team.delete"),
    hasPermission("permissions.manage"),
    getEmployeeLoginMap(salonId),
  ]);

  const loginByEmployeeId = Object.fromEntries(loginMap.entries());

  return (
    <TeamMembersClient
      members={members}
      services={services}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
      canManageAccess={canManageAccess}
      loginByEmployeeId={loginByEmployeeId}
    />
  );
}
