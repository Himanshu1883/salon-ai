import { getTeamMembers } from "@/actions/team";
import { getServiceOptions } from "@/actions/services";
import { TeamMembersClient } from "./team-members-client";

export default async function TeamMembersPage() {
  const [members, services] = await Promise.all([
    getTeamMembers(),
    getServiceOptions(),
  ]);

  return (
    <TeamMembersClient
      members={members}
      services={services}
    />
  );
}
