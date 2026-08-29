"use server";

import { fetchEmployeeDashboardData } from "@/lib/dashboard/employee-page-data";

export async function getEmployeeDashboard(params: {
  period?: string;
  from?: string;
  to?: string;
}) {
  return fetchEmployeeDashboardData(params);
}
