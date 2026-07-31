"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { manualSaleSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import {
  startOfDay,
  endOfDay,
  parseISO,
  format as formatDate,
  isValid,
} from "date-fns";
import { upsertCustomer } from "@/lib/customers";

const TAX_RATE = 0.08;

type TransactionRowKey =
  | "services"
  | "serviceAddons"
  | "products"
  | "shipping"
  | "giftCards"
  | "packages"
  | "memberships"
  | "lateCancellationFees"
  | "noShowFees"
  | "refundAmount";

type CashRowKey = "cash" | "other" | "giftCardRedemptions";

export type DailySalesTransactionRow = {
  key: TransactionRowKey;
  label: string;
  salesQty: number;
  refundQty: number;
  grossTotal: number;
  isTotal?: boolean;
};

export type DailySalesCashRow = {
  key: CashRowKey | "paymentsCollected" | "tips";
  label: string;
  paymentsCollected: number;
  refundsPaid: number;
  isTotal?: boolean;
  isSubtotal?: boolean;
};

export type DailySalesSummary = {
  date: string;
  transactionSummary: DailySalesTransactionRow[];
  cashMovement: DailySalesCashRow[];
  totalSales: number;
  paymentsCollected: number;
  tips: number;
};

type LineItemWithService = {
  serviceId: string | null;
  itemType?: string;
  description: string;
  quantity: number;
  total: number;
};

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

function itemTypeToCategory(itemType: string): TransactionRowKey | null {
  const map: Record<string, TransactionRowKey> = {
    SERVICE: "services",
    ADDON: "serviceAddons",
    PRODUCT: "products",
    GIFT_CARD: "giftCards",
    PACKAGE: "packages",
    MEMBERSHIP: "memberships",
    FEE: "lateCancellationFees",
  };
  return map[itemType] ?? null;
}

function categorizeLineItem(item: LineItemWithService): TransactionRowKey {
  if (item.itemType && item.itemType !== "SERVICE") {
    const fromType = itemTypeToCategory(item.itemType);
    if (fromType) return fromType;
  }

  const desc = item.description.toLowerCase();

  if (item.serviceId) return "services";
  if (/add-?on|addon/.test(desc)) return "serviceAddons";
  if (/shipping|delivery/.test(desc)) return "shipping";
  if (/gift\s*card/.test(desc)) return "giftCards";
  if (/package/.test(desc)) return "packages";
  if (/membership/.test(desc)) return "memberships";
  if (/late\s*cancell|cancellation\s*fee/.test(desc)) return "lateCancellationFees";
  if (/no-?show/.test(desc)) return "noShowFees";
  if (/product|stock|shampoo|color|retail/.test(desc)) return "products";

  return "serviceAddons";
}

function emptyTransactionRows(): Record<
  TransactionRowKey,
  { salesQty: number; refundQty: number; grossTotal: number }
> {
  return {
    services: { salesQty: 0, refundQty: 0, grossTotal: 0 },
    serviceAddons: { salesQty: 0, refundQty: 0, grossTotal: 0 },
    products: { salesQty: 0, refundQty: 0, grossTotal: 0 },
    shipping: { salesQty: 0, refundQty: 0, grossTotal: 0 },
    giftCards: { salesQty: 0, refundQty: 0, grossTotal: 0 },
    packages: { salesQty: 0, refundQty: 0, grossTotal: 0 },
    memberships: { salesQty: 0, refundQty: 0, grossTotal: 0 },
    lateCancellationFees: { salesQty: 0, refundQty: 0, grossTotal: 0 },
    noShowFees: { salesQty: 0, refundQty: 0, grossTotal: 0 },
    refundAmount: { salesQty: 0, refundQty: 0, grossTotal: 0 },
  };
}

function buildSummaryFromInvoices(
  paidInvoices: {
    total: number;
    paymentMethod: string | null;
    lineItems: LineItemWithService[];
  }[],
  cancelledInvoices: {
    total: number;
    paymentMethod: string | null;
    lineItems: LineItemWithService[];
  }[]
): Omit<DailySalesSummary, "date"> {
  const tx = emptyTransactionRows();
  const cash = {
    cash: { paymentsCollected: 0, refundsPaid: 0 },
    other: { paymentsCollected: 0, refundsPaid: 0 },
    giftCardRedemptions: { paymentsCollected: 0, refundsPaid: 0 },
  };

  for (const invoice of paidInvoices) {
    const method = invoice.paymentMethod ?? "other";
    if (method === "cash") {
      cash.cash.paymentsCollected += invoice.total;
    } else {
      cash.other.paymentsCollected += invoice.total;
    }

    for (const item of invoice.lineItems) {
      const category = categorizeLineItem(item);
      tx[category].salesQty += item.quantity;
      tx[category].grossTotal += item.total;
    }
  }

  for (const invoice of cancelledInvoices) {
    tx.refundAmount.refundQty += invoice.lineItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    tx.refundAmount.grossTotal += invoice.total;

    const method = invoice.paymentMethod ?? "other";
    if (method === "cash") {
      cash.cash.refundsPaid += invoice.total;
    } else if (method === "gift_card") {
      cash.giftCardRedemptions.refundsPaid += invoice.total;
    } else {
      cash.other.refundsPaid += invoice.total;
    }

    for (const item of invoice.lineItems) {
      const category = categorizeLineItem(item);
      tx[category].refundQty += item.quantity;
    }
  }

  const transactionSummary: DailySalesTransactionRow[] = [
    { key: "services", label: "Services", ...tx.services },
    { key: "serviceAddons", label: "Service add-ons", ...tx.serviceAddons },
    { key: "products", label: "Products", ...tx.products },
    { key: "shipping", label: "Shipping", ...tx.shipping },
    { key: "giftCards", label: "Gift cards", ...tx.giftCards },
    { key: "packages", label: "Packages", ...tx.packages },
    { key: "memberships", label: "Memberships", ...tx.memberships },
    {
      key: "lateCancellationFees",
      label: "Late cancellation fees",
      ...tx.lateCancellationFees,
    },
    { key: "noShowFees", label: "No-show fees", ...tx.noShowFees },
    {
      key: "refundAmount",
      label: "Refund amount",
      salesQty: 0,
      refundQty: tx.refundAmount.refundQty,
      grossTotal: tx.refundAmount.grossTotal,
    },
  ];

  const salesTotal = transactionSummary.reduce(
    (sum, row) => sum + row.grossTotal,
    0
  );
  const netSales = salesTotal - tx.refundAmount.grossTotal;

  transactionSummary.push({
    key: "services",
    label: "Total Sales",
    salesQty: 0,
    refundQty: 0,
    grossTotal: netSales,
    isTotal: true,
  });

  const paymentsCollected =
    cash.cash.paymentsCollected +
    cash.other.paymentsCollected +
    cash.giftCardRedemptions.paymentsCollected;
  const tips = 0;

  const cashMovement: DailySalesCashRow[] = [
    { key: "cash", label: "Cash", ...cash.cash },
    { key: "other", label: "Other", ...cash.other },
    {
      key: "giftCardRedemptions",
      label: "Gift card redemptions",
      ...cash.giftCardRedemptions,
    },
    {
      key: "paymentsCollected",
      label: "Payments collected",
      paymentsCollected,
      refundsPaid: 0,
      isTotal: true,
    },
    {
      key: "tips",
      label: "Of which tips",
      paymentsCollected: tips,
      refundsPaid: 0,
      isSubtotal: true,
    },
  ];

  return {
    transactionSummary,
    cashMovement,
    totalSales: netSales,
    paymentsCollected,
    tips,
  };
}

export async function getDailySalesSummary(
  dateStr: string
): Promise<DailySalesSummary> {
  const session = await requireSession();
  const salonId = session.user.salonId;
  const date = parseSaleDate(dateStr);
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [paidInvoices, cancelledInvoices] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        salonId,
        status: "paid",
        paidAt: { gte: dayStart, lte: dayEnd },
      },
      select: {
        total: true,
        paymentMethod: true,
        lineItems: {
          select: {
            serviceId: true,
            itemType: true,
            description: true,
            quantity: true,
            total: true,
          },
        },
      },
    }),
    prisma.invoice.findMany({
      where: {
        salonId,
        status: "cancelled",
        updatedAt: { gte: dayStart, lte: dayEnd },
      },
      select: {
        total: true,
        paymentMethod: true,
        lineItems: {
          select: {
            serviceId: true,
            itemType: true,
            description: true,
            quantity: true,
            total: true,
          },
        },
      },
    }),
  ]);

  const summary = buildSummaryFromInvoices(paidInvoices, cancelledInvoices);

  return {
    date: formatDate(dayStart, "yyyy-MM-dd"),
    ...summary,
  };
}

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatCsvAmount(amount: number): string {
  return amount.toFixed(2);
}

export async function exportDailySalesCsv(
  dateStr: string
): Promise<{ csv: string; filename: string } | { error: string }> {
  const summary = await getDailySalesSummary(dateStr);
  const displayDate = formatDate(parseSaleDate(summary.date), "EEEE, d MMM yyyy");

  const lines: string[] = [
    `Daily Sales Report,${summary.date}`,
    `Date,${escapeCsv(displayDate)}`,
    "",
    "Transaction Summary",
    "Item type,Sales qty,Refund qty,Gross total (INR)",
  ];

  for (const row of summary.transactionSummary) {
    lines.push(
      [
        escapeCsv(row.label),
        row.salesQty,
        row.refundQty,
        formatCsvAmount(row.grossTotal),
      ].join(",")
    );
  }

  lines.push(
    "",
    "Cash Movement Summary",
    "Payment type,Payments collected,Refunds paid"
  );

  for (const row of summary.cashMovement) {
    lines.push(
      [
        escapeCsv(row.label),
        formatCsvAmount(row.paymentsCollected),
        formatCsvAmount(row.refundsPaid),
      ].join(",")
    );
  }

  const csv = lines.join("\n");
  const filename = `daily-sales-${summary.date}.csv`;

  return { csv, filename };
}

export async function recordManualSale(formData: FormData) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const raw = {
    customerName: formData.get("customerName") as string,
    customerPhone: (formData.get("customerPhone") as string) || undefined,
    serviceId: formData.get("serviceId") as string,
    amount: formData.get("amount") as string,
    paymentMethod: formData.get("paymentMethod") as string,
    employeeId: formData.get("employeeId") as string,
    saleDate: formData.get("saleDate") as string,
  };

  const parsed = manualSaleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const [service, employee] = await Promise.all([
    prisma.service.findFirst({
      where: { id: parsed.data.serviceId, salonId },
    }),
    prisma.employee.findFirst({
      where: { id: parsed.data.employeeId, salonId, status: "active" },
    }),
  ]);

  if (!service) return { error: "Service not found" };
  if (!employee) return { error: "Invalid or inactive employee" };

  const saleDay = parseSaleDate(parsed.data.saleDate);
  const paidAt = endOfDay(saleDay);

  const lineItems = [
    {
      description: service.name,
      quantity: 1,
      unitPrice: parsed.data.amount,
      serviceId: service.id,
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
          serviceId: item.serviceId,
        })),
      },
    },
  });

  revalidatePath("/sales/daily");
  revalidatePath("/billing");
  revalidatePath("/dashboard");
  revalidatePath("/customers");

  return { success: true, id: invoice.id };
}
