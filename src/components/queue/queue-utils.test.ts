import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  attachAppointmentStaffToQueueServices,
  queueEntryToInvoicePrefill,
} from "./queue-utils";
import type { QueueInvoiceEntry } from "./types";

describe("attachAppointmentStaffToQueueServices", () => {
  it("keeps each service's assigned staff from the appointment", () => {
    const stamped = attachAppointmentStaffToQueueServices(
      [
        { service: { id: "svc-spa" } },
        { service: { id: "svc-style" } },
      ],
      [
        { id: "i1", serviceId: "svc-spa", employeeId: "emp-suresh" },
        { id: "i2", serviceId: "svc-style", employeeId: "emp-new" },
      ],
      "emp-suresh"
    );

    assert.equal(stamped[0]?.employeeId, "emp-suresh");
    assert.equal(stamped[0]?.appointmentServiceItemId, "i1");
    assert.equal(stamped[1]?.employeeId, "emp-new");
    assert.equal(stamped[1]?.appointmentServiceItemId, "i2");
  });

  it("uses the walk-in stylist when there is no appointment staff", () => {
    const stamped = attachAppointmentStaffToQueueServices(
      [{ service: { id: "svc-spa" } }, { service: { id: "svc-style" } }],
      [],
      "emp-suresh"
    );

    assert.equal(stamped[0]?.employeeId, "emp-suresh");
    assert.equal(stamped[1]?.employeeId, "emp-suresh");
  });

  it("does not copy header staff onto an unassigned appointment service", () => {
    const stamped = attachAppointmentStaffToQueueServices(
      [{ service: { id: "svc-spa" } }, { service: { id: "svc-style" } }],
      [
        { id: "i1", serviceId: "svc-spa", employeeId: "emp-suresh" },
        { id: "i2", serviceId: "svc-style", employeeId: null },
      ],
      "emp-suresh"
    );

    assert.equal(stamped[0]?.employeeId, "emp-suresh");
    assert.equal(stamped[1]?.employeeId, null);
  });

  it("keeps staff already stored on the queue line", () => {
    const stamped = attachAppointmentStaffToQueueServices(
      [
        { service: { id: "svc-spa" }, employeeId: "emp-walkin" },
        { service: { id: "svc-style" }, employeeId: "emp-color" },
      ],
      [
        { id: "i1", serviceId: "svc-spa", employeeId: "emp-suresh" },
        { id: "i2", serviceId: "svc-style", employeeId: "emp-new" },
      ],
      "emp-suresh"
    );

    assert.equal(stamped[0]?.employeeId, "emp-walkin");
    assert.equal(stamped[1]?.employeeId, "emp-color");
  });
});

describe("queueEntryToInvoicePrefill", () => {
  it("does not copy the first stylist onto every line", () => {
    const entry: QueueInvoiceEntry = {
      id: "q1",
      customer: { name: "sohan", phone: "1234567896" },
      employeeId: "emp-suresh",
      appointmentId: "apt-1",
      services: [
        {
          service: { id: "svc-spa", name: "Hair Spa", price: 1000 },
          employeeId: "emp-suresh",
          appointmentServiceItemId: "i1",
        },
        {
          service: { id: "svc-style", name: "hair Styling", price: 1000 },
          employeeId: "emp-new",
          appointmentServiceItemId: "i2",
        },
      ],
      invoices: [],
    };

    const prefill = queueEntryToInvoicePrefill(entry);
    assert.equal(prefill.appointmentId, "apt-1");
    assert.equal(prefill.lineItems?.[0]?.employeeId, "emp-suresh");
    assert.equal(prefill.lineItems?.[1]?.employeeId, "emp-new");
    assert.equal(prefill.lineItems?.[1]?.appointmentServiceItemId, "i2");
  });
});
