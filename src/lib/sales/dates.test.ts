import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paidAtFilter, paidSalesActivityOr } from "./dates";

describe("paidSalesActivityOr", () => {
  it("returns nothing when no dates are set", () => {
    assert.equal(paidSalesActivityOr(), undefined);
  });

  it("applies the same range to paid paidAt and partial createdAt", () => {
    const or = paidSalesActivityOr("2026-08-01", "2026-08-29");
    assert.ok(or);
    assert.equal(or[0]?.status, "paid");
    assert.equal(or[1]?.status, "partial");
    assert.deepEqual(or[0]?.paidAt, paidAtFilter("2026-08-01", "2026-08-29"));
    assert.deepEqual(or[1]?.createdAt, paidAtFilter("2026-08-01", "2026-08-29"));
  });
});
