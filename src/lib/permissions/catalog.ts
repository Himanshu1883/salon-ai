export type PermissionDefinition = {
  key: string;
  name: string;
  description?: string;
  module: string;
  action: string;
};

export const PERMISSION_DEFINITIONS = [
  { key: "dashboard.view", name: "View dashboard", module: "dashboard", action: "view" },
  { key: "appointments.view", name: "View appointments", module: "appointments", action: "view" },
  { key: "appointments.create", name: "Create appointments", module: "appointments", action: "create" },
  { key: "appointments.update", name: "Update appointments", module: "appointments", action: "update" },
  { key: "appointments.delete", name: "Delete appointments", module: "appointments", action: "delete" },
  { key: "queue.view", name: "View walk-in queue", module: "queue", action: "view" },
  { key: "queue.create", name: "Check in customers", module: "queue", action: "create" },
  { key: "queue.update", name: "Update queue", module: "queue", action: "update" },
  { key: "queue.delete", name: "Remove queue entries", module: "queue", action: "delete" },
  { key: "customers.view", name: "View customers", module: "customers", action: "view" },
  { key: "customers.create", name: "Create customers", module: "customers", action: "create" },
  { key: "customers.update", name: "Update customers", module: "customers", action: "update" },
  { key: "customers.delete", name: "Delete customers", module: "customers", action: "delete" },
  { key: "billing.view", name: "View billing", module: "billing", action: "view" },
  { key: "billing.create", name: "Create invoices", module: "billing", action: "create" },
  { key: "billing.update", name: "Update invoices", module: "billing", action: "update" },
  { key: "billing.delete", name: "Delete invoices", module: "billing", action: "delete" },
  { key: "billing.refund", name: "Process refunds", module: "billing", action: "refund" },
  { key: "sales.view", name: "View sales", module: "sales", action: "view" },
  { key: "sales.create", name: "Record sales", module: "sales", action: "create" },
  { key: "sales.update", name: "Update sales", module: "sales", action: "update" },
  { key: "sales.delete", name: "Delete sales", module: "sales", action: "delete" },
  { key: "services.view", name: "View services", module: "services", action: "view" },
  { key: "services.create", name: "Create services", module: "services", action: "create" },
  { key: "services.update", name: "Update services", module: "services", action: "update" },
  { key: "services.delete", name: "Delete services", module: "services", action: "delete" },
  { key: "services.import", name: "Import service menu", module: "services", action: "import" },
  { key: "packages.view", name: "View packages", module: "packages", action: "view" },
  { key: "packages.create", name: "Create packages", module: "packages", action: "create" },
  { key: "packages.update", name: "Update packages", module: "packages", action: "update" },
  { key: "packages.delete", name: "Delete packages", module: "packages", action: "delete" },
  { key: "addons.view", name: "View add-ons", module: "addons", action: "view" },
  { key: "addons.create", name: "Create add-ons", module: "addons", action: "create" },
  { key: "addons.update", name: "Update add-ons", module: "addons", action: "update" },
  { key: "addons.delete", name: "Delete add-ons", module: "addons", action: "delete" },
  { key: "inventory.view", name: "View inventory", module: "inventory", action: "view" },
  { key: "inventory.create", name: "Create inventory records", module: "inventory", action: "create" },
  { key: "inventory.update", name: "Update inventory", module: "inventory", action: "update" },
  { key: "inventory.delete", name: "Delete inventory records", module: "inventory", action: "delete" },
  { key: "inventory.adjust", name: "Adjust stock levels", module: "inventory", action: "adjust" },
  { key: "team.view", name: "View team", module: "team", action: "view" },
  { key: "team.create", name: "Add team members", module: "team", action: "create" },
  { key: "team.update", name: "Update team members", module: "team", action: "update" },
  { key: "team.delete", name: "Remove team members", module: "team", action: "delete" },
  { key: "team.analytics.view", name: "View staff analytics", module: "team", action: "analytics" },
  { key: "team.analytics.view_all", name: "View all staff analytics", module: "team", action: "analytics_all" },
  { key: "team.analytics.view_own", name: "View own staff analytics", module: "team", action: "analytics_own" },
  { key: "attendance.view", name: "View all attendance", module: "attendance", action: "view" },
  { key: "attendance.view_own", name: "View own attendance", module: "attendance", action: "view_own" },
  { key: "attendance.check_in", name: "Check in", module: "attendance", action: "check_in" },
  { key: "attendance.check_out", name: "Check out", module: "attendance", action: "check_out" },
  { key: "attendance.manage", name: "Manage attendance", module: "attendance", action: "manage" },
  { key: "attendance.export", name: "Export attendance", module: "attendance", action: "export" },
  { key: "attendance.reports", name: "View attendance reports", module: "attendance", action: "reports" },
  { key: "reports.view", name: "View reports", module: "reports", action: "view" },
  { key: "memberships.view", name: "View memberships", module: "memberships", action: "view" },
  { key: "memberships.create", name: "Sell memberships", module: "memberships", action: "create" },
  { key: "memberships.update", name: "Update memberships", module: "memberships", action: "update" },
  { key: "memberships.delete", name: "Cancel memberships", module: "memberships", action: "delete" },
  { key: "marketing.view", name: "View marketing", module: "marketing", action: "view" },
  { key: "marketing.update", name: "Manage marketing", module: "marketing", action: "update" },
  { key: "settings.view", name: "View settings", module: "settings", action: "view" },
  { key: "settings.update", name: "Update settings", module: "settings", action: "update" },
  { key: "subscription.view", name: "View subscription", module: "subscription", action: "view" },
  { key: "subscription.manage", name: "Manage subscription", module: "subscription", action: "manage" },
  { key: "roles.view", name: "View roles", module: "roles", action: "view" },
  { key: "roles.manage", name: "Manage roles", module: "roles", action: "manage" },
  { key: "permissions.manage", name: "Manage employee permissions", module: "roles", action: "permissions" },
  { key: "support.view", name: "View support", module: "support", action: "view" },
  { key: "consultation.view", name: "View AI hair consultation", module: "consultation", action: "view" },
  { key: "consultation.manage", name: "Manage consultations", module: "consultation", action: "manage" },
  { key: "projects.view", name: "View projects", module: "projects", action: "view" },
] as const satisfies readonly PermissionDefinition[];

export type PermissionKey = (typeof PERMISSION_DEFINITIONS)[number]["key"];

export const ALL_PERMISSION_KEYS = PERMISSION_DEFINITIONS.map((p) => p.key);

export const PERMISSION_MODULES = [
  "dashboard",
  "appointments",
  "queue",
  "customers",
  "billing",
  "sales",
  "services",
  "packages",
  "addons",
  "inventory",
  "team",
  "attendance",
  "reports",
  "memberships",
  "marketing",
  "settings",
  "subscription",
  "roles",
  "support",
  "consultation",
  "projects",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export function getPermissionsByModule(): Record<
  PermissionModule,
  PermissionDefinition[]
> {
  const grouped = {} as Record<PermissionModule, PermissionDefinition[]>;
  for (const module of PERMISSION_MODULES) {
    grouped[module] = [];
  }
  for (const def of PERMISSION_DEFINITIONS) {
    const mod = def.module as PermissionModule;
    if (grouped[mod]) grouped[mod].push(def);
  }
  return grouped;
}

export function getModuleLabel(module: PermissionModule): string {
  const labels: Record<PermissionModule, string> = {
    dashboard: "Dashboard",
    appointments: "Appointments",
    queue: "Walk-ins & Queue",
    customers: "Customers",
    billing: "Billing",
    sales: "Sales",
    services: "Services",
    packages: "Packages",
    addons: "Add-ons",
    inventory: "Inventory",
    team: "Team",
    attendance: "Attendance",
    reports: "Reports & Analytics",
    memberships: "Memberships",
    marketing: "Marketing",
    settings: "Settings",
    subscription: "Subscription",
    roles: "Roles & Permissions",
    support: "Support",
    consultation: "AI Hair Consultation",
    projects: "Projects",
  };
  return labels[module];
}
