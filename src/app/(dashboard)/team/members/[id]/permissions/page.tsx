import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { getUserPermissionDetailsAction } from "@/actions/permissions";
import { getResolvedPermissions } from "@/lib/permissions/resolve";
import { EmployeePermissionsEditor } from "@/components/permissions/employee-permissions-editor";

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

  const loginUser = employee.email
    ? await prisma.user.findFirst({
        where: {
          salonId,
          email: employee.email.toLowerCase(),
        },
        select: { id: true, name: true, email: true },
      })
    : null;

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
          {employee.name} does not have a linked login account yet. Add an email
          on the team member profile that matches their login email, or manage
          access from{" "}
          <Link href="/team/access" className="font-semibold underline">
            Team Access
          </Link>
          .
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
