"use server";

import { prisma } from "@/lib/prisma";
import {
  appointmentVisitScopeWhere,
  getDataScopeContext,
} from "@/lib/permissions/data-scope";
import { getBusinessDateKey } from "@/lib/attendance/business-day";
import { appointmentDateKey } from "@/lib/appointments/datetime";
import {
  invoicePrefillFromCustomerAppointments,
  pickOpenVisitForInvoice,
} from "@/lib/billing/customer-appointment-prefill";
import type { Appointment } from "@/components/appointments/types";
import type { InvoicePrefill } from "@/components/billing/types";

const SKIP_ITEM_STATUSES = new Set(["cancelled", "no_show"]);

function toAppointment(row: {
  id: string;
  customerId: string;
  serviceId: string;
  scheduledAt: Date;
  status: string;
  notes: string | null;
  customer: { name: string; phone: string | null };
  service: { id: string; name: string; duration: number; price: number };
  employee: { id: string; name: string } | null;
  serviceItems: Array<{
    id: string;
    serviceId: string;
    employeeId: string | null;
    price: number;
    duration: number;
    status: string;
    scheduledAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    sortOrder: number;
    service: { id: string; name: string; duration: number; price: number };
    employee: { id: string; name: string } | null;
  }>;
}): Appointment {
  return {
    id: row.id,
    customerId: row.customerId,
    serviceId: row.serviceId,
    scheduledAt: row.scheduledAt,
    status: row.status,
    notes: row.notes,
    customer: {
      name: row.customer.name,
      phone: row.customer.phone,
    },
    service: {
      id: row.service.id,
      name: row.service.name,
      duration: row.service.duration,
      price: row.service.price,
    },
    employee: row.employee,
    serviceItems: row.serviceItems.map((item) => ({
      id: item.id,
      serviceId: item.serviceId,
      employeeId: item.employeeId,
      price: item.price,
      duration: item.duration,
      status: item.status,
      scheduledAt: item.scheduledAt,
      startedAt: item.startedAt,
      completedAt: item.completedAt,
      sortOrder: item.sortOrder,
      service: {
        id: item.service.id,
        name: item.service.name,
        duration: item.service.duration,
        price: item.service.price,
      },
      employee: item.employee,
    })),
  };
}

/** Open today's appointment for this customer, with services and assigned staff. */
export async function getCustomerOpenAppointmentPrefill(
  customerId: string
): Promise<InvoicePrefill | null> {
  if (!customerId.trim()) return null;

  const ctx = await getDataScopeContext();
  const todayKey = getBusinessDateKey();
  const dayStart = new Date(`${todayKey}T00:00:00.000Z`);
  const dayEnd = new Date(`${todayKey}T23:59:59.999Z`);

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, salonId: ctx.salonId },
    select: { id: true },
  });
  if (!customer) return null;

  const rows = await prisma.appointment.findMany({
    where: {
      AND: [
        appointmentVisitScopeWhere(ctx),
        {
          customerId,
          status: { notIn: ["cancelled", "no_show"] },
          scheduledAt: { gte: dayStart, lte: dayEnd },
        },
      ],
    },
    include: {
      customer: { select: { name: true, phone: true } },
      service: {
        select: { id: true, name: true, duration: true, price: true },
      },
      employee: { select: { id: true, name: true } },
      _count: { select: { invoices: true } },
      serviceItems: {
        orderBy: [{ sortOrder: "asc" }, { scheduledAt: "asc" }],
        include: {
          service: {
            select: { id: true, name: true, duration: true, price: true },
          },
          employee: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const todaysRows = rows.filter(
    (row) => appointmentDateKey(row.scheduledAt) === todayKey
  );

  const visitId = pickOpenVisitForInvoice(
    todaysRows.map((row) => ({
      id: row.id,
      status: row.status,
      scheduledAt: row.scheduledAt,
      notes: row.notes,
      hasInvoice: row._count.invoices > 0,
      hasStoredItems: row.serviceItems.length > 0,
      billableItemCount: row.serviceItems.filter(
        (item) => !SKIP_ITEM_STATUSES.has(item.status)
      ).length,
    }))
  );
  if (!visitId) return null;

  const mapped = todaysRows.map(toAppointment);
  const primary = mapped.find((row) => row.id === visitId);
  if (!primary) return null;

  const prefill = invoicePrefillFromCustomerAppointments(primary, mapped);
  if (!prefill?.lineItems?.length) return null;

  return {
    customer: {
      id: prefill.customer.id,
      name: prefill.customer.name,
      phone: prefill.customer.phone,
    },
    employeeId: prefill.employeeId || undefined,
    appointmentId: prefill.appointmentId,
    lineItems: prefill.lineItems.map((item) => ({
      serviceId: item.serviceId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      employeeId: item.employeeId || undefined,
      appointmentServiceItemId: item.appointmentServiceItemId,
    })),
  };
}
