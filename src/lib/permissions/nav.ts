import type { PlanModule } from "@/lib/plans";
import type { PermissionKey } from "@/lib/permissions/catalog";

/** Minimum view permission required for each plan module in the sidebar. */
export const MODULE_VIEW_PERMISSION: Record<PlanModule, PermissionKey> = {
  dashboard: "dashboard.view",
  appointments: "appointments.view",
  "walk-in": "queue.view",
  customers: "customers.view",
  billing: "billing.view",
  services: "services.view",
  staff: "team.view",
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
  return permissions.has(MODULE_VIEW_PERMISSION[module]);
}
