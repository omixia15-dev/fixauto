import assert from "node:assert/strict";
import test from "node:test";
import { cloneInitialDemoData } from "../src/demo-data/sample-data.ts";
import {
  authorizeAssessment,
  authorizeDeeperInvestigation,
  confirmRequestedAppointment,
  getActiveCarCount,
  getAvailableAdvanceCredit,
  getCasePhase,
  recordInitialAssessment,
  recordInvestigationCompletion,
  recordPaymentAttempt,
  submitServiceRequest,
} from "../src/domain/sample-case.ts";

const now = "2026-09-13T08:00:00.000Z";
const input = (mobile: string) => ({ contactName: "Issue 15 Customer", mobile, make: "Kia", model: "Sportage", year: "2022", symptoms: "The steering wheel vibrates above 80 km/h.", preferredDate: "2026-09-15", preferredTime: "10:30", serviceMode: "expert-visit" as const, visitAddress: "Sample Boulevard, Kerman" });

test("confirmed expert visits reserve the single slot while pending requests do not", () => {
  let data = cloneInitialDemoData();
  const first = submitServiceRequest(data, input("+98 900 555 0301"), { caseId: "issue15-first", reference: "FXA-3001" }, now, "2026-09-13");
  data = first.data;
  data = confirmRequestedAppointment(data, first.sampleCase.id, "Leila Moradi", now);
  assert.equal(getActiveCarCount(data), 1);
  const second = submitServiceRequest(data, input("+98 900 555 0302"), { caseId: "issue15-second", reference: "FXA-3002" }, now, "2026-09-13");
  assert.equal(getActiveCarCount(second.data), 1);
  assert.throws(() => confirmRequestedAppointment(second.data, second.sampleCase.id, "Leila Moradi", now), /single active service slot/);
});

test("paid investigation completion unlocks the estimate while preserving its history", () => {
  const created = submitServiceRequest(cloneInitialDemoData(), input("+98 900 555 0303"), { caseId: "issue15-investigation", reference: "FXA-3003" }, now, "2026-09-13");
  let data = confirmRequestedAppointment(created.data, created.sampleCase.id, "Leila Moradi", now);
  data = authorizeAssessment(data, created.sampleCase.id, "Simulated customer", now);
  data = recordPaymentAttempt(data, created.sampleCase.id, { id: "issue15-assessment", purpose: "assessment", label: "Assessment", amountCents: 4500, currency: "USD", outcome: "simulated-success", attemptedAt: now, estimateVersionId: null });
  data = recordInitialAssessment(data, created.sampleCase.id, { expertName: "Arman Karimi", findings: "Deeper workshop investigation is required for this sample.", needsInvestigation: true }, now);
  data = authorizeDeeperInvestigation(data, created.sampleCase.id, "Simulated customer", now);
  data = recordPaymentAttempt(data, created.sampleCase.id, { id: "issue15-investigation", purpose: "investigation", label: "Investigation", amountCents: 8500, currency: "USD", outcome: "simulated-success", attemptedAt: now, estimateVersionId: null });
  assert.equal(getCasePhase(data.cases.at(-1)!), "investigation-funded");
  data = recordInvestigationCompletion(data, created.sampleCase.id, { expertName: "Nima Farhadi", findings: "Measured vibration confirms the approved repair scope." }, now);
  assert.equal(getCasePhase(data.cases.at(-1)!), "estimate-required");
  assert.equal(data.cases.at(-1)?.assessment.investigation.authorizedAt, now);
  assert.equal(data.cases.at(-1)?.assessment.investigation.completedAt, now);
});

test("credit available balance conserves funding, allocations, incurred costs, and refunds", () => {
  const sample = cloneInitialDemoData().cases[0];
  const withFunds = { ...sample, payments: [
    { id: "p1", purpose: "repair-advance" as const, label: "Advance", amountCents: 32000, currency: "USD" as const, outcome: "simulated-success" as const, attemptedAt: now, estimateVersionId: "v1" },
  ], advanceCreditAllocations: [], authorizedIncurredCosts: [{ id: "c1", estimateVersionId: "v1", description: "Parts", amountCents: 12000, currency: "USD" as const, authorizedBy: "Staff", recordedAt: now }], estimateRefunds: [] };
  assert.equal(getAvailableAdvanceCredit(withFunds), 20000);
  assert.equal(getAvailableAdvanceCredit({ ...withFunds, estimateRefunds: [{ id: "r1", estimateVersionId: "v1", fundedCents: 32000, authorizedIncurredCents: 12000, unspentCents: 20000, processedAt: now, currency: "USD" as const, simulated: true }] }), 0);
});
