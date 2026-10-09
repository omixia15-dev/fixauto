import assert from "node:assert/strict";
import test from "node:test";
import {
  approveEstimate,
  authorizeAssessment,
  getCasePhase,
  getCurrentEstimate,
  recordPaymentAttempt,
  recordReturn,
} from "../src/domain/sample-case.ts";
import { cloneInitialDemoData } from "../src/demo-data/sample-data.ts";
import {
  DEMO_STORAGE_KEY,
  loadDemoData,
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

test("five sample cases cover the requested customer journey phases", () => {
  const data = cloneInitialDemoData();

  assert.deepEqual(data.cases.map((item) => item.reference), ["FXA-1001", "FXA-1002", "FXA-1003", "FXA-1004", "FXA-1005"]);
  assert.deepEqual(data.cases.map(getCasePhase), [
    "pending-staff-confirmation",
    "assessment-authorization-required",
    "estimate-approval-required",
    "repair-ready",
    "completed",
  ]);
  assert.equal(data.cases[0].vehicle.model, "Camry");
  assert.equal(data.cases[0].id, "case-atlas-001");
  assert.equal(data.cases[0].request.confirmedAppointment, null);
  assert.equal(data.cases[1].vehicle.model, "Tucson");
  assert.ok(data.cases[1].request.confirmedAppointment);
  assert.equal(data.cases[2].vehicle.model, "Sportage");
  assert.equal(data.cases[3].vehicle.model, "Qashqai");
  assert.equal(data.cases[4].vehicle.model, "3");
  assert.equal(data.cases[3].estimateDecisions[0]?.outcome, "approved");
  assert.equal(data.cases[3].performedWork.length, 0);
  assert.equal(data.cases[4].returns.length, 1);
});

test("sample transitions keep approval and return guards active", () => {
  const data = cloneInitialDemoData();
  const atlas = data.cases[0];
  const kia = data.cases[2];
  const nissan = data.cases[3];
  const estimate = getCurrentEstimate(kia);

  assert.throws(() => authorizeAssessment(data, atlas.id, "Simulated customer", "2026-10-09T08:00:00.000Z"), /confirm the appointment first/);
  assert.ok(estimate);
  const approvedKia = approveEstimate(data, kia.id, estimate.id, "Simulated customer", "2026-10-09T08:00:00.000Z");
  assert.equal(getCasePhase(approvedKia.cases[2]), "estimate-payment-required");
  assert.throws(() => recordPaymentAttempt(data, kia.id, {
    id: "unapproved-sample-advance",
    purpose: "repair-advance",
    label: "Illustrative repair advance",
    amountCents: estimate.totalCents,
    currency: estimate.currency,
    outcome: "simulated-success",
    attemptedAt: "2026-10-09T08:00:00.000Z",
    estimateVersionId: estimate.id,
  }), /approval is required/);
  assert.throws(() => recordReturn(data, nissan.id, {
    recipientName: "Niloofar Karimi",
    recipientAuthority: "owner",
    authorizationEvidence: null,
    condition: "Sample vehicle condition",
    mileage: 54000,
    keys: "One sample key",
    coordinator: "Sample coordinator",
  }, "2026-10-09T08:00:00.000Z"), /passing quality check and settled balance/);
});

test("sample cases round-trip through the current browser storage format", () => {
  const storage = new MemoryStorage();
  const data = cloneInitialDemoData();

  saveDemoData(storage, data);

  const restored = loadDemoData(storage);
  assert.deepEqual(restored, JSON.parse(JSON.stringify(data)));
  assert.deepEqual(restored.cases.map(getCasePhase), data.cases.map(getCasePhase));
  assert.equal(storage.getItem(DEMO_STORAGE_KEY) !== null, true);
});

test("seed clones are independent and keep generated workflow identifiers stable", () => {
  const first = cloneInitialDemoData();
  const second = cloneInitialDemoData();

  assert.deepEqual(first, second);
  first.cases[4].returns[0].condition = "Changed only in this clone.";
  assert.notEqual(first.cases[4].returns[0].condition, second.cases[4].returns[0].condition);
});
