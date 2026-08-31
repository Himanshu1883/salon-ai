import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deriveAppointmentStatusFromItems,
  getAppointmentServiceItems,
  groupAppointmentsByVisit,
  visitTotalPrice,
} from "./service-items";

function apt(partial: {
  id: string;
  notes: string | null;
  scheduledAt: string;
  serviceName: string;
  price?: number;
  employeeId?: string;
  serviceItems?: Array<{
    id: string;
    name: string;
    price: number;
    employeeId?: string;
    scheduledAt?: string;
  }>;
}) {
  return {
    id: partial.id,
    notes: partial.notes,
    scheduledAt: partial.scheduledAt,
    status: "scheduled",
    service: {
      name: partial.serviceName,
      duration: 30,
      price: partial.price ?? 0,
    },
    employee: partial.employeeId
      ? { id: partial.employeeId, name: "Staff" }
      : null,
    serviceItems: partial.serviceItems?.map((item, index) => ({
      id: item.id,
      serviceId: item.id,
      employeeId: item.employeeId ?? null,
      price: item.price,
      duration: 30,
      status: "scheduled",
      scheduledAt: item.scheduledAt ?? partial.scheduledAt,
      sortOrder: index,
      service: { name: item.name, duration: 30, price: item.price },
      employee: item.employeeId
        ? { id: item.employeeId, name: "Staff" }
        : null,
    })),
  };
}

describe("groupAppointmentsByVisit", () => {
  it("keeps unrelated same-customer visits separate", () => {
    const monday = apt({
      id: "a",
      notes: null,
      scheduledAt: "2026-08-31T10:00:00.000Z",
      serviceName: "Hair Spa",
    });
    const tuesday = apt({
      id: "b",
      notes: null,
      scheduledAt: "2026-09-01T10:00:00.000Z",
      serviceName: "Hair Styling",
    });
    assert.equal(groupAppointmentsByVisit([monday, tuesday]).length, 2);
  });

  it("collapses legacy visit-group rows into one card", () => {
    const group = "[visit:abc]";
    const first = apt({
      id: "a1",
      notes: group,
      scheduledAt: "2026-08-31T10:00:00.000Z",
      serviceName: "Hair Spa",
      price: 1000,
    });
    const second = apt({
      id: "a2",
      notes: group,
      scheduledAt: "2026-08-31T11:00:00.000Z",
      serviceName: "Hair Styling",
      price: 800,
    });
    const grouped = groupAppointmentsByVisit([first, second]);
    assert.equal(grouped.length, 1);
    assert.equal(grouped[0]?.id, "a1");
    assert.equal(getAppointmentServiceItems(first, [first, second]).length, 2);
    assert.equal(visitTotalPrice(first, [first, second]), 1800);
  });

  it("uses stored service items for a single visit appointment", () => {
    const visit = apt({
      id: "apt-1",
      notes: "Sharma prefers quiet",
      scheduledAt: "2026-08-31T10:00:00.000Z",
      serviceName: "Hair Spa",
      price: 1000,
      serviceItems: [
        { id: "i1", name: "Hair Spa", price: 1000, employeeId: "emp-a" },
        { id: "i2", name: "Hair Styling", price: 800, employeeId: "emp-b" },
        { id: "i3", name: "Hair Color", price: 2500, employeeId: "emp-c" },
      ],
    });
    assert.equal(groupAppointmentsByVisit([visit]).length, 1);
    assert.equal(getAppointmentServiceItems(visit).length, 3);
    assert.equal(visitTotalPrice(visit), 4300);
  });
});

describe("deriveAppointmentStatusFromItems", () => {
  it("does not complete the visit when only one service is done", () => {
    assert.equal(
      deriveAppointmentStatusFromItems(["completed", "in_progress", "scheduled"]),
      "checked_in"
    );
  });

  it("completes the visit only when every service is completed", () => {
    assert.equal(
      deriveAppointmentStatusFromItems(["completed", "completed"]),
      "completed"
    );
  });
});
