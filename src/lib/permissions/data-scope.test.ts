import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appointmentScopeWhere,
  appointmentVisitScopeWhere,
  customerScopeWhere,
  filterEmployeeNavModules,
  isAttributedToEmployee,
  resolveDataScope,
  salesInvoiceScopeWhere,
} from "./data-scope-core";
import type { PermissionKey } from "./catalog";
import type { PlanModule } from "@/lib/plans";

describe("resolveDataScope", () => {
  it("keeps owner, manager, and receptionist salon-wide", () => {
    assert.equal(
      resolveDataScope({ isOwner: true, roleKey: "OWNER", userRole: "owner" }),
      "all"
    );
    assert.equal(
      resolveDataScope({
        isOwner: false,
        roleKey: "MANAGER",
        userRole: "manager",
      }),
      "all"
    );
    assert.equal(
      resolveDataScope({
        isOwner: false,
        roleKey: "RECEPTIONIST",
        userRole: "receptionist",
      }),
      "all"
    );
  });

  it("scopes employees to their own data even with a view permission role key", () => {
    assert.equal(
      resolveDataScope({
        isOwner: false,
        roleKey: "EMPLOYEE",
        userRole: "employee",
      }),
      "own"
    );
    assert.equal(
      resolveDataScope({
        isOwner: false,
        roleKey: null,
        userRole: "staff",
      }),
      "own"
    );
  });
});

describe("scope where clauses", () => {
  const ownCtx = {
    userId: "u1",
    salonId: "s1",
    userRole: "employee",
    isOwner: false,
    roleKey: "EMPLOYEE" as const,
    hierarchyLevel: 20,
    permissions: new Set<PermissionKey>(),
    employeeId: "emp-a",
    employeeName: "A",
    dataScope: "own" as const,
  };

  const adminCtx = { ...ownCtx, dataScope: "all" as const, isOwner: true };

  it("scopes appointments to the current employee", () => {
    assert.deepEqual(appointmentScopeWhere(ownCtx), {
      salonId: "s1",
      employeeId: "emp-a",
    });
    assert.deepEqual(appointmentScopeWhere(adminCtx), { salonId: "s1" });
  });

  it("includes service-item assignments in visit scope", () => {
    assert.deepEqual(appointmentVisitScopeWhere(ownCtx), {
      salonId: "s1",
      OR: [
        { employeeId: "emp-a" },
        { serviceItems: { some: { employeeId: "emp-a" } } },
      ],
    });
    assert.deepEqual(appointmentVisitScopeWhere(adminCtx), { salonId: "s1" });
  });

  it("does not expose salon-wide customers for employees", () => {
    const where = customerScopeWhere(ownCtx);
    assert.equal(where.salonId, "s1");
    assert.ok(Array.isArray(where.OR));
    assert.equal("OR" in customerScopeWhere(adminCtx), false);
  });

  it("attributes invoices via employee or line item", () => {
    const where = salesInvoiceScopeWhere(ownCtx);
    assert.ok(Array.isArray(where.OR));
    assert.equal(
      isAttributedToEmployee("emp-a", {
        employeeId: null,
        lineItems: [{ employeeId: "emp-a" }],
      }),
      true
    );
    assert.equal(
      isAttributedToEmployee("emp-a", {
        employeeId: "emp-b",
        lineItems: [{ employeeId: "emp-b" }],
      }),
      false
    );
  });
});

describe("employee nav filter", () => {
  it("hides calendar, my time, subscription, and salon-wide reports", () => {
    const items = [
      { href: "/dashboard", label: "Dashboard", module: "dashboard" as PlanModule },
      { href: "/sales/appointments", label: "Calendar", module: "appointments" as PlanModule },
      { href: "/attendance", label: "My Time", module: "attendance" as PlanModule },
      { href: "/reports", label: "Reports", module: "reports" as PlanModule },
      { href: "/team/members", label: "Staff", module: "staff" as PlanModule },
      { href: "/clients", label: "Customers", module: "customers" as PlanModule },
    ];
    const filtered = filterEmployeeNavModules(items, new Set());
    assert.deepEqual(
      filtered.map((item) => item.label),
      ["Dashboard"]
    );
  });

  it("keeps Customers only when customers.view is granted", () => {
    const items = [
      { href: "/dashboard", label: "Dashboard", module: "dashboard" as PlanModule },
      { href: "/clients", label: "Customers", module: "customers" as PlanModule },
    ];
    const without = filterEmployeeNavModules(items, new Set());
    const withView = filterEmployeeNavModules(
      items,
      new Set(["customers.view"])
    );
    assert.deepEqual(
      without.map((item) => item.label),
      ["Dashboard"]
    );
    assert.deepEqual(
      withView.map((item) => item.label),
      ["Dashboard", "Customers"]
    );
  });
});
