import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cachedRead } from "@/lib/memory-cache";
import {
  canAccessPath,
  getModuleForPath,
  getRestrictedModuleLabel,
  normalizeSalonPlan,
  type SalonPlan,
} from "@/lib/plans";

async function fetchSalonPlan(salonId: string): Promise<SalonPlan> {
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: { plan: true },
  });
  return normalizeSalonPlan(salon?.plan);
}

const getCachedSalonPlan = unstable_cache(
  async (salonId: string) => fetchSalonPlan(salonId),
  ["salon-plan"],
  { revalidate: 60, tags: ["salon-plan"] }
);

export async function getSalonPlan(salonId: string): Promise<SalonPlan> {
  return cachedRead(`salon-plan:${salonId}`, 45, () =>
    getCachedSalonPlan(salonId)
  );
}

export function checkPlan(plan: SalonPlan, pathname: string) {
  const allowed = canAccessPath(plan, pathname);
  const module = getModuleForPath(pathname);

  return {
    allowed,
    plan,
    module,
    featureName: module ? getRestrictedModuleLabel(module) : "This feature",
  };
}

export async function checkPlanForSalon(salonId: string, pathname: string) {
  const plan = await getSalonPlan(salonId);
  return checkPlan(plan, pathname);
}
