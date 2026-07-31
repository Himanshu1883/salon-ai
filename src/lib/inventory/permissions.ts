import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function getInventoryAccess() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const role = user?.role ?? "staff";
  const canWrite = role === "owner" || role === "manager" || role === "admin";
  return { session, role, canWrite, canRead: true };
}

export async function requireInventoryWrite() {
  const access = await getInventoryAccess();
  if (!access.canWrite) {
    throw new Error("Forbidden: inventory write access required");
  }
  return access;
}
