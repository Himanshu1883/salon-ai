"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { upsertCustomer, linkInvoiceToCustomer } from "@/lib/customers";
import { customerSchema } from "@/lib/validations";
import { revalidateSalonCache, cachedBySalon } from "@/lib/salon-cache";

function invalidateCustomersCache(salonId: string) {
  revalidateSalonCache(
    salonId,
    "customers",
    "dashboard-kpis",
    "dashboard-widgets",
    "dashboard-stats"
  );
}

function buildCustomerSearchConditions(query: string) {
  const q = query.trim();
  const digits = q.replace(/\D/g, "");
  const conditions: Array<Record<string, unknown>> = [
    { name: { contains: q, mode: "insensitive" } },
    { email: { contains: q, mode: "insensitive" } },
  ];

  if (digits.length >= 4) {
    conditions.push({ phone: { contains: digits } });
  }
  if (q !== digits) {
    conditions.push({ phone: { contains: q } });
  }

  return conditions;
}

export async function searchCustomers(query: string) {
  const session = await requireSession();
  if (!query.trim()) return [];

  return prisma.customer.findMany({
    where: {
      salonId: session.user.salonId,
      OR: buildCustomerSearchConditions(query),
    },
    orderBy: { name: "asc" },
    take: 10,
  });
}

export type CustomerSort =
  | "createdAt_desc"
  | "createdAt_asc"
  | "name_asc"
  | "name_desc";

export type GetCustomersOptions = {
  search?: string;
  sort?: CustomerSort;
  page?: number;
  pageSize?: number;
};

export type CustomerListItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  loyaltyPoints: number;
  createdAt: Date;
  visitCount: number;
  totalPaid: number;
  totalSales: number;
  reviewCount: number;
  lastVisit: Date | null;
};

function resolveOrderBy(sort: CustomerSort) {
  switch (sort) {
    case "createdAt_asc":
      return { createdAt: "asc" as const };
    case "name_asc":
      return { name: "asc" as const };
    case "name_desc":
      return { name: "desc" as const };
    default:
      return { createdAt: "desc" as const };
  }
}

function matchCustomerName(
  customerName: string,
  targetName: string
) {
  return customerName.toLowerCase() === targetName.toLowerCase();
}

export async function getCustomers(options?: GetCustomersOptions): Promise<{
  customers: CustomerListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}> {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 50));
  const sort = options?.sort ?? "createdAt_desc";

  const where: Record<string, unknown> = { salonId };
  if (options?.search?.trim()) {
    where.OR = buildCustomerSearchConditions(options.search);
  }

  const [customers, totalCount] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: resolveOrderBy(sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where }),
  ]);

  if (customers.length === 0) {
    return { customers: [], totalCount, page, pageSize };
  }

  const customerIds = customers.map((c) => c.id);
  const phones = [
    ...new Set(customers.map((c) => c.phone).filter(Boolean)),
  ] as string[];

  const nameOnlyCustomers = customers.filter((c) => !c.phone);

  const [
    salesByCustomerId,
    salesByPhone,
    nameOnlyInvoices,
    checkInStats,
    appointmentStats,
  ] = await Promise.all([
    prisma.invoice.groupBy({
      by: ["customerId"],
      where: {
        salonId,
        status: "paid",
        customerId: { in: customerIds },
      },
      _sum: { total: true },
      _count: { _all: true },
    }),
    phones.length > 0
      ? prisma.invoice.groupBy({
          by: ["customerPhone"],
          where: {
            salonId,
            status: "paid",
            customerId: null,
            customerPhone: { in: phones },
          },
          _sum: { total: true },
        })
      : Promise.resolve([]),
    nameOnlyCustomers.length > 0
      ? prisma.invoice.findMany({
          where: {
            salonId,
            status: "paid",
            customerId: null,
            OR: nameOnlyCustomers.map((c) => ({
              customerName: { equals: c.name, mode: "insensitive" as const },
            })),
          },
          select: { customerName: true, total: true },
        })
      : Promise.resolve([]),
    prisma.queueEntry.groupBy({
      by: ["customerId"],
      where: {
        salonId,
        status: "completed",
        customerId: { in: customerIds },
      },
      _count: { _all: true },
      _max: { completedAt: true, checkedInAt: true },
    }),
    prisma.appointment.groupBy({
      by: ["customerId"],
      where: {
        salonId,
        status: "completed",
        customerId: { in: customerIds },
      },
      _count: { _all: true },
      _max: { scheduledAt: true },
    }),
  ]);

  const salesMap = new Map(
    salesByCustomerId
      .filter((row) => row.customerId)
      .map((row) => [row.customerId!, row._sum.total ?? 0])
  );
  const phoneSalesMap = new Map(
    salesByPhone.map((row) => [row.customerPhone, row._sum.total ?? 0])
  );
  const nameSalesByCustomerId = new Map<string, number>();
  for (const customer of nameOnlyCustomers) {
    const total = nameOnlyInvoices
      .filter((inv) => matchCustomerName(inv.customerName, customer.name))
      .reduce((sum, inv) => sum + inv.total, 0);
    if (total > 0) {
      nameSalesByCustomerId.set(customer.id, total);
    }
  }
  const checkInMap = new Map(
    checkInStats.map((row) => [
      row.customerId,
      {
        visits: row._count._all,
        lastVisit: row._max.completedAt ?? row._max.checkedInAt,
      },
    ])
  );
  const appointmentMap = new Map(
    appointmentStats.map((row) => [
      row.customerId,
      {
        visits: row._count._all,
        lastVisit: row._max.scheduledAt,
      },
    ])
  );

  const enriched = customers.map((customer) => {
    const linkedSales = salesMap.get(customer.id) ?? 0;
    const phoneSales = customer.phone
      ? phoneSalesMap.get(customer.phone) ?? 0
      : 0;
    const nameSales = nameSalesByCustomerId.get(customer.id) ?? 0;
    const totalSales = linkedSales + phoneSales + nameSales;

    const checkIn = checkInMap.get(customer.id);
    const appt = appointmentMap.get(customer.id);
    const visits =
      (checkIn?.visits ?? 0) + (appt?.visits ?? 0);

    const lastVisitCandidates = [
      checkIn?.lastVisit,
      appt?.lastVisit,
    ].filter(Boolean) as Date[];
    const lastVisit =
      lastVisitCandidates.length > 0
        ? new Date(
            Math.max(...lastVisitCandidates.map((d) => d.getTime()))
          )
        : null;

    return {
      ...customer,
      loyaltyPoints: customer.loyaltyPoints ?? 0,
      visitCount: visits,
      totalPaid: totalSales,
      totalSales,
      reviewCount: 0,
      lastVisit,
    };
  });

  return { customers: enriched, totalCount, page, pageSize };
}

export async function getCustomerById(id: string) {
  const session = await requireSession();
  return prisma.customer.findFirst({
    where: { id, salonId: session.user.salonId },
  });
}

export async function getCustomerStats(id: string) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const customer = await prisma.customer.findFirst({
    where: { id, salonId },
  });
  if (!customer) return null;

  const [invoices, checkIns, appointments] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        salonId,
        OR: [
          { customerId: id },
          ...(customer.phone
            ? [{ customerPhone: customer.phone, customerId: null }]
            : []),
        ],
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.queueEntry.findMany({
      where: { salonId, customerId: id },
      include: {
        employee: true,
        services: { include: { service: true } },
      },
      orderBy: { checkedInAt: "desc" },
    }),
    prisma.appointment.findMany({
      where: { salonId, customerId: id },
      include: {
        service: true,
        employee: true,
      },
      orderBy: { scheduledAt: "desc" },
    }),
  ]);

  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const serviceHistory = [
    ...checkIns.map((entry) => ({
      id: entry.id,
      type: "check-in" as const,
      date: entry.completedAt ?? entry.checkedInAt,
      services: entry.services.map((s) => s.service.name).join(", "),
      employee: entry.employee?.name ?? null,
      status: entry.status,
    })),
    ...appointments.map((apt) => ({
      id: apt.id,
      type: "appointment" as const,
      date: apt.scheduledAt,
      services: apt.service.name,
      employee: apt.employee?.name ?? null,
      status: apt.status,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const completedVisits = serviceHistory.filter(
    (s) => s.status === "completed"
  ).length;

  return {
    customer,
    totalPaid,
    visitCount: completedVisits,
    invoices,
    serviceHistory,
  };
}

export async function createCustomer(formData: FormData) {
  const session = await requireSession();

  const raw = {
    name: formData.get("name") as string,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.phone) {
    const existing = await prisma.customer.findFirst({
      where: {
        salonId: session.user.salonId,
        phone: parsed.data.phone,
      },
    });
    if (existing) {
      return { error: "A customer with this phone number already exists" };
    }
  }

  const customer = await prisma.customer.create({
    data: {
      salonId: session.user.salonId,
      ...parsed.data,
    },
  });

  invalidateCustomersCache(session.user.salonId);
  return {
    success: true,
    id: customer.id,
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      notes: customer.notes,
      loyaltyPoints: customer.loyaltyPoints,
      createdAt: customer.createdAt,
    },
  };
}

export async function updateCustomer(id: string, formData: FormData) {
  const session = await requireSession();

  const existing = await prisma.customer.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!existing) return { error: "Customer not found" };

  const raw = {
    name: formData.get("name") as string,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.phone && parsed.data.phone !== existing.phone) {
    const phoneTaken = await prisma.customer.findFirst({
      where: {
        salonId: session.user.salonId,
        phone: parsed.data.phone,
        id: { not: id },
      },
    });
    if (phoneTaken) {
      return { error: "Another customer already uses this phone number" };
    }
  }

  await prisma.customer.update({
    where: { id },
    data: parsed.data,
  });

  invalidateCustomersCache(session.user.salonId);
  return { success: true };
}

export async function getCustomerCountForSalon(salonId: string) {
  return prisma.customer.count({
    where: { salonId },
  });
}

export async function getCustomerCount() {
  const session = await requireSession();
  return getCustomerCountForSalon(session.user.salonId);
}

const getCachedRecentCustomers = cachedBySalon(
  "customers",
  async (salonId: string) =>
    prisma.customer.findMany({
      where: { salonId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  { revalidate: 60, key: "recent" }
);

export async function getRecentCustomersForSalon(salonId: string, limit = 5) {
  if (limit === 5) {
    return getCachedRecentCustomers(salonId);
  }
  return prisma.customer.findMany({
    where: { salonId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getRecentCustomers(limit = 5) {
  const session = await requireSession();
  return getRecentCustomersForSalon(session.user.salonId, limit);
}

export async function linkExistingInvoicesToCustomers() {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const unlinked = await prisma.invoice.findMany({
    where: { salonId, customerId: null },
  });

  for (const invoice of unlinked) {
    await linkInvoiceToCustomer(
      salonId,
      invoice.id,
      invoice.customerName,
      invoice.customerPhone
    );
  }

  invalidateCustomersCache(salonId);
  return { linked: unlinked.length };
}

export async function resolveCustomerForForm(
  salonId: string,
  data: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
  }
) {
  return upsertCustomer(salonId, {
    customerId: data.customerId,
    name: data.customerName,
    phone: data.customerPhone,
  });
}
