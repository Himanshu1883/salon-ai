"use server";

import { requireSession } from "@/lib/auth";
import { getResolvedPermissions } from "@/lib/permissions/resolve";

/** Live permission fingerprint for the signed-in user (not cached across requests). */
export async function getMyAccessSignatureAction() {
  const session = await requireSession();
  const salonId = session.user.salonId;
  if (!salonId) return "";
  if (session.user.role === "owner") return "owner";

  const resolved = await getResolvedPermissions(session.user.id, salonId);
  if (resolved.isOwner) return "owner";
  return Array.from(resolved.permissions).sort().join(",");
}
