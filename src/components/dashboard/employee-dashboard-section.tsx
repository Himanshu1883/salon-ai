import { getEmployeeDashboard } from "@/actions/employee-dashboard";
import {
  EmployeeDashboardUi,
  EmployeeDashboardUnlinked,
} from "@/components/dashboard/employee-dashboard-ui";

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
  if (data.unlinked) {
    return <EmployeeDashboardUnlinked employeeName={data.employeeName} />;
  }
  return <EmployeeDashboardUi data={data} />;
}
