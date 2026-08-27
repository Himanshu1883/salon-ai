"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { specialSaleSchema, type ItemType } from "@/lib/validations";
import { revalidatePath, unstable_cache } from "next/cache";
import { cachedRead } from "@/lib/memory-cache";
import { salonCacheTag } from "@/lib/salon-cache";
import {
  startOfDay,
  endOfDay,
  parseISO,
  isValid,
} from "date-fns";
import { upsertCustomer } from "@/lib/customers";

const TAX_RATE = 0.08;

function parseSaleDate(dateStr: string): Date {
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) {
    return startOfDay(new Date());
  }
  return parsed;
}

function calcTotals(lineItems: { quantity: number; unitPrice: number }[]) {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}

function paidAtFilter(dateFrom?: string, dateTo?: string) {
  const filter: Record<string, Date> = {};
  if (dateFrom) filter.gte = startOfDay(parseSaleDate(dateFrom));
  if (dateTo) filter.lte = endOfDay(parseSaleDate(dateTo));
  return Object.keys(filter).length > 0 ? filter : undefined;
}

const PAID_SALES_LIMIT = 500;

async function fetchPaidSales(
  salonId: string,
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }
) {
  const paidAt = paidAtFilter(filters?.dateFrom, filters?.dateTo);

  return prisma.invoice.findMany({
    where: {
      AND: [
        { salonId },
        { status: { in: ["paid", "partial"] } },
        ...(paidAt
          ? [
              {
                OR: [
                  { status: "paid" as const, paidAt },
                  { status: "partial" as const, createdAt: paidAt },
                ],
              },
            ]
          : []),
        ...(filters?.search
          ? [
              {
                OR: [
                  { customerName: { contains: filters.search } },
                  { customerPhone: { contains: filters.search } },
                ],
              },
            ]
          : []),
      ],
    },
    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      status: true,
      total: true,
      amountPaid: true,
      paidAt: true,
      createdAt: true,
      paymentMethod: true,
      lineItems: { select: { description: true } },
      employee: { select: { name: true } },
    },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    take: PAID_SALES_LIMIT,
  });
}

export async function getPaidSales(filters?: {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const cacheKey = JSON.stringify(filters ?? {});

  return cachedRead(
    `salon-cache:billing:paid-sales:${salonId}:${cacheKey}`,
    30,
    () =>
      unstable_cache(
        () => fetchPaidSales(salonId, filters),
        ["billing", "paid-sales", salonId, cacheKey],
        { revalidate: 30, tags: [salonCacheTag(salonId, "billing")] }
      )()
  );
}

export type PaymentMethodBreakdown = {
  method: string;
  label: string;
  count: number;
  total: number;
};

export async function getPaymentsBreakdown(filters?: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const session = await requireSession();
  const salonId = session.user.salonId;
  const paidAt = paidAtFilter(filters?.dateFrom, filters?.dateTo);

  const invoices = await prisma.invoice.findMany({
    where: {
      salonId,
      status: "paid",
      ...(paidAt ? { paidAt } : {}),
    },
    select: {
      total: true,
      paymentMethod: true,
      paidAt: true,
      customerName: true,
      id: true,
    },
    orderBy: { paidAt: "desc" },
  });

  const methodLabels: Record<string, string> = {
    cash: "Cash",
    card: "Card",
    upi: "UPI",
    other: "Other",
  };

  const grouped = new Map<string, PaymentMethodBreakdown>();

  for (const invoice of invoices) {
    const method = invoice.paymentMethod ?? "other";
    const existing = grouped.get(method) ?? {
      method,
      label: methodLabels[method] ?? method,
      count: 0,
      total: 0,
    };
    existing.count += 1;
    existing.total += invoice.total;
    grouped.set(method, existing);
  }

  const breakdown = Array.from(grouped.values()).sort(
    (a, b) => b.total - a.total
  );
  const grandTotal = breakdown.reduce((sum, row) => sum + row.total, 0);

  return { breakdown, invoices, grandTotal };
}

export type ItemTypeSale = {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  total: number;
  paidAt: Date | null;
  customerName: string;
  customerPhone: string | null;
  paymentMethod: string | null;
  employeeName: string | null;
};

export async function getSalesByItemType(
  itemType: ItemType,
  filters?: { dateFrom?: string; dateTo?: string }
) {
  const session = await requireSession();
  const salonId = session.user.salonId;
  const paidAt = paidAtFilter(filters?.dateFrom, filters?.dateTo);

  const lineItems = await prisma.invoiceLineItem.findMany({
    where: {
      itemType,
      invoice: {
        salonId,
        status: "paid",
        ...(paidAt ? { paidAt } : {}),
      },
    },
    include: {
      invoice: {
        include: { employee: true },
      },
    },
    orderBy: { invoice: { paidAt: "desc" } },
  });

  const sales: ItemTypeSale[] = lineItems.map((item) => ({
    id: item.id,
    invoiceId: item.invoiceId,
    description: item.description,
    quantity: item.quantity,
    total: item.total,
    paidAt: item.invoice.paidAt,
    customerName: item.invoice.customerName,
    customerPhone: item.invoice.customerPhone,
    paymentMethod: item.invoice.paymentMethod,
    employeeName: item.invoice.employee?.name ?? null,
  }));

  const totalAmount = sales.reduce((sum, s) => sum + s.total, 0);
  const totalQty = sales.reduce((sum, s) => sum + s.quantity, 0);

  return { sales, totalAmount, totalQty };
}

export async function createItemTypeSale(formData: FormData) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const raw = {
    customerName: formData.get("customerName") as string,
    customerPhone: (formData.get("customerPhone") as string) || undefined,
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    paymentMethod: formData.get("paymentMethod") as string,
    employeeId: formData.get("employeeId") as string,
    saleDate: formData.get("saleDate") as string,
    itemType: formData.get("itemType") as string,
  };

  const parsed = specialSaleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const employee = await prisma.employee.findFirst({
    where: { id: parsed.data.employeeId, salonId, status: "active" },
  });
  if (!employee) return { error: "Invalid or inactive employee" };

  const saleDay = parseSaleDate(parsed.data.saleDate);
  const paidAt = endOfDay(saleDay);

  const lineItems = [
    {
      description: parsed.data.description,
      quantity: 1,
      unitPrice: parsed.data.amount,
      itemType: parsed.data.itemType,
    },
  ];
  const totals = calcTotals(lineItems);

  const customer = await upsertCustomer(salonId, {
    name: parsed.data.customerName,
    phone: parsed.data.customerPhone,
  });

  const invoice = await prisma.invoice.create({
    data: {
      salonId,
      customerId: customer.id,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      status: "paid",
      paidAt,
      paymentMethod: parsed.data.paymentMethod,
      employeeId: parsed.data.employeeId,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      lineItems: {
        create: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          itemType: item.itemType,
        })),
      },
    },
  });

  const paths = [
    "/sales/daily",
    "/sales",
    "/sales/payments",
    "/sales/gift-cards",
    "/sales/packages",
    "/sales/memberships",
    "/billing",
    "/dashboard",
    "/customers",
  ];
  for (const path of paths) revalidatePath(path);

  return { success: true, id: invoice.id };
}
