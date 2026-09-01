import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addDaysToKey,
  getAppointmentsPageWindows,
  resolveAppointmentsRangeStart,
} from "./page-windows";

describe("getAppointmentsPageWindows", () => {
  it("starts from today for the next 7 days instead of last week", () => {
    const now = new Date("2026-09-01T08:15:00.000Z");
    const windows = getAppointmentsPageWindows("2026-08-24", now);

    assert.equal(windows.includeToday, true);
    assert.equal(windows.todayKey, "2026-09-01");
    assert.equal(windows.weekStart.toISOString().startsWith("2026-09-01"), true);
    assert.equal(windows.weekEnd.toISOString().startsWith("2026-09-07"), true);
  });

  it("does not fetch today's list when viewing a future 7-day window", () => {
    const now = new Date("2026-09-01T08:15:00.000Z");
    const windows = getAppointmentsPageWindows("2026-09-14", now);

    assert.equal(windows.includeToday, false);
    assert.equal(windows.upcomingStart.getTime(), windows.weekStart.getTime());
  });
});

describe("resolveAppointmentsRangeStart", () => {
  it("clamps past dates to today", () => {
    const now = new Date("2026-09-01T08:15:00.000Z");
    assert.equal(resolveAppointmentsRangeStart("2026-08-24", now), "2026-09-01");
    assert.equal(resolveAppointmentsRangeStart(undefined, now), "2026-09-01");
    assert.equal(resolveAppointmentsRangeStart("2026-09-08", now), "2026-09-08");
  });

  it("adds days on the calendar key without timezone drift", () => {
    assert.equal(addDaysToKey("2026-09-01", 6), "2026-09-07");
    assert.equal(addDaysToKey("2026-09-01", 7), "2026-09-08");
  });
});
