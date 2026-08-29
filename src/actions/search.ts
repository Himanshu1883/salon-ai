"use server";

import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { getSalonPlan } from "@/lib/plan-access";
import { canAccessModule, type PlanModule } from "@/lib/plans";
import { formatCurrency } from "@/lib/currency";
import { getRoleLabel } from "@/lib/team";
import {
  appointmentDateKey,
  formatAppointmentDateTime,
} from "@/lib/appointments/datetime";

export type GlobalSearchResultType =
  | "customer"
  | "appointment"
  | "invoice"
  | "service"
  | "staff"
  | "product";

export type GlobalSearchResult = {
  id: string;
  type: GlobalSearchResultType;
  title: string;
  subtitle?: string;
  href: string;
};

export type GlobalSearchGroup = {
  type: GlobalSearchResultType;
  label: string;
  items: GlobalSearchResult[];
};

export type GlobalSearchResponse = {
  query: string;
  groups: GlobalSearchGroup[];
  total: number;
};

const GROUP_LABELS: Record<GlobalSearchResultType, string> = {
  customer: "Customers",
  appointment: "Appointments",
  invoice: "Invoices",
  service: "Services",
  staff: "Staff",
  product: "Products",
};

const MODULE_BY_TYPE: Record<GlobalSearchResultType, PlanModule> = {
  customer: "customers",
  appointment: "appointments",
  invoice: "billing",
  service: "services",
  staff: "staff",
  product: "inventory",
};

const RESULT_LIMIT = 5;

function buildGroups(results: GlobalSearchResult[]): GlobalSearchGroup[] {
  const order: GlobalSearchResultType[] = [
    "customer",
    "appointment",
    "invoice",
    "service",
    "staff",
    "product",
  ];

  return order
    .map((type) => ({
      type,
      label: GROUP_LABELS[type],
      items: results.filter((item) => item.type === type),
    }))
    .filter((group) => group.items.length > 0);
}

export async function globalSearch(query: string): Promise<GlobalSearchResponse> {
  const session = await requireSession();
  const salonId = session.user.salonId;
  const q = query.trim();

  if (q.length < 2) {
    return { query: q, groups: [], total: 0 };
  }

  const plan = await getSalonPlan(salonId);
  const canSearch = (type: GlobalSearchResultType) =>
    canAccessModule(plan, MODULE_BY_TYPE[type]);

  const searches: Promise<GlobalSearchResult[]>[] = [];

  if (canSearch("customer")) {
    searches.push(
      prisma.customer
        .findMany({
          where: {
            salonId,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
          orderBy: { name: "asc" },
          take: RESULT_LIMIT,
          select: { id: true, name: true, phone: true, email: true },
        })
        .then((rows) =>
          rows.map((row) => ({
            id: row.id,
            type: "customer" as const,
            title: row.name,
            subtitle:
              [row.phone, row.email].filter(Boolean).join(" · ") ||
              "No contact info",
            href: `/clients/${row.id}`,
          }))
        )
    );
  }

  if (canSearch("appointment")) {
    searches.push(
      prisma.appointment
        .findMany({
          where: {
            salonId,
            OR: [
              { customer: { name: { contains: q, mode: "insensitive" } } },
              { customer: { phone: { contains: q } } },
              { service: { name: { contains: q, mode: "insensitive" } } },
              { notes: { contains: q, mode: "insensitive" } },
            ],
          },
          include: {
            customer: { select: { name: true, phone: true } },
            service: { select: { name: true } },
            employee: { select: { name: true } },
          },
          orderBy: { scheduledAt: "desc" },
          take: RESULT_LIMIT,
        })
        .then((rows) =>
          rows.map((row) => ({
            id: row.id,
            type: "appointment" as const,
            title: `${row.customer.name} — ${row.service.name}`,
            subtitle: [
              formatAppointmentDateTime(row.scheduledAt, "EEE, MMM d · h:mm a"),
              row.employee?.name,
              row.status,
            ]
              .filter(Boolean)
              .join(" · "),
            href: `/sales/appointments?weekStart=${appointmentDateKey(row.scheduledAt)}`,
          }))
        )
    );
  }

  if (canSearch("invoice")) {
    searches.push(
      prisma.invoice
        .findMany({
          where: {
            salonId,
            OR: [
              { customerName: { contains: q, mode: "insensitive" } },
              { customerPhone: { contains: q } },
              { notes: { contains: q, mode: "insensitive" } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: RESULT_LIMIT,
          select: {
            id: true,
            customerName: true,
            customerPhone: true,
            status: true,
            total: true,
            createdAt: true,
          },
        })
        .then((rows) =>
          rows.map((row) => ({
            id: row.id,
            type: "invoice" as const,
            title: row.customerName,
            subtitle: [
              formatCurrency(row.total),
              row.status,
              format(row.createdAt, "MMM d, yyyy"),
              row.customerPhone,
            ]
              .filter(Boolean)
              .join(" · "),
            href: `/billing/${row.id}`,
          }))
        )
    );
  }

  if (canSearch("service")) {
    searches.push(
      prisma.service
        .findMany({
          where: {
            salonId,
            name: { contains: q, mode: "insensitive" },
          },
          include: { category: { select: { name: true } } },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          take: RESULT_LIMIT,
        })
        .then((rows) =>
          rows.map((row) => ({
            id: row.id,
            type: "service" as const,
            title: row.name,
            subtitle: [
              row.category?.name,
              formatCurrency(row.price),
              `${row.duration} min`,
            ]
              .filter(Boolean)
              .join(" · "),
            href: "/catalog/services",
          }))
        )
    );
  }

  if (canSearch("staff")) {
    searches.push(
      prisma.employee
        .findMany({
          where: {
            salonId,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
              { role: { contains: q, mode: "insensitive" } },
            ],
          },
          orderBy: { name: "asc" },
          take: RESULT_LIMIT,
          select: { id: true, name: true, role: true, phone: true, status: true },
        })
        .then((rows) =>
          rows.map((row) => ({
            id: row.id,
            type: "staff" as const,
            title: row.name,
            subtitle: [getRoleLabel(row.role), row.phone, row.status]
              .filter(Boolean)
              .join(" · "),
            href: `/team/members/${row.id}`,
          }))
        )
    );
  }

  if (canSearch("product")) {
    searches.push(
      prisma.stockItem
        .findMany({
          where: {
            salonId,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
              { barcode: { contains: q } },
            ],
          },
          orderBy: { name: "asc" },
          take: RESULT_LIMIT,
          select: {
            id: true,
            name: true,
            sku: true,
            quantityOnHand: true,
            unit: true,
          },
        })
        .then((rows) =>
          rows.map((row) => ({
            id: row.id,
            type: "product" as const,
            title: row.name,
            subtitle: [
              row.sku ? `SKU ${row.sku}` : null,
              `${row.quantityOnHand} ${row.unit} in stock`,
            ]
              .filter(Boolean)
              .join(" · "),
            href: "/inventory/products",
          }))
        )
    );
  }

  const resultSets = await Promise.all(searches);
  const results = resultSets.flat();
  const groups = buildGroups(results);

  return {
    query: q,
    groups,
    total: results.length,
  };
}
