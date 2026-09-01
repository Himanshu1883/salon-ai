import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prepareWhatsAppMessage } from "./sanitize-message";

const FULL_REVIEW_URL =
  "https://www.google.com/maps/place//@28.6582304,77.1417653,17z/data=!3m1!4b1!4m3!3m2!1s0x390d03d6693286f5:0x1ce8d8899e842458!12e1?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D";

describe("prepareWhatsAppMessage", () => {
  it("sends the full Google Maps place URL unchanged", () => {
    const message = `We'd love a review:
${FULL_REVIEW_URL}

We hope to see you again ❤️`;

    const prepared = prepareWhatsAppMessage(message);
    assert.ok(prepared.includes(FULL_REVIEW_URL));
    assert.ok(prepared.includes("0x390d03d6693286f5:0x1ce8d8899e842458"));
    assert.ok(prepared.includes("entry=ttu"));
    assert.ok(prepared.includes("g_ep="));
    assert.doesNotMatch(prepared, /maps\/search\//);
  });
});
