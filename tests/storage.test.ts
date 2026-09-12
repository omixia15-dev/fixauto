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
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.cases[0].reference, "FXA-1001");
  assert.equal(migrated.cases[0].sharedNote, "Keep my D1 note");
  assert.equal(migrated.cases[0].assessment.authorizedAt, null);
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
