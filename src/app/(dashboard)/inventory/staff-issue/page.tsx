import {
  getStaffIssues,
  getEmployeesForIssue,
} from "@/actions/inventory/staff-issue";
import { getProductsForSelect } from "@/actions/inventory/purchase-orders";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { StaffIssueClient } from "@/components/inventory/staff-issue-client";

export default async function StaffIssuePage() {
  const [issues, employees, products, access] = await Promise.all([
    getStaffIssues(),
    getEmployeesForIssue(),
    getProductsForSelect(),
    getInventoryAccess(),
  ]);
  return (
    <StaffIssueClient
      issues={issues}
      employees={employees}
      products={products}
      canWrite={access.canWrite}
    />
  );
}
