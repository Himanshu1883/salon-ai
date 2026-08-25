import { notFound } from "next/navigation";
import { getTeamMember } from "@/actions/team";
import { getServices } from "@/actions/services";
import { getEmployeeFaceStatus } from "@/actions/attendance";
import { hasPermission } from "@/lib/permissions/require";
import { parseOtherDocuments } from "@/lib/employee";
import { MemberDetailClient } from "./member-detail-client";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [member, services, faceStatus, canUpdate, canDelete] =
    await Promise.all([
      getTeamMember(id),
      getServices(),
      getEmployeeFaceStatus(id),
      hasPermission("team.update"),
      hasPermission("team.delete"),
    ]);

  if (!member) notFound();

  return (
    <MemberDetailClient
      member={{
        ...member,
        otherDocuments: parseOtherDocuments(member.otherDocuments),
      }}
      services={services.map((s) => ({ id: s.id, name: s.name }))}
      faceStatus={faceStatus}
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  );
}
