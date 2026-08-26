"use server";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { cachedRead } from "@/lib/memory-cache";
import {
  PermissionDeniedError,
  hasPermission,
  requirePermission,
} from "@/lib/permissions/require";
import { prisma } from "@/lib/prisma";
import { salonCacheTag } from "@/lib/salon-cache";
import {
  fetchStaffAnalytics,
  fetchStaffAnalyticsCharts,
  fetchStaffAnalyticsDetailsOnly,
  fetchStaffAnalyticsEmployees,
  fetchStaffAnalyticsOverview,
  staffAnalyticsToCsv,
} from "@/lib/analytics/staff-analytics";
import {
  resolveAnalyticsDateRange,
  type AnalyticsPeriod,
} from "@/lib/analytics/date-range";

type AuthSession = Awaited<ReturnType<typeof requirePermission>>;

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

async function resolveEmployeeScopeFromSession(
  session: AuthSession,
  requestedEmployeeId?: string
): Promise<string | null> {
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

type ResolvedStaffAnalyticsContext = {
  salonId: string;
  employeeId: string | null;
  range: ReturnType<typeof resolveAnalyticsDateRange>;
  cacheKey: string;
};

const resolveStaffAnalyticsContext = cache(
  async (
    _paramsKey: string,
    params: StaffAnalyticsSearchParams
  ): Promise<ResolvedStaffAnalyticsContext> => {
    const session = await requirePermission("team.analytics.view");
    const salonId = session.user.salonId!;
    const employeeId = await resolveEmployeeScopeFromSession(
      session,
      params.employeeId
    );
    const period = (params.period as AnalyticsPeriod) || "this_month";
    const range = resolveAnalyticsDateRange(period, params.from, params.to);
    const cacheKey = [
      employeeId ?? "all",
      period,
      params.from ?? "",
      params.to ?? "",
    ].join(":");

    return { salonId, employeeId, range, cacheKey };
  }
);

function withAnalyticsCache<T>(
  salonId: string,
  section: string,
  cacheKey: string,
  loader: () => Promise<T>
) {
  return cachedRead(
    `staff-analytics:${section}:${salonId}:${cacheKey}`,
    section === "upcoming" ? 30 : 120,
    () =>
      unstable_cache(loader, ["staff-analytics", section, salonId, cacheKey], {
        revalidate: section === "upcoming" ? 30 : 120,
        tags: [salonCacheTag(salonId, "staff-analytics")],
      })()
  );
}

function analyticsParamsKey(params: StaffAnalyticsSearchParams) {
  return JSON.stringify({
    employeeId: params.employeeId ?? "all",
    period: params.period ?? "this_month",
    from: params.from ?? "",
    to: params.to ?? "",
  });
}

const loadStaffAnalyticsOverview = cache(
  async (_paramsKey: string, params: StaffAnalyticsSearchParams) => {
    const { salonId, employeeId, range, cacheKey } =
      await resolveStaffAnalyticsContext(analyticsParamsKey(params), params);

    return withAnalyticsCache(salonId, "overview", cacheKey, () =>
      fetchStaffAnalyticsOverview({ salonId, employeeId, range })
    );
  }
);

const loadStaffAnalyticsCharts = cache(
  async (_paramsKey: string, params: StaffAnalyticsSearchParams) => {
    const { salonId, employeeId, range, cacheKey } =
      await resolveStaffAnalyticsContext(analyticsParamsKey(params), params);

    return withAnalyticsCache(salonId, "charts", cacheKey, () =>
      fetchStaffAnalyticsCharts({ salonId, employeeId, range })
    );
  }
);

const loadStaffAnalyticsDetails = cache(
  async (_paramsKey: string, params: StaffAnalyticsSearchParams) => {
    const { salonId, employeeId, range, cacheKey } =
      await resolveStaffAnalyticsContext(analyticsParamsKey(params), params);

    const [overview, charts] = await Promise.all([
      loadStaffAnalyticsOverview(analyticsParamsKey(params), params),
      loadStaffAnalyticsCharts(analyticsParamsKey(params), params),
    ]);

    return withAnalyticsCache(salonId, "details", cacheKey, () =>
      fetchStaffAnalyticsDetailsOnly(
        { salonId, employeeId, range },
        { overview, charts }
      )
    );
  }
);

export async function getStaffAnalyticsRangeLabel(
  params: StaffAnalyticsSearchParams
) {
  await requirePermission("team.analytics.view");
  const period = (params.period as AnalyticsPeriod) || "this_month";
  return resolveAnalyticsDateRange(period, params.from, params.to).label;
}

export async function getStaffAnalyticsEmployees() {
  const session = await requirePermission("team.analytics.view");
  return fetchStaffAnalyticsEmployees(session.user.salonId!);
}

export async function getStaffAnalyticsOverview(
  params: StaffAnalyticsSearchParams
) {
  return loadStaffAnalyticsOverview(analyticsParamsKey(params), params);
}

export async function getStaffAnalyticsCharts(
  params: StaffAnalyticsSearchParams
) {
  return loadStaffAnalyticsCharts(analyticsParamsKey(params), params);
}

export async function getStaffAnalyticsDetails(
  params: StaffAnalyticsSearchParams
) {
  return loadStaffAnalyticsDetails(analyticsParamsKey(params), params);
}

export async function getStaffAnalytics(params: StaffAnalyticsSearchParams) {
  const { salonId, employeeId, range, cacheKey } =
    await resolveStaffAnalyticsContext(analyticsParamsKey(params), params);

  return withAnalyticsCache(salonId, "full", cacheKey, () =>
    fetchStaffAnalytics({ salonId, employeeId, range })
  );
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
