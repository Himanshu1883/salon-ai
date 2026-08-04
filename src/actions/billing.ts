"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import {
  createInvoiceFromCheckInOptionsSchema,
  invoiceSchema,
  invoiceSchemaBasic,
  markPaidSchema,
} from "@/lib/validations";
import { revalidateSalonCache } from "@/lib/salon-cache";
import { getSalonPlan } from "@/lib/plan-access";
import { isBasicPlan } from "@/lib/plans";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { upsertCustomer } from "@/lib/customers";
import { getSalonBillingWhatsAppTemplate } from "@/actions/whatsapp";
import { deductRetailSale } from "@/lib/inventory/ledger";
import { isInternalServiceDescription, resolveLineItemLabel } from "@/lib/service-display";
import {
  getActiveMembershipDiscount,
  applyMembershipDiscount,
} from "@/lib/memberships/discount";

const TAX_RATE = 0.08;

function invalidateBillingCache(salonId: string) {
  revalidateSalonCache(
    salonId,
    "billing",
    "customers",
    "dashboard-kpis",
    "dashboard-widgets",
    "dashboard-stats",
    "queue"
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
  createdById?: string | null
) {
  const existing = await prisma.stockLedgerEntry.count({
    where: { salonId, invoiceId, movementType: "sale" },
  });
  if (existing > 0) return;

  const productLines = lineItems.filter(
    (item) =>
      item.stockItemId &&
      (item.itemType === "PRODUCT" || item.itemType === undefined)
  );
  if (productLines.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const item of productLines) {
      if (!item.stockItemId) continue;
      await deductRetailSale(tx, {
        salonId,
        stockItemId: item.stockItemId,
        quantity: item.quantity,
        invoiceId,
        customerId,
        employeeId,
        createdById,
      });
    }
  });
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

async function getSalonGstEnabled(salonId: string) {
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: { gstEnabled: true },
  });
  return salon?.gstEnabled ?? true;
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

  const [todayPaid, monthPaid, unpaidCount] = await Promise.all([
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
        status: "paid",
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { total: true },
    }),
    prisma.invoice.count({
      where: {
        salonId,
        status: { in: ["draft", "sent", "overdue"] },
      },
    }),
  ]);

  return {
    revenueToday: todayPaid._sum.total ?? 0,
    revenueMonth: monthPaid._sum.total ?? 0,
    unpaidCount,
  };
}

export async function getBillingStats() {
  const session = await requireSession();
  return getBillingStatsForSalon(session.user.salonId);
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

export async function getInvoices(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
}) {
  const session = await requireSession();

  const where: Record<string, unknown> = { salonId: session.user.salonId };

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
  }

  return prisma.invoice.findMany({
    where,
    include: {
      lineItems: { include: { service: true } },
      appointment: { include: { service: true } },
      checkIn: { include: { customer: true } },
      employee: true,
      seat: true,
    },
    orderBy: { createdAt: "desc" },
  });
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
  const plan = await getSalonPlan(session.user.salonId);
  const basicBilling = isBasicPlan(plan);

  const lineItemsRaw = JSON.parse(
    (formData.get("lineItems") as string) || "[]"
  ) as { description: string; quantity: number; unitPrice: number; serviceId?: string }[];

  const raw = {
    customerName: formData.get("customerName") as string,
    customerPhone: (formData.get("customerPhone") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
    status: (formData.get("status") as string) || "draft",
    employeeId: (formData.get("employeeId") as string) || undefined,
    seatId: basicBilling ? undefined : (formData.get("seatId") as string) || undefined,
    lineItems: lineItemsRaw,
  };

  const schema = basicBilling ? invoiceSchemaBasic : invoiceSchema;
  const activeEmployeeCount = basicBilling
    ? 0
    : await prisma.employee.count({
        where: { salonId: session.user.salonId, status: "active" },
      });
  const parsed = (activeEmployeeCount === 0 ? invoiceSchemaBasic : schema).safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const validation = await validateEmployeeAndSeat(
    session.user.salonId,
    parsed.data.employeeId,
    parsed.data.seatId
  );
  if ("error" in validation) return validation;

  const gstEnabled = await getSalonGstEnabled(session.user.salonId);
  let totals = calcTotals(parsed.data.lineItems, gstEnabled);
  let invoiceNotes = parsed.data.notes ?? "";

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

  const [serviceRecords, stockRecords] = await Promise.all([
    serviceIds.length
      ? prisma.service.findMany({
          where: { salonId: session.user.salonId, id: { in: serviceIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    stockIds.length
      ? prisma.stockItem.findMany({
          where: { salonId: session.user.salonId, id: { in: stockIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

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

  const customer = await upsertCustomer(session.user.salonId, {
    name: parsed.data.customerName,
    phone: parsed.data.customerPhone,
  });

  const membershipDiscount = await getActiveMembershipDiscount(
    session.user.salonId,
    customer.id
  );
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

  const invoice = await prisma.invoice.create({
    data: {
      salonId: session.user.salonId,
      customerId: customer.id,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      notes: invoiceNotes || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      status: parsed.data.status,
      employeeId: parsed.data.employeeId || null,
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
        })),
      },
    },
  });

  if (parsed.data.status === "paid") {
    await deductProductLineItems(
      session.user.salonId,
      invoice.id,
      parsed.data.lineItems.map((item) => ({
        itemType: item.itemType ?? (item.stockItemId ? "PRODUCT" : "SERVICE"),
        stockItemId: item.stockItemId,
        quantity: item.quantity,
      })),
      customer.id,
      parsed.data.employeeId,
      session.user.id
    );
  }

  invalidateBillingCache(session.user.salonId);
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
  };

  const parsed = markPaidSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: parsed.data.invoiceId, salonId: session.user.salonId },
    include: { lineItems: true },
  });
  if (!invoice) return { error: "Invoice not found" };

  await prisma.invoice.update({
    where: { id: parsed.data.invoiceId },
    data: {
      status: "paid",
      paidAt: new Date(),
      paymentMethod: parsed.data.paymentMethod,
    },
  });

  await deductProductLineItems(
    session.user.salonId,
    invoice.id,
    invoice.lineItems,
    invoice.customerId,
    invoice.employeeId,
    session.user.id
  );

  invalidateBillingCache(session.user.salonId);
  return { success: true };
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

export async function getBillingInvoiceFormData() {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const [services, employees, seats, salon, plan, whatsappSettings] = await Promise.all([
    prisma.service.findMany({
      where: { salonId },
      include: { category: true },
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
    getSalonBillingWhatsAppTemplate(salonId),
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
