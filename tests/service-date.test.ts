import assert from "node:assert/strict";
import test from "node:test";
import { serviceDateFromIso } from "../src/domain/sample-case.ts";

test("service date uses Asia/Tehran after UTC midnight boundary", () => {
  assert.equal(serviceDateFromIso("2026-09-13T20:29:59.000Z"), "2026-09-13");
  assert.equal(serviceDateFromIso("2026-09-13T20:30:00.000Z"), "2026-09-14");
});
