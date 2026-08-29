import { redirect } from "next/navigation";
import { getDataScopeContext } from "@/lib/permissions/data-scope";

export default async function TeamMembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const scope = await getDataScopeContext();
  if (scope.dataScope === "own" && !scope.permissions.has("team.view") && !scope.isOwner) {
    redirect("/employee/profile");
  }
  return children;
}
