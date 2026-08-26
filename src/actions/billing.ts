"use server";

import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import {
  createInvoiceFromCheckInOptionsSchema,
  invoiceSchema,
  invoiceSchemaBasic,
  markPaidSchema,
} from "@/lib/validations";
import { cachedBySalon, scheduleSalonCacheRevalidation } from "@/lib/salon-cache";
import { getCachedBillingStats } from "@/lib/billing/stats-cache";
import { getSalonPlan } from "@/lib/plan-access";
import { isBasicPlan } from "@/lib/plans";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from "date-fns";
import { upsertCustomer } from "@/lib/customers";
import { getSalonBillingWhatsAppTemplate } from "@/actions/whatsapp";
import { deductRetailSale } from "@/lib/inventory/ledger";
import { isInternalServiceDescription, resolveLineItemLabel } from "@/lib/service-display";
import {
  getActiveMembershipDiscount,
  applyMembershipDiscount,
} from "@/lib/memberships/discount";
import {
  getInvoiceBalanceDue,
  isInvoiceFullyPaid,
} from "@/lib/billing/invoice-balance";

const TAX_RATE = 0.08;

function invalidateBillingCache(salonId: string) {
  scheduleSalonCacheRevalidation(
    salonId,
    "billing",
    "customers",
    "dashboard-kpis",
    "dashboard-widgets",
    "dashboard-stats",
    "queue",
    "staff-analytics"
  );
}

async function deductProductLineItems(
  salonId: string,
  invoiceId: string,
  lineItems: Array<{
    itemType?: string;
    stockItemId?: string | null;
    quantity: number;
  }>,
  customerId?: string | null,
  employeeId?: string | null,
  createdById?: string | null,
  tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
) {
  const productLines = lineItems.filter(
    (item) =>
      item.stockItemId &&
      (item.itemType === "PRODUCT" || item.itemType === undefined)
  );
  if (productLines.length === 0) return;

  const runDeductions = async (
    client: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
  ) => {
    const existing = await client.stockLedgerEntry.count({
      where: { salonId, invoiceId, movementType: "sale" },
    });
    if (existing > 0) return;

    for (const item of productLines) {
      if (!item.stockItemId) continue;
      await deductRetailSale(client, {
        salonId,
        stockItemId: item.stockItemId,
        quantity: item.quantity,
        invoiceId,
        customerId,
        employeeId,
        createdById,
      });
    }
  };

  if (tx) {
    await runDeductions(tx);
    return;
  }

  await prisma.$transaction(runDeductions);
}

function calcTotals(
  lineItems: { quantity: number; unitPrice: number }[],
  gstEnabled = true
) {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const tax = gstEnabled
    ? Math.round(subtotal * TAX_RATE * 100) / 100
    : 0;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}

const getCachedSalonGstEnabled = cachedBySalon(
  "billing",
  async (salonId) => {
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { gstEnabled: true },
    });
    return salon?.gstEnabled ?? true;
  },
  { revalidate: 300, key: "gst-enabled" }
);

async function getSalonGstEnabled(salonId: string) {
  return getCachedSalonGstEnabled(salonId);
}

async function validateEmployeesAndSeat(
  salonId: string,
  employeeIds: string[],
  seatId?: string
) {
  const uniqueIds = [...new Set(employeeIds.filter(Boolean))];

  const [employees, seat] = await Promise.all([
    uniqueIds.length > 0
      ? prisma.employee.findMany({
          where: {
            salonId,
            status: "active",
            id: { in: uniqueIds },
          },
          select: { id: true },
        })
      : Promise.resolve([]),
    seatId
      ? prisma.seat.findFirst({
          where: { id: seatId, salonId },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (uniqueIds.length > 0 && employees.length !== uniqueIds.length) {
    return { error: "Invalid or inactive employee on a line item" as const };
  }
  if (seatId && !seat) {
    return { error: "Invalid seat" as const };
  }

  return { success: true as const };
}

async function validateEmployeeAndSeat(
  salonId: string,
  employeeId?: string | null,
  seatId?: string
) {
  if (employeeId) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, salonId, status: "active" },
    });
    if (!employee) return { error: "Invalid or inactive employee" };
  }

  if (seatId) {
    const seat = await prisma.seat.findFirst({
      where: { id: seatId, salonId },
    });
    if (!seat) return { error: "Invalid seat" };
  }

  return { success: true as const };
}

export async function getBillingStatsForSalon(salonId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [todayPaid, todayPartial, monthPaid, monthPartial, unpaidCount] =
    await Promise.all([
    prisma.invoice.aggregate({
      where: {
        salonId,
        status: "paid",
        paidAt: { gte: todayStart, lte: todayEnd },
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        salonId,
        status: "partial",
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      _sum: { amountPaid: true },
    }),
    prisma.invoice.aggregate({
      where: {
        salonId,
        status: "paid",
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        salonId,
        status: "partial",
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amountPaid: true },
    }),
    prisma.invoice.count({
      where: {
        salonId,
        status: { in: ["draft", "sent", "overdue", "partial"] },
      },
    }),
  ]);

  return {
    revenueToday:
      (todayPaid._sum.total ?? 0) + (todayPartial._sum.amountPaid ?? 0),
    revenueMonth:
      (monthPaid._sum.total ?? 0) + (monthPartial._sum.amountPaid ?? 0),
    unpaidCount,
  };
}

export async function getBillingStats() {
  const session = await requireSession();
  return getCachedBillingStats(session.user.salonId!);
}

export async function getEmployeeEarnings() {
  const session = await requireSession();
  const salonId = session.user.salonId;
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const employees = await prisma.employee.findMany({
    where: { salonId },
    orderBy: { name: "asc" },
  });

  const paidInvoices = await prisma.invoice.findMany({
    where: { salonId, status: "paid" },
    select: { employeeId: true, total: true, paidAt: true },
  });

  return employees.map((employee) => {
    const employeeInvoices = paidInvoices.filter(
      (inv) => inv.employeeId === employee.id
    );
    const monthInvoices = employeeInvoices.filter(
      (inv) =>
        inv.paidAt &&
        inv.paidAt >= monthStart &&
        inv.paidAt <= monthEnd
    );

    return {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      status: employee.status,
      totalEarnings: employeeInvoices.reduce((sum, inv) => sum + inv.total, 0),
      monthEarnings: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
      paidInvoiceCount: employeeInvoices.length,
      monthInvoiceCount: monthInvoices.length,
    };
  });
}

export async function getSeatEarnings() {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const seats = await prisma.seat.findMany({
    where: { salonId },
    include: { employee: true },
    orderBy: { number: "asc" },
  });

  const paidInvoices = await prisma.invoice.findMany({
    where: { salonId, status: "paid", seatId: { not: null } },
    select: { seatId: true, total: true },
  });

  return seats.map((seat) => {
    const seatInvoices = paidInvoices.filter((inv) => inv.seatId === seat.id);
    return {
      id: seat.id,
      number: seat.number,
      status: seat.status,
      employee: seat.employee,
      totalRevenue: seatInvoices.reduce((sum, inv) => sum + inv.total, 0),
      paidInvoiceCount: seatInvoices.length,
    };
  });
}

export async function getTopEarnersForSalon(salonId: string, limit = 3) {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const grouped = await prisma.invoice.groupBy({
    by: ["employeeId"],
    where: {
      salonId,
      status: "paid",
      paidAt: { gte: monthStart, lte: monthEnd },
      employeeId: { not: null },
    },
    _sum: { total: true },
    orderBy: { _sum: { total: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const employeeIds = grouped
    .map((row) => row.employeeId)
    .filter((id): id is string => id !== null);

  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds }, salonId },
    select: { id: true, name: true, role: true, status: true },
  });

  const employeeMap = new Map(employees.map((e) => [e.id, e]));

  return grouped
    .map((row) => {
      const employee = employeeMap.get(row.employeeId!);
      if (!employee) return null;
      return {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        status: employee.status,
        totalEarnings: row._sum.total ?? 0,
        monthEarnings: row._sum.total ?? 0,
        paidInvoiceCount: 0,
        monthInvoiceCount: 0,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);
}

export async function getTopEarners(limit = 3) {
  const session = await requireSession();
  return getTopEarnersForSalon(session.user.salonId, limit);
}

export async function getStaffEarningsTotal() {
  const session = await requireSession();
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const result = await prisma.invoice.aggregate({
    where: {
      salonId: session.user.salonId,
      status: "paid",
      paidAt: { gte: monthStart, lte: monthEnd },
      employeeId: { not: null },
    },
    _sum: { total: true },
  });

  return result._sum.total ?? 0;
}

const invoiceListSelect = {
  id: true,
  customerName: true,
  customerPhone: true,
  status: true,
  subtotal: true,
  tax: true,
  total: true,
  amountPaid: true,
  dueDate: true,
  paidAt: true,
  paymentMethod: true,
  createdAt: true,
  lineItems: {
    select: {
      id: true,
      description: true,
      quantity: true,
      unitPrice: true,
      total: true,
      service: { select: { name: true } },
    },
    take: 8,
    orderBy: { id: "asc" as const },
  },
  employee: { select: { id: true, name: true } },
  seat: { select: { id: true, number: true } },
} as const;

function buildInvoiceListWhere(
  salonId: string,
  filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    employeeId?: string;
  }
) {
  const where: Record<string, unknown> = { salonId };

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters?.employeeId && filters.employeeId !== "all") {
    where.employeeId = filters.employeeId;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      (where.createdAt as Record<string, Date>).gte = startOfDay(
        new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      (where.createdAt as Record<string, Date>).lte = endOfDay(
        new Date(filters.dateTo)
      );
    }
  } else {
    where.createdAt = { gte: subDays(new Date(), 90) };
  }

  return where;
}

export async function getInvoices(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const where = buildInvoiceListWhere(salonId, filters);
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters?.pageSize ?? 50));

  const [rows, totalCount] = await Promise.all([
    prisma.invoice.findMany({
      where,
      select: invoiceListSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.invoice.count({ where }),
  ]);

  const invoices = rows.map((row) => ({
    ...row,
    appointment: null,
    checkIn: null,
  }));

  return { invoices, totalCount, page, pageSize };
}

export async function getInvoice(id: string) {
  const session = await requireSession();
  return prisma.invoice.findFirst({
    where: { id, salonId: session.user.salonId },
    include: {
      lineItems: { include: { service: true } },
      salon: true,
      employee: true,
      seat: true,
      appointment: { include: { customer: true, service: true, employee: true } },
      checkIn: {
        include: {
          customer: true,
          services: { include: { service: true } },
        },
      },
    },
  });
}

export async function createInvoice(formData: FormData) {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const lineItemsRaw = JSON.parse(
    (formData.get("lineItems") as string) || "[]"
  ) as {
    description: string;
    quantity: number;
    unitPrice: number;
    serviceId?: string;
    stockItemId?: string;
    itemType?: string;
    employeeId?: string;
  }[];

  const raw = {
    customerName: formData.get("customerName") as string,
    customerPhone: (formData.get("customerPhone") as string) || undefined,
    customerId: (formData.get("customerId") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
    status: (formData.get("status") as string) || "draft",
    employeeId: (formData.get("employeeId") as string) || undefined,
    seatId: (formData.get("seatId") as string) || undefined,
    lineItems: lineItemsRaw,
  };
  const clientGstEnabled = formData.get("gstEnabled");
  const clientEmployeeCount = formData.get("activeEmployeeCount");
  const immediatePaymentMethod = formData.get("paymentMethod") as string | null;
  const immediatePaymentAmountRaw = formData.get("amount");
  const parsedImmediateAmount =
    immediatePaymentAmountRaw != null && immediatePaymentAmountRaw !== ""
      ? Number(immediatePaymentAmountRaw)
      : undefined;
  const immediatePaymentAmount =
    parsedImmediateAmount != null && Number.isFinite(parsedImmediateAmount)
      ? parsedImmediateAmount
      : undefined;

  const [plan, activeEmployeeCount] = await Promise.all([
    getSalonPlan(salonId),
    clientEmployeeCount != null && clientEmployeeCount !== ""
      ? Promise.resolve(Number(clientEmployeeCount))
      : prisma.employee.count({ where: { salonId, status: "active" } }),
  ]);
  const basicBilling = isBasicPlan(plan);
  if (basicBilling) {
    raw.seatId = undefined;
  }

  const schema = basicBilling ? invoiceSchemaBasic : invoiceSchema;
  const parsed = (activeEmployeeCount === 0 ? invoiceSchemaBasic : schema).safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!basicBilling && activeEmployeeCount > 0) {
    for (const item of parsed.data.lineItems) {
      const isService =
        item.itemType === "SERVICE" || Boolean(item.serviceId);
      if (isService && !item.employeeId) {
        return { error: "Assign staff for each service line item" };
      }
    }
  }

  const invoiceEmployeeId =
    parsed.data.employeeId ??
    parsed.data.lineItems.find((item) => item.employeeId)?.employeeId ??
    null;

  const lineEmployeeIds = [
    ...new Set(
      parsed.data.lineItems
        .map((item) => item.employeeId)
        .filter(Boolean) as string[]
    ),
  ];
  const employeeIdsToValidate = [
    ...lineEmployeeIds,
    ...(invoiceEmployeeId ? [invoiceEmployeeId] : []),
  ];

  const serviceIds = [
    ...new Set(
      parsed.data.lineItems.map((i) => i.serviceId).filter(Boolean) as string[]
    ),
  ];
  const stockIds = [
    ...new Set(
      parsed.data.lineItems.map((i) => i.stockItemId).filter(Boolean) as string[]
    ),
  ];
  const needsServiceLookup = parsed.data.lineItems.some(
    (item) =>
      item.serviceId &&
      !resolveLineItemLabel({ description: item.description, fallback: "" })
  );
  const needsStockLookup = parsed.data.lineItems.some(
    (item) =>
      item.stockItemId &&
      !resolveLineItemLabel({ description: item.description, fallback: "" })
  );

  const customerPromise = upsertCustomer(salonId, {
    customerId: raw.customerId,
    name: parsed.data.customerName,
    phone: parsed.data.customerPhone,
  });

  const gstEnabledPromise =
    clientGstEnabled === "1" || clientGstEnabled === "0"
      ? Promise.resolve(clientGstEnabled === "1")
      : getSalonGstEnabled(salonId);

  const [
    validation,
    gstEnabled,
    serviceRecords,
    stockRecords,
    customer,
    membershipDiscount,
  ] = await Promise.all([
    validateEmployeesAndSeat(
      salonId,
      employeeIdsToValidate,
      parsed.data.seatId
    ),
    gstEnabledPromise,
    serviceIds.length && needsServiceLookup
      ? prisma.service.findMany({
          where: { salonId, id: { in: serviceIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    stockIds.length && needsStockLookup
      ? prisma.stockItem.findMany({
          where: { salonId, id: { in: stockIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    customerPromise,
    customerPromise.then((createdCustomer) =>
      createdCustomer.isNew
        ? null
        : getActiveMembershipDiscount(salonId, createdCustomer.id)
    ),
  ]);

  if ("error" in validation) return validation;

  let totals = calcTotals(parsed.data.lineItems, gstEnabled);
  let invoiceNotes = parsed.data.notes ?? "";

  const serviceNameById = Object.fromEntries(
    serviceRecords.map((s) => [s.id, s.name])
  );
  const stockNameById = Object.fromEntries(stockRecords.map((s) => [s.id, s.name]));

  const resolvedLineItems = parsed.data.lineItems.map((item) => ({
    ...item,
    description: resolveLineItemLabel({
      serviceName: item.serviceId ? serviceNameById[item.serviceId] : null,
      productName: item.stockItemId ? stockNameById[item.stockItemId] : null,
      description: item.description,
    }),
  }));

  if (membershipDiscount && membershipDiscount.discountPercent > 0) {
    const { discountedSubtotal, discountAmount } = applyMembershipDiscount(
      totals.subtotal,
      membershipDiscount.discountPercent
    );
    const tax = gstEnabled
      ? Math.round(discountedSubtotal * TAX_RATE * 100) / 100
      : 0;
    const total = Math.round((discountedSubtotal + tax) * 100) / 100;
    totals = { subtotal: discountedSubtotal, tax, total };
    invoiceNotes = [
      invoiceNotes,
      `Membership discount (${membershipDiscount.planName}): −₹${discountAmount.toFixed(2)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  let invoice;
  const lineItemsForStock = parsed.data.lineItems.map((item) => ({
    itemType: item.itemType ?? (item.stockItemId ? "PRODUCT" : "SERVICE"),
    stockItemId: item.stockItemId,
    quantity: item.quantity,
  }));

  try {
    if (immediatePaymentMethod) {
      const paymentAmount = immediatePaymentAmount ?? totals.total;
      if (paymentAmount > totals.total + 0.009) {
        return {
          error: `Payment cannot exceed the invoice total (${totals.total.toFixed(2)})`,
        };
      }
      const fullyPaid = isInvoiceFullyPaid({
        total: totals.total,
        amountPaid: paymentAmount,
      });

      invoice = await prisma.$transaction(async (tx) => {
        const created = await tx.invoice.create({
          data: {
            salonId,
            customerId: customer.id,
            customerName: parsed.data.customerName,
            customerPhone: parsed.data.customerPhone,
            notes: invoiceNotes || null,
            dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
            status: fullyPaid ? "paid" : "partial",
            employeeId: invoiceEmployeeId,
            seatId: parsed.data.seatId || null,
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total,
            amountPaid: paymentAmount,
            paidAt: fullyPaid ? new Date() : null,
            paymentMethod: immediatePaymentMethod,
            lineItems: {
              create: resolvedLineItems.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice,
                serviceId: item.serviceId || null,
                stockItemId: item.stockItemId || null,
                itemType:
                  item.itemType ?? (item.stockItemId ? "PRODUCT" : "SERVICE"),
                employeeId: item.employeeId || null,
              })),
            },
          },
        });

        if (fullyPaid) {
          await deductProductLineItems(
            salonId,
            created.id,
            lineItemsForStock,
            customer.id,
            invoiceEmployeeId,
            session.user.id,
            tx
          );
        }

        return created;
      });

      invalidateBillingCache(salonId);
      return {
        success: true,
        id: invoice.id,
        status: fullyPaid ? "paid" : "partial",
        amountPaid: paymentAmount,
        balanceDue: fullyPaid ? 0 : totals.total - paymentAmount,
      };
    }

    invoice = await prisma.invoice.create({
      data: {
        salonId,
        customerId: customer.id,
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        notes: invoiceNotes || null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        status: parsed.data.status,
        employeeId: invoiceEmployeeId,
        seatId: parsed.data.seatId || null,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        lineItems: {
          create: resolvedLineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            serviceId: item.serviceId || null,
            stockItemId: item.stockItemId || null,
            itemType: item.itemType ?? (item.stockItemId ? "PRODUCT" : "SERVICE"),
            employeeId: item.employeeId || null,
          })),
        },
      },
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2022"
    ) {
      return {
        error:
          "Database is updating. Please retry in a moment or contact support.",
      };
    }
    throw error;
  }

  if (parsed.data.status === "paid") {
    await deductProductLineItems(
      salonId,
      invoice.id,
      lineItemsForStock,
      customer.id,
      invoiceEmployeeId,
      session.user.id
    );
  }

  invalidateBillingCache(salonId);
  return { success: true, id: invoice.id };
}

export async function getMembershipDiscountForCustomer(customerId: string) {
  const session = await requireSession();
  return getActiveMembershipDiscount(session.user.salonId, customerId);
}

export async function createInvoiceFromAppointment(appointmentId: string) {
  const session = await requireSession();
  const plan = await getSalonPlan(session.user.salonId);
  const basicBilling = isBasicPlan(plan);

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, salonId: session.user.salonId },
    include: { customer: true, service: true },
  });
  if (!appointment) return { error: "Appointment not found" };

  if (!basicBilling && !appointment.employeeId) {
    return { error: "Assign an employee to this appointment before creating an invoice" };
  }

  const existing = await prisma.invoice.findFirst({
    where: { appointmentId, salonId: session.user.salonId },
  });
  if (existing) return { error: "Invoice already exists for this appointment", id: existing.id };

  const lineItems = [
    {
      description: appointment.service.name,
      quantity: 1,
      unitPrice: appointment.service.price,
      serviceId: appointment.serviceId,
    },
  ];
  const totals = calcTotals(lineItems, await getSalonGstEnabled(session.user.salonId));

  const invoice = await prisma.invoice.create({
    data: {
      salonId: session.user.salonId,
      customerId: appointment.customerId,
      customerName: appointment.customer.name,
      customerPhone: appointment.customer.phone,
      appointmentId,
      employeeId: appointment.employeeId,
      status: "sent",
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      dueDate: new Date(),
      lineItems: {
        create: lineItems.map((item) => ({
          ...item,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
  });

  invalidateBillingCache(session.user.salonId);
  return { success: true, id: invoice.id };
}

export async function createInvoiceFromCheckIn(
  checkInId: string,
  options?: {
    lineItems?: {
      description: string;
      quantity: number;
      unitPrice: number;
      serviceId?: string;
    }[];
    paymentMethod?: string;
  }
) {
  const session = await requireSession();
  const plan = await getSalonPlan(session.user.salonId);
  const basicBilling = isBasicPlan(plan);

  const parsedOptions = createInvoiceFromCheckInOptionsSchema.safeParse(options ?? {});
  if (!parsedOptions.success) {
    return { error: parsedOptions.error.issues[0]?.message ?? "Invalid input" };
  }

  const checkIn = await prisma.queueEntry.findFirst({
    where: { id: checkInId, salonId: session.user.salonId, status: "completed" },
    include: {
      customer: true,
      services: { include: { service: true } },
    },
  });
  if (!checkIn) return { error: "Completed check-in not found" };

  if (!basicBilling && !checkIn.employeeId) {
    return { error: "Assign an employee to this check-in before creating an invoice" };
  }

  const existing = await prisma.invoice.findFirst({
    where: { checkInId, salonId: session.user.salonId },
  });
  if (existing) return { error: "Invoice already exists for this check-in", id: existing.id };

  const lineItems =
    parsedOptions.data.lineItems ??
    checkIn.services.map((qs) => ({
      description: qs.service.name,
      quantity: 1,
      unitPrice: qs.service.price,
      serviceId: qs.serviceId,
    }));

  if (lineItems.length === 0) {
    return { error: "Add at least one service to the invoice" };
  }

  const totals = calcTotals(
    lineItems,
    await getSalonGstEnabled(session.user.salonId)
  );
  const isPaid = !!parsedOptions.data.paymentMethod;

  const invoice = await prisma.invoice.create({
    data: {
      salonId: session.user.salonId,
      customerId: checkIn.customerId,
      customerName: checkIn.customer.name,
      customerPhone: checkIn.customer.phone,
      checkInId,
      employeeId: checkIn.employeeId,
      seatId: basicBilling ? null : checkIn.seatId,
      status: isPaid ? "paid" : "sent",
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      dueDate: new Date(),
      paidAt: isPaid ? new Date() : null,
      paymentMethod: parsedOptions.data.paymentMethod ?? null,
      lineItems: {
        create: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          serviceId: item.serviceId || null,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
  });

  if (isPaid) {
    await deductProductLineItems(
      session.user.salonId,
      invoice.id,
      lineItems,
      checkIn.customerId,
      checkIn.employeeId,
      session.user.id
    );
  }

  invalidateBillingCache(session.user.salonId);
  return { success: true, id: invoice.id };
}

export async function markInvoicePaid(formData: FormData) {
  const session = await requireSession();

  const raw = {
    invoiceId: formData.get("invoiceId") as string,
    paymentMethod: formData.get("paymentMethod") as string,
    amount: formData.get("amount")
      ? Number(formData.get("amount"))
      : undefined,
  };

  const parsed = markPaidSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: parsed.data.invoiceId, salonId: session.user.salonId },
    select: {
      id: true,
      status: true,
      total: true,
      amountPaid: true,
      paidAt: true,
      customerId: true,
      employeeId: true,
      lineItems: {
        select: {
          itemType: true,
          stockItemId: true,
          quantity: true,
        },
      },
    },
  });
  if (!invoice) return { error: "Invoice not found" };
  if (invoice.status === "cancelled") {
    return { error: "Cancelled invoices cannot be paid" };
  }

  const balanceDue = getInvoiceBalanceDue(invoice);
  if (balanceDue <= 0) {
    return { error: "This invoice is already fully paid" };
  }

  const paymentAmount = parsed.data.amount ?? balanceDue;
  if (paymentAmount > balanceDue + 0.009) {
    return {
      error: `Payment cannot exceed the balance due (${balanceDue.toFixed(2)})`,
    };
  }

  const newAmountPaid = (invoice.amountPaid ?? 0) + paymentAmount;
  const fullyPaid = isInvoiceFullyPaid({
    total: invoice.total,
    amountPaid: newAmountPaid,
  });

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: parsed.data.invoiceId },
      data: {
        amountPaid: newAmountPaid,
        status: fullyPaid ? "paid" : "partial",
        paidAt: fullyPaid ? new Date() : invoice.paidAt,
        paymentMethod: parsed.data.paymentMethod,
      },
    });

    if (fullyPaid) {
      await deductProductLineItems(
        session.user.salonId,
        invoice.id,
        invoice.lineItems,
        invoice.customerId,
        invoice.employeeId,
        session.user.id,
        tx
      );
    }
  });

  invalidateBillingCache(session.user.salonId);
  return {
    success: true,
    status: fullyPaid ? "paid" : "partial",
    amountPaid: newAmountPaid,
    balanceDue: fullyPaid ? 0 : invoice.total - newAmountPaid,
  };
}

export async function updateInvoiceStatus(id: string, status: string) {
  const session = await requireSession();
  const invoice = await prisma.invoice.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!invoice) return { error: "Invoice not found" };

  await prisma.invoice.update({ where: { id }, data: { status } });
  invalidateBillingCache(session.user.salonId);
  return { success: true };
}

export async function deleteInvoice(id: string) {
  const session = await requireSession();
  const invoice = await prisma.invoice.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!invoice) return { error: "Invoice not found" };

  await prisma.invoice.delete({ where: { id } });
  invalidateBillingCache(session.user.salonId);
  return { success: true };
}

async function fetchBillingInvoiceFormData(salonId: string) {
  const [services, employees, seats, salon, plan, whatsappSettings] =
    await Promise.all([
      prisma.service.findMany({
        where: { salonId },
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          description: true,
          category: { select: { name: true } },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.employee.findMany({
        where: { salonId, status: "active" },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.seat.findMany({
        where: { salonId },
        orderBy: { number: "asc" },
        select: { id: true, number: true },
      }),
      prisma.salon.findUnique({
        where: { id: salonId },
        select: { name: true, gstEnabled: true },
      }),
      getSalonPlan(salonId),
      getCachedBillingWhatsAppSettings(salonId),
    ]);

  return {
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration,
      categoryName: s.category?.name ?? "Other",
      description: s.description,
    })),
    employees,
    seats,
    isBasicPlan: isBasicPlan(plan),
    salonName: salon?.name ?? "Salon",
    gstEnabled: salon?.gstEnabled ?? true,
    whatsappSettings,
  };
}

const getCachedBillingWhatsAppSettings = cachedBySalon(
  "billing",
  getSalonBillingWhatsAppTemplate,
  { revalidate: 300, key: "whatsapp-template" }
);

const getCachedBillingInvoiceFormData = cachedBySalon(
  "billing",
  fetchBillingInvoiceFormData,
  { revalidate: 120, key: "invoice-form" }
);

export async function getBillingInvoiceFormData() {
  const session = await requireSession();
  return getBillingInvoiceFormDataForSalon(session.user.salonId!);
}

export async function getBillingInvoiceFormDataForSalon(salonId: string) {
  return getCachedBillingInvoiceFormData(salonId);
}
