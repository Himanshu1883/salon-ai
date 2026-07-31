import { notFound } from "next/navigation";
import { getTeamMember } from "@/actions/team";
import { getServices } from "@/actions/services";
import { getEmployeeFaceStatus } from "@/actions/attendance";
import { canAccessSettings } from "@/actions/salon";
import { auth } from "@/lib/auth";
import { parseOtherDocuments } from "@/lib/employee";
import { MemberDetailClient } from "./member-detail-client";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const [member, services, faceStatus, canEdit] = await Promise.all([
    getTeamMember(id),
    getServices(),
    getEmployeeFaceStatus(id),
    session?.user?.id ? canAccessSettings(session.user.id) : false,
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
      canEdit={canEdit}
    />
  );
}
