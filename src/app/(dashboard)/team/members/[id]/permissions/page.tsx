import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getUserPermissionDetailsAction } from "@/actions/permissions";
import { getResolvedPermissions } from "@/lib/permissions/resolve";
import { findLoginUserForEmployee } from "@/lib/employee-login-link";
import { EmployeePermissionsEditor } from "@/components/permissions/employee-permissions-editor";
import { prisma } from "@/lib/prisma";

export default async function MemberPermissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const employee = await prisma.employee.findFirst({
    where: { id, salonId },
    select: { id: true, name: true, email: true },
  });

  if (!employee) {
    notFound();
  }

  const loginUser = await findLoginUserForEmployee(salonId, employee);

  if (!loginUser) {
    return (
      <div className="space-y-4">
        <Link
          href={`/team/members/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-dashboard-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to member
        </Link>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-900">
          {employee.name} does not have a login account yet. Create one from{" "}
          <Link
            href={`/team/access?employee=${employee.id}`}
            className="font-semibold underline"
          >
            Team Access
          </Link>{" "}
          and select this team member.
        </div>
      </div>
    );
  }

  const actor = await getResolvedPermissions(session.user.id, salonId);
  const canEdit =
    actor.isOwner || actor.permissions.has("permissions.manage");

  if (!canEdit && !actor.permissions.has("roles.view")) {
    notFound();
  }

  const details = await getUserPermissionDetailsAction(loginUser.id);
  if ("error" in details) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/team/members/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-dashboard-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to member
      </Link>

      <EmployeePermissionsEditor
        userId={loginUser.id}
        userName={loginUser.name}
        initialRoleKey={details.roleKey}
        initialModules={details.modules}
        canEdit={canEdit}
      />
    </div>
  );
}
