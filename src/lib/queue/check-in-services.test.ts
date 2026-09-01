import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  durationWhere,
  parseCheckInServicesQuery,
  searchWhere,
} from "./check-in-services";
import {
  categoryMatchesTop,
  matchingCategoryIds,
  visibleTopCategories,
} from "./check-in-service-filters";

describe("parseCheckInServicesQuery", () => {
  it("defaults to all services first page", () => {
    const query = parseCheckInServicesQuery(new URLSearchParams());
    assert.equal(query.page, 1);
    assert.equal(query.pageSize, 12);
    assert.equal(query.category, "All");
    assert.equal(query.duration, "any");
    assert.deepEqual(query.ids, []);
  });

  it("clamps page size and parses filters", () => {
    const query = parseCheckInServicesQuery(
      new URLSearchParams(
        "page=2&pageSize=200&q=bala&category=Hair&categoryId=cat1&duration=quick&ids=a,b"
      )
    );
    assert.equal(query.page, 2);
    assert.equal(query.pageSize, 48);
    assert.equal(query.q, "bala");
    assert.equal(query.category, "Hair");
    assert.equal(query.categoryId, "cat1");
    assert.equal(query.duration, "quick");
    assert.deepEqual(query.ids, ["a", "b"]);
  });
});

describe("check-in service filters", () => {
  it("builds duration ranges", () => {
    assert.deepEqual(durationWhere("quick"), { duration: { lte: 30 } });
    assert.deepEqual(durationWhere("standard"), {
      duration: { gte: 31, lte: 90 },
    });
    assert.deepEqual(durationWhere("long"), { duration: { gte: 91 } });
    assert.equal(durationWhere("any"), undefined);
  });

  it("searches name and category", () => {
    assert.equal(searchWhere(""), undefined);
    assert.deepEqual(searchWhere("cut"), {
      OR: [
        { name: { contains: "cut", mode: "insensitive" } },
        { category: { name: { contains: "cut", mode: "insensitive" } } },
      ],
    });
  });
});

describe("check-in top categories", () => {
  it("maps catalog names to Hair, Facial, Nails, and Packages", () => {
    assert.equal(categoryMatchesTop("Hair Cuts & Styling", "Hair"), true);
    assert.equal(categoryMatchesTop("Blow Dry", "Hair"), true);
    assert.equal(categoryMatchesTop("Manicure", "Hair"), false);
    assert.equal(categoryMatchesTop("Clean UP", "Facial"), true);
    assert.equal(categoryMatchesTop("Manicure", "Nails"), true);
    assert.equal(categoryMatchesTop("Combo Package 1", "Packages"), true);
    assert.equal(categoryMatchesTop("Hair & styling", "Styling"), true);
  });

  it("shows only top tabs that exist in the catalog", () => {
    assert.deepEqual(
      visibleTopCategories([
        { name: "Hair Cuts & Styling" },
        { name: "Manicure" },
        { name: "Combo Package 1" },
      ]),
      ["Hair", "Styling", "Nails", "Packages"]
    );
    assert.deepEqual(
      matchingCategoryIds(
        [
          { id: "1", name: "Blow Dry" },
          { id: "2", name: "Manicure" },
        ],
        "Hair"
      ),
      ["1"]
    );
  });
});
