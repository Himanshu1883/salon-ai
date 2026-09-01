import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isMissingDbColumn, isRetryableDbError } from "./db-errors";

describe("isMissingDbColumn", () => {
  it("detects Prisma P2022 for the given column", () => {
    assert.equal(
      isMissingDbColumn(
        {
          code: "P2022",
          message: "The column `employeeId` does not exist in the current database.",
          meta: { modelName: "QueueService", column: "employeeId" },
        },
        "QueueService",
        "employeeId"
      ),
      true
    );
  });

  it("ignores a different missing column", () => {
    assert.equal(
      isMissingDbColumn(
        {
          code: "P2022",
          meta: { modelName: "User", column: "employeeId" },
        },
        "QueueService",
        "employeeId"
      ),
      false
    );
  });
});

describe("isRetryableDbError", () => {
  it("does not treat missing columns as connection loss", () => {
    assert.equal(
      isRetryableDbError({
        code: "P2022",
        message: "The column `employeeId` does not exist in the current database.",
      }),
      false
    );
  });
});
