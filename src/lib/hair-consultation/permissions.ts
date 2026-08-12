type SessionUser = {
  role?: string | null;
};

export type HairConsultationPermission =
  | "create"
  | "view"
  | "manage_styles"
  | "view_analytics"
  | "delete_photos";

const ROLE_PERMISSIONS: Record<string, HairConsultationPermission[]> = {
  owner: ["create", "view", "manage_styles", "view_analytics", "delete_photos"],
  manager: ["create", "view", "manage_styles", "view_analytics", "delete_photos"],
  stylist: ["create", "view"],
  receptionist: ["create", "view"],
};

export function canHairConsultation(
  user: SessionUser,
  permission: HairConsultationPermission
): boolean {
  const role = (user.role ?? "stylist").toLowerCase();
  const perms = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.stylist;
  return perms.includes(permission);
}
