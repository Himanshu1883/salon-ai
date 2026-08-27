import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ownerUserSelect } from "@/lib/user-select";
import type { SubscriptionStatus } from "@/lib/subscription";

export type SalonStatusFilter =
  | "all"
  | "trial"
  | "active"
  | "past_due"
  | "suspended";

export type SalonPlanFilter = "all" | "BASIC" | "ENTERPRISE";

async function fetchAdminStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalSalons,
    onTrial,
    activeMonthly,
    pastDueOrSuspended,
    signedUpThisMonth,
    basicPlan,
    enterprisePlan,
  ] = await Promise.all([
    prisma.salon.count(),
    prisma.salonSubscription.count({ where: { status: "trial" } }),
    prisma.salonSubscription.count({ where: { status: "active" } }),
    prisma.salonSubscription.count({
      where: { status: { in: ["past_due", "suspended"] } },
    }),
    prisma.salon.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.salon.count({ where: { plan: "BASIC" } }),
    prisma.salon.count({ where: { plan: "ENTERPRISE" } }),
  ]);

  return {
    totalSalons,
    onTrial,
    activeMonthly,
    pastDueOrSuspended,
    signedUpThisMonth,
    basicPlan,
    enterprisePlan,
  };
}

export const getCachedAdminStats = unstable_cache(
  fetchAdminStats,
  ["admin-stats"],
  { revalidate: 60, tags: ["admin-stats"] }
);

export async function queryAllSalons(options?: {
  search?: string;
  status?: SalonStatusFilter;
  plan?: SalonPlanFilter;
  page?: number;
  pageSize?: number;
}) {
  const search = options?.search?.trim() ?? "";
  const status = options?.status ?? "all";
  const plan = options?.plan ?? "all";
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options?.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  const where: {
    plan?: "BASIC" | "ENTERPRISE";
    subscription?: { status: SubscriptionStatus | { in: SubscriptionStatus[] } };
    OR?: Array<{
      name?: { contains: string };
      city?: { contains: string };
      users?: { some: { email: { contains: string } } };
    }>;
  } = {};

  if (status !== "all") {
    where.subscription = { status };
  }

  if (plan !== "all") {
    where.plan = plan;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { users: { some: { email: { contains: search } } } },
    ];
  }

  const [salons, total] = await Promise.all([
    prisma.salon.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        businessPhone: true,
        phone: true,
        businessType: true,
        plan: true,
        totalSeats: true,
        createdAt: true,
        subscription: {
          select: {
            status: true,
            trialEndsAt: true,
            currentPeriodEnd: true,
          },
        },
        users: {
          where: { role: "owner" },
          take: 1,
          select: ownerUserSelect,
        },
        _count: {
          select: { employees: true },
        },
      },
    }),
    prisma.salon.count({ where }),
  ]);

  return {
    salons: salons.map((salon) => {
      const owner = salon.users[0];
      return {
        id: salon.id,
        name: salon.name,
        slug: salon.slug,
        city: salon.city,
        phone: salon.businessPhone ?? salon.phone,
        businessType: salon.businessType,
        status: salon.subscription?.status ?? "trial",
        plan: salon.plan,
        trialEndsAt: salon.subscription?.trialEndsAt ?? null,
        currentPeriodEnd: salon.subscription?.currentPeriodEnd ?? null,
        createdAt: salon.createdAt,
        ownerName: owner?.name ?? "—",
        ownerEmail: owner?.email ?? "—",
        seatsCount: salon.totalSeats,
        staffCount: salon._count.employees,
      };
    }),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

const fetchSalonListCached = unstable_cache(
  async (cacheKey: string) => {
    const parsed = JSON.parse(cacheKey) as {
      search: string;
      status: SalonStatusFilter;
      plan: SalonPlanFilter;
      page: number;
    };
    return queryAllSalons(parsed);
  },
  ["admin-salon-list"],
  { revalidate: 30, tags: ["admin-salons"] }
);

export async function getCachedSalonList(options?: {
  search?: string;
  status?: SalonStatusFilter;
  plan?: SalonPlanFilter;
  page?: number;
}) {
  const search = options?.search?.trim() ?? "";
  const status = options?.status ?? "all";
  const plan = options?.plan ?? "all";
  const page = Math.max(1, options?.page ?? 1);

  if (search) {
    return queryAllSalons({ search, status, plan, page });
  }

  return fetchSalonListCached(
    JSON.stringify({ search: "", status, plan, page })
  );
}

async function fetchPlatformUsers() {
  const users = await prisma.user.findMany({
    where: {
      OR: [{ isSuperAdmin: true }, { platformRole: { not: null } }],
      salonId: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      platformRole: true,
      isSuperAdmin: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    platformRole:
      user.platformRole ??
      (user.isSuperAdmin ? ("SUPER_ADMIN" as const) : ("CUSTOMER_SUPPORT" as const)),
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}

export const getCachedPlatformUsers = unstable_cache(
  fetchPlatformUsers,
  ["admin-platform-users"],
  { revalidate: 60, tags: ["admin-platform-users"] }
);
