import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseCheckInStaffAssignments,
  primaryCheckInEmployeeId,
  queueServiceCreates,
  queueServiceCreatesFromAppointmentLines,
  parseStaffQuery,
} from "./check-in-staff";

describe("check-in staff assignments", () => {
  it("reads per-service staff and falls back to one employee", () => {
    const formData = new FormData();
    formData.set("staff_cut", "jordan");
    const assignments = parseCheckInStaffAssignments(
      formData,
      ["cut", "color"],
      "sam"
    );
    assert.deepEqual(assignments, { cut: "jordan", color: "sam" });
    assert.equal(primaryCheckInEmployeeId(assignments), "jordan");
  });

  it("keeps only staff that belong to the salon", () => {
    assert.deepEqual(
      queueServiceCreates(
        ["cut", "color"],
        { cut: "jordan", color: "unknown" },
        new Set(["jordan"])
      ),
      [{ serviceId: "cut", employeeId: "jordan" }, { serviceId: "color" }]
    );
  });

  it("stamps appointment line staff onto queue services", () => {
    assert.deepEqual(
      queueServiceCreatesFromAppointmentLines(
        ["cut", "color"],
        [
          { serviceId: "cut", employeeId: "jordan" },
          { serviceId: "color", employeeId: null },
        ]
      ),
      [{ serviceId: "cut", employeeId: "jordan" }, { serviceId: "color" }]
    );
  });

  it("parses staff query pairs", () => {
    assert.deepEqual(parseStaffQuery("cut:jordan,color:sam"), {
      cut: "jordan",
      color: "sam",
    });
  });
});
