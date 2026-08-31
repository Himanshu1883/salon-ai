import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Appointment } from "@/components/appointments/types";
import { appointmentsToInvoicePrefill } from "./check-in-prefill";

function apt(partial: Partial<Appointment> & Pick<Appointment, "id">): Appointment {
  return {
    scheduledAt: "2026-08-29T16:00:00",
    status: "scheduled",
    notes: null,
    customer: { name: "sohan", phone: "1234567896" },
    service: { id: "svc-1", name: "Women's Haircut", duration: 45, price: 500 },
    employee: null,
    ...partial,
  };
}

describe("appointmentsToInvoicePrefill", () => {
  it("fills customer, service, and optional staff without requiring an employee", () => {
    const appointment = apt({
      id: "apt-1",
      customerId: "cust-1",
      serviceId: "svc-1",
    });

    const prefill = appointmentsToInvoicePrefill(appointment);

    assert.equal(prefill.appointmentId, "apt-1");
    assert.equal(prefill.customer.id, "cust-1");
    assert.equal(prefill.customer.name, "sohan");
    assert.equal(prefill.customer.phone, "1234567896");
    assert.equal(prefill.employeeId, undefined);
    assert.deepEqual(prefill.lineItems, [
      {
        serviceId: "svc-1",
        description: "Women's Haircut",
        quantity: 1,
        unitPrice: 500,
        employeeId: undefined,
      },
    ]);
  });

  it("prefills each stored service item onto one invoice", () => {
    const appointment = apt({
      id: "apt-1",
      customerId: "cust-1",
      serviceId: "svc-1",
      serviceItems: [
        {
          id: "i1",
          serviceId: "svc-1",
          employeeId: "emp-a",
          price: 1000,
          duration: 60,
          status: "completed",
          scheduledAt: "2026-08-31T10:00:00.000Z",
          service: { name: "Hair Spa", duration: 60, price: 1000 },
          employee: { id: "emp-a", name: "A" },
        },
        {
          id: "i2",
          serviceId: "svc-2",
          employeeId: "emp-b",
          price: 800,
          duration: 45,
          status: "completed",
          scheduledAt: "2026-08-31T11:00:00.000Z",
          service: { name: "Hair Styling", duration: 45, price: 800 },
          employee: { id: "emp-b", name: "B" },
        },
      ],
    });

    const prefill = appointmentsToInvoicePrefill(appointment);
    assert.equal(prefill.lineItems?.length, 2);
    assert.equal(prefill.lineItems?.[0]?.appointmentServiceItemId, "i1");
    assert.equal(prefill.lineItems?.[1]?.unitPrice, 800);
    assert.equal(prefill.lineItems?.[0]?.employeeId, "emp-a");
    assert.equal(prefill.lineItems?.[1]?.employeeId, "emp-b");
  });

  it("keeps per-line staff when only employeeId is stored (no nested employee)", () => {
    const appointment = apt({
      id: "apt-1",
      customerId: "cust-1",
      serviceId: "svc-1",
      employee: { id: "emp-a", name: "suresh" },
      serviceItems: [
        {
          id: "i1",
          serviceId: "svc-1",
          employeeId: "emp-a",
          price: 1000,
          duration: 60,
          status: "completed",
          scheduledAt: "2026-08-31T10:00:00.000Z",
          service: { name: "Hair Spa", duration: 60, price: 1000 },
          employee: null,
        },
        {
          id: "i2",
          serviceId: "svc-2",
          employeeId: "emp-b",
          price: 1000,
          duration: 45,
          status: "completed",
          scheduledAt: "2026-08-31T11:00:00.000Z",
          service: { name: "hair Styling", duration: 45, price: 1000 },
          employee: null,
        },
      ],
    });

    const prefill = appointmentsToInvoicePrefill(appointment);
    assert.equal(prefill.employeeId, "emp-a");
    assert.equal(prefill.lineItems?.[0]?.employeeId, "emp-a");
    assert.equal(prefill.lineItems?.[1]?.employeeId, "emp-b");
  });

  it("does not copy the first stylist onto a line with no staff", () => {
    const appointment = apt({
      id: "apt-1",
      customerId: "cust-1",
      serviceId: "svc-1",
      employee: { id: "emp-a", name: "suresh" },
      serviceItems: [
        {
          id: "i1",
          serviceId: "svc-1",
          employeeId: "emp-a",
          price: 1000,
          duration: 60,
          status: "completed",
          scheduledAt: "2026-08-31T10:00:00.000Z",
          service: { name: "Hair Spa", duration: 60, price: 1000 },
          employee: { id: "emp-a", name: "suresh" },
        },
        {
          id: "i2",
          serviceId: "svc-2",
          employeeId: null,
          price: 1000,
          duration: 45,
          status: "completed",
          scheduledAt: "2026-08-31T11:00:00.000Z",
          service: { name: "hair Styling", duration: 45, price: 1000 },
          employee: null,
        },
      ],
    });

    const prefill = appointmentsToInvoicePrefill(appointment);
    assert.equal(prefill.lineItems?.[0]?.employeeId, "emp-a");
    assert.equal(prefill.lineItems?.[1]?.employeeId, undefined);
  });
});
