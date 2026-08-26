"use server";

import { unstable_cache } from "next/cache";
import { requireSession } from "@/lib/auth";
import {
  PermissionDeniedError,
  hasPermission,
  requirePermission,
} from "@/lib/permissions/require";
import { prisma } from "@/lib/prisma";
import { salonCacheTag } from "@/lib/salon-cache";
import {
  fetchStaffAnalytics,
  staffAnalyticsToCsv,
} from "@/lib/analytics/staff-analytics";
import {
  resolveAnalyticsDateRange,
  type AnalyticsPeriod,
} from "@/lib/analytics/date-range";

export type StaffAnalyticsSearchParams = {
  employeeId?: string;
  period?: string;
  from?: string;
  to?: string;
};

async function getSessionEmployeeId(userId: string, salonId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { employeeId: true, email: true },
  });
  if (user?.employeeId) return user.employeeId;

  if (!user?.email) return null;

  const employee = await prisma.employee.findFirst({
    where: {
      salonId,
      email: { equals: user.email, mode: "insensitive" },
    },
    select: { id: true },
  });
  return employee?.id ?? null;
}

async function resolveEmployeeScope(
  requestedEmployeeId?: string
): Promise<string | null> {
  const session = await requirePermission("team.analytics.view");
  const salonId = session.user.salonId!;

  if (session.user.role === "owner") {
    return requestedEmployeeId && requestedEmployeeId !== "all"
      ? requestedEmployeeId
      : null;
  }

  const [canViewAll, canViewOwn, ownEmployeeId] = await Promise.all([
    hasPermission("team.analytics.view_all"),
    hasPermission("team.analytics.view_own"),
    getSessionEmployeeId(session.user.id, salonId),
  ]);

  if (canViewAll) {
    if (requestedEmployeeId && requestedEmployeeId !== "all") {
      const employee = await prisma.employee.findFirst({
        where: {
          id: requestedEmployeeId,
          salonId,
        },
        select: { id: true },
      });
      if (!employee) {
        throw new PermissionDeniedError("team.analytics.view");
      }
    }
    return requestedEmployeeId && requestedEmployeeId !== "all"
      ? requestedEmployeeId
      : null;
  }

  if (canViewOwn && ownEmployeeId) {
    if (
      requestedEmployeeId &&
      requestedEmployeeId !== "all" &&
      requestedEmployeeId !== ownEmployeeId
    ) {
      throw new PermissionDeniedError("team.analytics.view");
    }
    return ownEmployeeId;
  }

  throw new PermissionDeniedError("team.analytics.view");
}

export async function getStaffAnalytics(params: StaffAnalyticsSearchParams) {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const employeeId = await resolveEmployeeScope(params.employeeId);
  const period = (params.period as AnalyticsPeriod) || "this_month";
  const range = resolveAnalyticsDateRange(
    period,
    params.from,
    params.to
  );
  const cacheKey = [
    employeeId ?? "all",
    period,
    params.from ?? "",
    params.to ?? "",
  ].join(":");

  return unstable_cache(
    () => fetchStaffAnalytics({ salonId, employeeId, range }),
    ["staff-analytics", salonId, cacheKey],
    {
      revalidate: 120,
      tags: [salonCacheTag(salonId, "staff-analytics")],
    }
  )();
}

export async function exportStaffAnalyticsCsv(
  params: StaffAnalyticsSearchParams
) {
  await requirePermission("team.analytics.view");
  const data = await getStaffAnalytics(params);
  return staffAnalyticsToCsv(data);
}

export async function canAccessStaffAnalytics() {
  try {
    await requirePermission("team.analytics.view");
    return true;
  } catch {
    return false;
  }
}
