import type { PlanModule } from "@/lib/plans";
import type { PermissionKey } from "@/lib/permissions/catalog";
import { hasPermissionForAttendancePath } from "@/lib/attendance/client-permissions";

/** Minimum view permission required for each plan module in the sidebar. */
export const MODULE_VIEW_PERMISSION: Record<PlanModule, PermissionKey> = {  dashboard: "dashboard.view",
  appointments: "appointments.view",
  "walk-in": "queue.view",
  customers: "customers.view",
  billing: "billing.view",
  services: "services.view",
  staff: "team.view",
  attendance: "attendance.view_own",
  reports: "reports.view",
  sales: "sales.view",
  inventory: "inventory.view",
  membership: "memberships.view",
  marketing: "marketing.view",
  expense: "reports.view",
  analytics: "reports.view",
  consultation: "consultation.view",
  settings: "settings.view",
  projects: "projects.view",
};

export function canViewModule(
  permissions: Set<PermissionKey>,
  module: PlanModule,
  isOwner: boolean
): boolean {
  if (isOwner) return true;
  if (module === "attendance") {
    return hasPermissionForAttendancePath(Array.from(permissions), false);
  }
  return permissions.has(MODULE_VIEW_PERMISSION[module]);
}