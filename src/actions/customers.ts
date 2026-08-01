"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { upsertCustomer, linkInvoiceToCustomer } from "@/lib/customers";
import { customerSchema } from "@/lib/validations";
import { revalidateSalonCache } from "@/lib/salon-cache";

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

function matchCustomerInvoice(
  customer: { id: string; name: string; phone: string | null },
  inv: {
    customerId: string | null;
    customerPhone: string | null;
    customerName: string;
  }
) {
  return (
    inv.customerId === customer.id ||
    (!inv.customerId &&
      customer.phone &&
      inv.customerPhone === customer.phone) ||
    (!inv.customerId &&
      !customer.phone &&
      inv.customerName.toLowerCase() === customer.name.toLowerCase())
  );
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

  const [customers, totalCount, paidInvoices, completedCheckIns, completedAppointments] =
    await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: resolveOrderBy(sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
      prisma.invoice.findMany({
        where: { salonId, status: "paid" },
        select: {
          customerId: true,
          customerPhone: true,
          customerName: true,
          total: true,
        },
      }),
      prisma.queueEntry.findMany({
        where: { salonId, status: "completed" },
        select: {
          customerId: true,
          completedAt: true,
          checkedInAt: true,
        },
      }),
      prisma.appointment.findMany({
        where: { salonId, status: "completed" },
        select: {
          customerId: true,
          scheduledAt: true,
        },
      }),
    ]);

  const enriched = customers.map((customer) => {
    const customerInvoices = paidInvoices.filter((inv) =>
      matchCustomerInvoice(customer, inv)
    );

    const visits = [
      ...completedCheckIns
        .filter((e) => e.customerId === customer.id)
        .map((e) => e.completedAt ?? e.checkedInAt),
      ...completedAppointments
        .filter((a) => a.customerId === customer.id)
        .map((a) => a.scheduledAt),
    ];

    const lastVisit =
      visits.length > 0
        ? new Date(Math.max(...visits.map((d) => d.getTime())))
        : null;

    const totalSales = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);

    return {
      ...customer,
      loyaltyPoints: customer.loyaltyPoints ?? 0,
      visitCount: visits.length,
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

export async function getRecentCustomersForSalon(salonId: string, limit = 5) {
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
