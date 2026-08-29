import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isCheckInBusinessFailure } from "./check-in-from-schedule";

describe("isCheckInBusinessFailure", () => {
  it("restores only when the booking itself cannot be checked in", () => {
    assert.equal(isCheckInBusinessFailure("Appointment not found"), true);
    assert.equal(
      isCheckInBusinessFailure("Cannot check in a cancelled appointment"),
      true
    );
    assert.equal(
      isCheckInBusinessFailure("Appointment is already completed"),
      true
    );
    assert.equal(
      isCheckInBusinessFailure(
        "The appointment service is missing from the catalog. Update the booking and try again."
      ),
      true
    );
  });

  it("keeps the optimistic remove after a write that already succeeded", () => {
    assert.equal(isCheckInBusinessFailure("Could not check in. Try again."), false);
    assert.equal(isCheckInBusinessFailure("Unauthorized"), false);
    assert.equal(isCheckInBusinessFailure("Invalid request"), false);
    assert.equal(
      isCheckInBusinessFailure("This appointment is already in the queue."),
      false
    );
    assert.equal(isCheckInBusinessFailure(undefined), false);
  });
});
