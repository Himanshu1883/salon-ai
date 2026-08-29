import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getUpcomingTodayAppointments } from "./upcoming-today";

describe("getUpcomingTodayAppointments", () => {
  it("keeps an overdue first booking when a later one is still upcoming", () => {
    const now = new Date("2026-08-29T16:00:00");
    const result = getUpcomingTodayAppointments(
      [
        {
          id: "first",
          scheduledAt: "2026-08-29T13:00:00",
          status: "scheduled",
        },
        {
          id: "second",
          scheduledAt: "2026-08-29T16:00:00",
          status: "scheduled",
        },
      ],
      now
    );

    assert.deepEqual(
      result.items.map((item) => item.id),
      ["first", "second"]
    );
    assert.equal(result.nextId, "first");
  });

  it("drops reached, walk-in, billed, and completed visits", () => {
    const result = getUpcomingTodayAppointments([
      { id: "reached", scheduledAt: "2026-08-29T10:00:00", status: "checked_in" },
      { id: "done", scheduledAt: "2026-08-29T11:00:00", status: "completed" },
      { id: "waiting", scheduledAt: "2026-08-29T16:00:00", status: "scheduled" },
    ]);

    assert.deepEqual(
      result.items.map((item) => item.id),
      ["waiting"]
    );
    assert.equal(result.nextId, "waiting");
  });
});
