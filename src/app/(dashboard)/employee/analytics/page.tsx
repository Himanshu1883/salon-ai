import { redirect } from "next/navigation";
import { getDataScopeContext } from "@/lib/permissions/data-scope";

export default async function EmployeeAnalyticsPage() {
  const scope = await getDataScopeContext();
  if (scope.employeeId) {
    redirect(`/team/analytics?employeeId=${scope.employeeId}&period=this_month`);
  }
  redirect("/team/analytics");
}
