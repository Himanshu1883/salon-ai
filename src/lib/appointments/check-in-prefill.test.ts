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
});
