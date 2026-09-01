import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { matchingCategoryIds } from "./check-in-service-filters";

export const CHECK_IN_SERVICE_PAGE_SIZE = 12;
export const CHECK_IN_POPULAR_LIMIT = 6;
export const CHECK_IN_PRESET_CATEGORIES = [
  "All",
  "Hair",
  "Styling",
  "Color",
  "Facial",
  "Nails",
  "Spa",
  "Packages",
] as const;

export type CheckInServiceDurationFilter = "any" | "quick" | "standard" | "long";

export type CheckInServiceListItem = {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
  popular: boolean;
};

export type CheckInServiceCategoryOption = {
  id: string;
  name: string;
};

export type CheckInServicesQuery = {
  page: number;
  pageSize: number;
  q: string;
  category: string;
  categoryId: string;
  duration: CheckInServiceDurationFilter;
  ids: string[];
};

export type CheckInServicesPayload = {
  services: CheckInServiceListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  categories: CheckInServiceCategoryOption[];
};

const DURATION_FILTERS = new Set<CheckInServiceDurationFilter>([
  "any",
  "quick",
  "standard",
  "long",
]);

export const CHECK_IN_CATALOG_WHERE = {
  status: { not: "ARCHIVED" },
  catalogType: { in: ["SERVICE", "PACKAGE"] },
} as const;

export function parseCheckInServicesQuery(
  searchParams: URLSearchParams
): CheckInServicesQuery {
  const page = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));
  const requestedSize = Math.floor(
    Number(searchParams.get("pageSize")) || CHECK_IN_SERVICE_PAGE_SIZE
  );
  const pageSize = Math.min(48, Math.max(6, requestedSize));
  const durationRaw = (searchParams.get("duration") ?? "any").toLowerCase();
  const duration = DURATION_FILTERS.has(durationRaw as CheckInServiceDurationFilter)
    ? (durationRaw as CheckInServiceDurationFilter)
    : "any";

  return {
    page,
    pageSize,
    q: (searchParams.get("q") ?? "").trim(),
    category: (searchParams.get("category") ?? "All").trim() || "All",
    categoryId: (searchParams.get("categoryId") ?? "").trim(),
    duration,
    ids: (searchParams.get("ids") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  };
}

export function durationWhere(
  duration: CheckInServiceDurationFilter
): Prisma.ServiceWhereInput | undefined {
  if (duration === "quick") return { duration: { lte: 30 } };
  if (duration === "standard") return { duration: { gte: 31, lte: 90 } };
  if (duration === "long") return { duration: { gte: 91 } };
  return undefined;
}

export function searchWhere(q: string): Prisma.ServiceWhereInput | undefined {
  if (!q) return undefined;
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ],
  };
}

function mapService(row: {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: { name: string } | null;
  popularIds: Set<string>;
}): CheckInServiceListItem {
  return {
    id: row.id,
    name: row.name,
    duration: row.duration,
    price: row.price,
    category: row.category?.name ?? "Uncategorized",
    popular: row.popularIds.has(row.id),
  };
}

async function popularServiceIds(salonId: string): Promise<string[]> {
  const rows = await prisma.service.findMany({
    where: { salonId, ...CHECK_IN_CATALOG_WHERE },
    select: { id: true },
    orderBy: { price: "desc" },
    take: CHECK_IN_POPULAR_LIMIT,
  });
  return rows.map((row) => row.id);
}

export async function fetchCheckInServicesByIds(
  salonId: string,
  ids: string[]
): Promise<CheckInServiceListItem[]> {
  if (ids.length === 0) return [];
  const [rows, popularIds] = await Promise.all([
    prisma.service.findMany({
      where: {
        salonId,
        id: { in: ids },
        ...CHECK_IN_CATALOG_WHERE,
      },
      select: {
        id: true,
        name: true,
        duration: true,
        price: true,
        category: { select: { name: true } },
      },
    }),
    popularServiceIds(salonId),
  ]);
  const popular = new Set(popularIds);
  const order = new Map(ids.map((id, index) => [id, index]));
  return rows
    .map((row) => mapService({ ...row, popularIds: popular }))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function fetchCheckInServicesPage(
  salonId: string,
  query: CheckInServicesQuery
): Promise<CheckInServicesPayload> {
  if (query.ids.length > 0) {
    const services = await fetchCheckInServicesByIds(salonId, query.ids);
    return {
      services,
      total: services.length,
      page: 1,
      pageSize: Math.max(services.length, 1),
      pageCount: 1,
      categories: [],
    };
  }

  const [popularIds, categories] = await Promise.all([
    popularServiceIds(salonId),
    prisma.serviceCategory.findMany({
      where: {
        salonId,
        services: { some: { ...CHECK_IN_CATALOG_WHERE } },
      },
      select: { id: true, name: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  const filters: Prisma.ServiceWhereInput[] = [
    { salonId },
    CHECK_IN_CATALOG_WHERE,
  ];
  const search = searchWhere(query.q);
  if (search) filters.push(search);
  const duration = durationWhere(query.duration);
  if (duration) filters.push(duration);

  if (query.categoryId) {
    filters.push({ categoryId: query.categoryId });
  } else if (query.category === "Popular") {
    if (popularIds.length === 0) {
      return {
        services: [],
        total: 0,
        page: 1,
        pageSize: query.pageSize,
        pageCount: 1,
        categories,
      };
    }
    filters.push({ id: { in: popularIds } });
  } else if (query.category && query.category !== "All") {
    const relatedIds = matchingCategoryIds(categories, query.category);
    if (relatedIds.length > 0) {
      filters.push({ categoryId: { in: relatedIds } });
    } else {
      filters.push({
        OR: [
          { category: { name: { contains: query.category, mode: "insensitive" } } },
          { name: { contains: query.category, mode: "insensitive" } },
        ],
      });
    }
  }

  const where: Prisma.ServiceWhereInput = { AND: filters };
  const total = await prisma.service.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, pageCount);
  const orderBy: Prisma.ServiceOrderByWithRelationInput[] =
    query.category === "Popular"
      ? [{ price: "desc" }, { name: "asc" }]
      : [{ name: "asc" }];

  const rows = await prisma.service.findMany({
    where,
    select: {
      id: true,
      name: true,
      duration: true,
      price: true,
      category: { select: { name: true } },
    },
    orderBy,
    skip: (page - 1) * query.pageSize,
    take: query.pageSize,
  });

  const popular = new Set(popularIds);

  return {
    services: rows.map((row) => mapService({ ...row, popularIds: popular })),
    total,
    page,
    pageSize: query.pageSize,
    pageCount,
    categories,
  };
}
