import {
  ALL_PERMISSION_KEYS,
  type PermissionKey,
} from "@/lib/permissions/catalog";

export type SystemRoleKey = "OWNER" | "MANAGER" | "RECEPTIONIST" | "EMPLOYEE";

export const SYSTEM_ROLE_DEFINITIONS: Record<
  SystemRoleKey,
  { name: string; description: string; hierarchyLevel: number }
> = {
  OWNER: {
    name: "Owner",
    description: "Full salon access",
    hierarchyLevel: 100,
  },
  MANAGER: {
    name: "Manager",
    description: "Operational management access",
    hierarchyLevel: 80,
  },
  RECEPTIONIST: {
    name: "Receptionist",
    description: "Front desk operations",
    hierarchyLevel: 50,
  },
  EMPLOYEE: {
    name: "Employee",
    description: "Limited staff access",
    hierarchyLevel: 20,
  },
};

/** Maps legacy User.role string to system role key. */
export function mapLegacyUserRoleToSystemKey(role: string): SystemRoleKey {
  switch (role) {
    case "owner":
      return "OWNER";
    case "manager":
      return "MANAGER";
    case "receptionist":
      return "RECEPTIONIST";
    default:
      return "EMPLOYEE";
  }
}

const MANAGER_PERMISSIONS: PermissionKey[] = ALL_PERMISSION_KEYS.filter(
  (key) =>
    !key.startsWith("subscription.manage") &&
    !key.startsWith("roles.manage") &&
    !key.startsWith("permissions.manage")
);

const RECEPTIONIST_PERMISSIONS: PermissionKey[] = [
  "dashboard.view",
  "appointments.view",
  "appointments.create",
  "appointments.update",
  "queue.view",
  "queue.create",
  "queue.update",
  "customers.view",
  "customers.create",
  "customers.update",
  "billing.view",
  "billing.create",
  "sales.view",
  "sales.create",
  "services.view",
  "packages.view",
  "addons.view",
  "memberships.view",
  "support.view",
  "attendance.view",
];

const EMPLOYEE_PERMISSIONS: PermissionKey[] = [
  "dashboard.view",
  "appointments.view",
  "queue.view",
  "customers.view",
  "services.view",
  "packages.view",
  "addons.view",
  "attendance.view",
];

export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRoleKey, PermissionKey[]> = {
  OWNER: [...ALL_PERMISSION_KEYS],
  MANAGER: MANAGER_PERMISSIONS,
  RECEPTIONIST: RECEPTIONIST_PERMISSIONS,
  EMPLOYEE: EMPLOYEE_PERMISSIONS,
};

export function getDefaultPermissionsForSystemRole(
  roleKey: SystemRoleKey
): PermissionKey[] {
  return DEFAULT_ROLE_PERMISSIONS[roleKey];
}
