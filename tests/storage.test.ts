import assert from "node:assert/strict";
import test from "node:test";
import { cloneInitialDemoData } from "../src/demo-data/sample-data.ts";
import { updateSharedNote } from "../src/domain/sample-case.ts";
import {
  DEMO_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  loadDemoData,
  resetDemoData,
  saveDemoData,
  type StorageAdapter,
} from "../src/store/storage.ts";

class MemoryStorage implements StorageAdapter {
  readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

test("save and load preserve one updated shared sample case", () => {
  const storage = new MemoryStorage();
  const updated = updateSharedNote(cloneInitialDemoData(), "case-atlas-001", "Persisted note");

  saveDemoData(storage, updated);

  assert.equal(loadDemoData(storage).cases[0].sharedNote, "Persisted note");
});

test("schema-one D1 data migrates without losing its case identity or shared note", () => {
  const storage = new MemoryStorage();
  storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({
    schemaVersion: 1,
    cases: [{
      id: "case-atlas-001",
      reference: "FXA-1001",
      customer: { name: "Mina Rahimi", mobile: "+98 900 000 0101" },
      vehicle: { make: "Toyota", model: "Camry", year: 2020 },
      request: { symptoms: "Warning light after warm-up", visitAddress: "Sample address" },
      sharedNote: "Keep my D1 note",
      payments: [],
      smsLog: [],
    }],
  }));

  const migrated = loadDemoData(storage);
  assert.equal(migrated.schemaVersion, 6);
  assert.equal(migrated.cases[0].reference, "FXA-1001");
  assert.equal(migrated.cases[0].sharedNote, "Keep my D1 note");
  assert.equal(migrated.cases[0].assessment.authorizedAt, null);
  assert.equal(migrated.cases[0].transport.kind, "not-required");
});

test("schema-two D2 data migrates while preserving payment history", () => {
  const storage = new MemoryStorage();
  const d2 = cloneInitialDemoData();
  storage.setItem(DEMO_STORAGE_KEY, JSON.stringify({
    ...d2,
    schemaVersion: 2,
    cases: [{ ...d2.cases[0], payments: [{ id: "pay-1", purpose: "assessment", label: "Assessment", amountCents: 4500, currency: "USD", outcome: "simulated-success", attemptedAt: "2026-09-13T08:00:00.000Z", estimateVersionId: null }] }],
  }));
  const migrated = loadDemoData(storage);
  assert.equal(migrated.schemaVersion, 6);
  assert.equal(migrated.cases[0].payments[0].id, "pay-1");
  assert.equal(migrated.cases[0].transport.kind, "not-required");
});

test("schema-three D3 data migrates transport history into the D4 estimate schema", () => {
  const storage = new MemoryStorage();
  const d3 = cloneInitialDemoData();
  const legacyPayment = { id: "transport", purpose: "transport-storage", label: "Transport", amountCents: 15500, currency: "USD", outcome: "simulated-success", attemptedAt: "2026-09-13T08:00:00.000Z" };
  storage.setItem(DEMO_STORAGE_KEY, JSON.stringify({
    ...d3,
    schemaVersion: 3,
    cases: [{ ...d3.cases[0], payments: [legacyPayment] }],
  }));
  const migrated = loadDemoData(storage);
  assert.equal(migrated.schemaVersion, 6);
  assert.equal(migrated.cases[0].payments[0].estimateVersionId, null);
  assert.deepEqual(migrated.cases[0].estimates, []);
  assert.equal(migrated.cases[0].transport.kind, d3.cases[0].transport.kind);
});

test("schema-four D4 data migrates while preserving estimate history", () => {
  const storage = new MemoryStorage();
  const d4 = cloneInitialDemoData();
  const estimate = { id: "estimate-1", version: 1, expectedTiming: "3 days", lines: [], totalCents: 0, currency: "USD", publishedAt: "2026-09-13T08:00:00.000Z", publishedBy: "Staff" };
  storage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ ...d4, schemaVersion: 4, cases: [{ ...d4.cases[0], estimates: [estimate], estimateDecisions: [], estimateReminders: [], advanceCreditAllocations: [], authorizedIncurredCosts: [], estimateRefunds: [] }] }));
  const migrated = loadDemoData(storage);
  assert.equal(migrated.schemaVersion, 6);
  assert.equal(migrated.cases[0].estimates[0].id, "estimate-1");
  assert.deepEqual(migrated.cases[0].qualityChecks, []);
});

test("schema-five D5 data migrates while preserving summaries", () => {
  const storage = new MemoryStorage();
  const d5 = cloneInitialDemoData();
  storage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ ...d5, schemaVersion: 5 }));
  const migrated = loadDemoData(storage);
  assert.equal(migrated.schemaVersion, 6);
  assert.equal(migrated.cases[0].smsLog[0].nonWorkingDay, false);
  assert.equal(migrated.cases[0].smsLog[0].summaryDate, undefined);
});

test("reset replaces only the Fixauto key and preserves unrelated browser data", () => {
  const storage = new MemoryStorage();
  storage.setItem("unrelated.application", "keep-me");
  storage.setItem(DEMO_STORAGE_KEY, "changed");

  const reset = resetDemoData(storage);

  assert.equal(storage.getItem("unrelated.application"), "keep-me");
  assert.equal(loadDemoData(storage).cases[0].sharedNote, reset.cases[0].sharedNote);
});

test("missing or unreadable data falls back to the sample seed", () => {
  const storage = new MemoryStorage();
  assert.equal(loadDemoData(storage).cases[0].reference, "FXA-1001");

  storage.setItem(DEMO_STORAGE_KEY, "not json");
  assert.equal(loadDemoData(storage).cases[0].reference, "FXA-1001");

  storage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, cases: [{}] }));
  assert.equal(loadDemoData(storage).cases[0].reference, "FXA-1001");

  const malformedCurrent = cloneInitialDemoData() as unknown as { cases: Array<{ assessment: { investigation?: unknown } }> };
  delete malformedCurrent.cases[0].assessment.investigation;
  storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(malformedCurrent));
  assert.equal(loadDemoData(storage).cases[0].assessment.investigation.feeCents, 8500);
});
