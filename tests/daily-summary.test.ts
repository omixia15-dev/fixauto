import assert from "node:assert/strict";
import test from "node:test";
import { cloneInitialDemoData } from "../src/demo-data/sample-data.ts";
import { getCasePhase, recordDailySummary } from "../src/domain/sample-case.ts";

test("daily summaries are append-only and do not alter workflow state", () => {
  const before = cloneInitialDemoData();
  const phase = getCasePhase(before.cases[0]);
  const after = recordDailySummary(before, "case-atlas-001", { situation: "Vehicle remains safely held.", nextAction: "Coordinator will update the customer.", expectedTiming: "Next staffed period", summaryDate: "2026-09-18", nonWorkingDay: true });
  assert.equal(after.cases[0].smsLog.length, before.cases[0].smsLog.length + 1);
  assert.equal(after.cases[0].smsLog.at(-1)?.nonWorkingDay, true);
  assert.equal(getCasePhase(after.cases[0]), phase);
  assert.deepEqual(after.cases[0].payments, before.cases[0].payments);
  assert.deepEqual(after.cases[0].assessment, before.cases[0].assessment);
  const beforeWithoutLog = { ...before.cases[0], smsLog: [] };
  const afterWithoutLog = { ...after.cases[0], smsLog: [] };
  assert.deepEqual(afterWithoutLog, beforeWithoutLog);
});

test("invalid summaries are rejected without changing data", () => {
  const before = cloneInitialDemoData();
  assert.throws(() => recordDailySummary(before, "case-atlas-001", { situation: "", nextAction: "", expectedTiming: "", summaryDate: "not-a-date", nonWorkingDay: true }), /daily situation/);
  assert.equal(before.cases[0].smsLog.length, 1);
});
