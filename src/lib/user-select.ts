/** User fields safe to query before RBAC migration (no salonRoleId). */
export const ownerUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
} as const;

export const basicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  salonId: true,
} as const;
