import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Appointment } from "@/components/appointments/types";
import {
  invoicePrefillFromCustomerAppointments,
  pickOpenVisitForInvoice,
} from "./customer-appointment-prefill";

function apt(
  partial: Partial<Appointment> & Pick<Appointment, "id">
): Appointment {
  return {
    scheduledAt: "2026-08-31T10:00:00.000Z",
    status: "scheduled",
    notes: null,
    customer: { name: "gfhfhfhfhfhhffhf", phone: "1234567890" },
    service: { id: "svc-1", name: "Keratin Treatment", duration: 30, price: 1000 },
    employee: { id: "emp-new", name: "New staff" },
    ...partial,
  };
}

describe("pickOpenVisitForInvoice", () => {
  it("prefers an in-progress visit over a later scheduled one", () => {
    const id = pickOpenVisitForInvoice(
      [
        {
          id: "later",
          status: "scheduled",
          scheduledAt: "2026-08-31T14:00:00.000Z",
          notes: null,
          hasInvoice: false,
        },
        {
          id: "now",
          status: "in_progress",
          scheduledAt: "2026-08-31T10:00:00.000Z",
          notes: null,
          hasInvoice: false,
        },
      ],
      new Date("2026-08-31T10:15:00.000Z")
    );
    assert.equal(id, "now");
  });

  it("skips invoiced visits and cancelled visits", () => {
    const id = pickOpenVisitForInvoice([
      {
        id: "billed",
        status: "scheduled",
        scheduledAt: "2026-08-31T09:00:00.000Z",
        notes: null,
        hasInvoice: true,
      },
      {
        id: "cancelled",
        status: "cancelled",
        scheduledAt: "2026-08-31T10:00:00.000Z",
        notes: null,
        hasInvoice: false,
      },
      {
        id: "open",
        status: "scheduled",
        scheduledAt: "2026-08-31T11:00:00.000Z",
        notes: null,
        hasInvoice: false,
      },
    ]);
    assert.equal(id, "open");
  });

  it("skips a visit group when any sibling already has an invoice", () => {
    const id = pickOpenVisitForInvoice([
      {
        id: "sibling-billed",
        status: "completed",
        scheduledAt: "2026-08-31T10:00:00.000Z",
        notes: "[visit:vg-1]",
        hasInvoice: true,
      },
      {
        id: "sibling-open",
        status: "scheduled",
        scheduledAt: "2026-08-31T10:30:00.000Z",
        notes: "[visit:vg-1]",
        hasInvoice: false,
      },
    ]);
    assert.equal(id, null);
  });

  it("skips stored visits whose remaining items are cancelled", () => {
    const id = pickOpenVisitForInvoice([
      {
        id: "all-cancelled-items",
        status: "scheduled",
        scheduledAt: "2026-08-31T10:00:00.000Z",
        notes: null,
        hasInvoice: false,
        hasStoredItems: true,
        billableItemCount: 0,
      },
    ]);
    assert.equal(id, null);
  });
});

describe("invoicePrefillFromCustomerAppointments", () => {
  it("copies each service and its assigned staff", () => {
    const appointment = apt({
      id: "apt-1",
      customerId: "cust-1",
      serviceId: "svc-1",
      serviceItems: [
        {
          id: "i1",
          serviceId: "svc-1",
          employeeId: "emp-new",
          price: 1000,
          duration: 30,
          status: "scheduled",
          scheduledAt: "2026-08-31T10:00:00.000Z",
          service: { name: "Keratin Treatment", duration: 30, price: 1000 },
          employee: { id: "emp-new", name: "New staff" },
        },
        {
          id: "i2",
          serviceId: "svc-2",
          employeeId: "emp-1",
          price: 800,
          duration: 45,
          status: "scheduled",
          scheduledAt: "2026-08-31T10:30:00.000Z",
          service: { name: "hair Styling", duration: 45, price: 800 },
          employee: { id: "emp-1", name: "emp1" },
        },
      ],
    });

    const prefill = invoicePrefillFromCustomerAppointments(appointment);
    assert.equal(prefill?.appointmentId, "apt-1");
    assert.equal(prefill?.lineItems?.length, 2);
    assert.equal(prefill?.lineItems?.[0]?.description, "Keratin Treatment");
    assert.equal(prefill?.lineItems?.[0]?.employeeId, "emp-new");
    assert.equal(prefill?.lineItems?.[1]?.employeeId, "emp-1");
  });

  it("drops cancelled service items", () => {
    const appointment = apt({
      id: "apt-1",
      customerId: "cust-1",
      serviceItems: [
        {
          id: "i1",
          serviceId: "svc-1",
          employeeId: "emp-new",
          price: 1000,
          duration: 30,
          status: "cancelled",
          scheduledAt: "2026-08-31T10:00:00.000Z",
          service: { name: "Keratin Treatment", duration: 30, price: 1000 },
          employee: { id: "emp-new", name: "New staff" },
        },
      ],
    });

    assert.equal(invoicePrefillFromCustomerAppointments(appointment), null);
  });
});
