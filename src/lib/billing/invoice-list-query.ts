import { startOfDay, endOfDay, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getInvoiceBalanceDue } from "@/lib/billing/invoice-balance";
import type { BillingInvoice } from "@/components/billing/types";

export const BILLING_PAGE_SIZE = 50;

export const invoiceListSelect = {
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

export type InvoiceListFilters = {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
};

export function buildInvoiceListWhere(
  salonId: string,
  filters?: InvoiceListFilters
) {
  const where: Record<string, unknown> = { salonId };

  if (filters?.status === "unpaid") {
    where.status = { in: ["draft", "sent", "overdue", "partial"] };
  } else if (filters?.status && filters.status !== "all") {
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
  } else if (filters?.status !== "unpaid") {
    where.createdAt = { gte: subDays(new Date(), 90) };
  }

  return where;
}

export function mapInvoiceListRow(
  row: {
    id: string;
    customerName: string;
    customerPhone: string | null;
    status: string;
    subtotal: number;
    tax: number;
    total: number;
    amountPaid: number | null;
    dueDate: Date | null;
    paidAt: Date | null;
    paymentMethod: string | null;
    createdAt: Date;
    lineItems: BillingInvoice["lineItems"];
    employee: BillingInvoice["employee"];
    seat: BillingInvoice["seat"];
  }
): BillingInvoice {
  return {
    ...row,
    amountPaid: row.amountPaid ?? 0,
    appointment: null,
    checkIn: null,
    balanceDue: getInvoiceBalanceDue(row),
  };
}

export async function fetchInvoicePage(
  where: Record<string, unknown>,
  page: number,
  pageSize: number
) {
  const safePage = Math.max(1, page);
  const safeSize = Math.min(100, Math.max(1, pageSize));

  const [rows, totalCount] = await Promise.all([
    prisma.invoice.findMany({
      where: where as never,
      select: invoiceListSelect,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * safeSize,
      take: safeSize,
    }),
    prisma.invoice.count({ where: where as never }),
  ]);

  const invoices = rows.map(mapInvoiceListRow);
  const totalPages = Math.max(1, Math.ceil(totalCount / safeSize));
  const start = totalCount === 0 ? 0 : (safePage - 1) * safeSize + 1;
  const end = Math.min(safePage * safeSize, totalCount);

  return {
    invoices,
    totalCount,
    page: safePage,
    pageSize: safeSize,
    totalPages,
    start,
    end,
  };
}
