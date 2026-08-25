import {
  getSalonUsersForPermissionsAction,
  getEmployeesForLoginAssignmentAction,
} from "@/actions/permissions";
import { TeamAccessClient } from "@/components/permissions/team-access-client";
import { requirePermission } from "@/lib/permissions/require";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeamAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string }>;
}) {
  await requirePermission("permissions.manage");
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const params = await searchParams;

  const [users, employees, salon] = await Promise.all([
    getSalonUsersForPermissionsAction(),
    getEmployeesForLoginAssignmentAction(),
    prisma.salon.findUnique({
      where: { id: salonId },
      select: { slug: true },
    }),
  ]);

  const salonSlug = salon?.slug ?? session.user.salonSlug ?? "";

  return (
    <TeamAccessClient
      users={users}
      employees={employees}
      salonSlug={salonSlug}
      preselectedEmployeeId={params.employee ?? null}
    />
  );
}
