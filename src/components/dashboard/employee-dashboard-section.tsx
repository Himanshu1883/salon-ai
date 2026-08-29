import { getEmployeeDashboard } from "@/actions/employee-dashboard";
import { EmployeeDashboardUi } from "@/components/dashboard/employee-dashboard-ui";

export async function EmployeeDashboardSection({
  period,
  from,
  to,
}: {
  period?: string;
  from?: string;
  to?: string;
}) {
  const data = await getEmployeeDashboard({ period, from, to });
  return <EmployeeDashboardUi data={data} />;
}
