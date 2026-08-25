import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getUserPermissionDetailsAction } from "@/actions/permissions";
import { getResolvedPermissions } from "@/lib/permissions/resolve";
import { EmployeePermissionsEditor } from "@/components/permissions/employee-permissions-editor";
import { prisma } from "@/lib/prisma";

export default async function TeamAccessUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const loginUser = await prisma.user.findFirst({
    where: { id, salonId },
    select: { id: true, name: true },
  });

  if (!loginUser) notFound();

  const actor = await getResolvedPermissions(session.user.id, salonId);
  const canEdit =
    actor.isOwner || actor.permissions.has("permissions.manage");

  if (!canEdit) notFound();

  const details = await getUserPermissionDetailsAction(loginUser.id);
  if ("error" in details) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/team/access"
        className="inline-flex items-center gap-2 text-sm font-medium text-dashboard-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to team access
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
