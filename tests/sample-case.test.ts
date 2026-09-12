import assert from "node:assert/strict";
import test from "node:test";
import {
  updateSharedNote,
} from "../src/domain/sample-case.ts";
import {
  cloneInitialDemoData,
  initialDemoData,
} from "../src/demo-data/sample-data.ts";
import { formatMoney } from "../src/domain/currency.ts";

test("the seed is explicit sample data with a stable case and USD amount", () => {
  const sampleCase = initialDemoData.cases[0];

  assert.equal(initialDemoData.schemaVersion, 2);
  assert.equal(sampleCase.id, "case-atlas-001");
  assert.equal(sampleCase.reference, "FXA-1001");
  assert.equal(sampleCase.assessment.currency, "USD");
  assert.equal(sampleCase.payments.length, 0);
  assert.equal(sampleCase.smsLog[0].simulated, true);
  assert.equal(formatMoney(sampleCase.assessment.feeCents, "USD"), "$45.00");
});

test("updating the shared note returns a new record and preserves the seed", () => {
  const before = cloneInitialDemoData();
  const after = updateSharedNote(before, "case-atlas-001", "  Updated sample note.  ");

  assert.equal(after.cases[0].sharedNote, "Updated sample note.");
  assert.equal(before.cases[0].sharedNote, initialDemoData.cases[0].sharedNote);
  assert.notEqual(after, before);
});

test("shared note validation rejects empty, oversized, and unknown-case updates", () => {
  const data = cloneInitialDemoData();

  assert.throws(() => updateSharedNote(data, "case-atlas-001", "   "), /1 to 160/);
  assert.throws(() => updateSharedNote(data, "case-atlas-001", "x".repeat(161)), /1 to 160/);
  assert.throws(() => updateSharedNote(data, "missing", "Valid note"), /could not be found/);
});
