import assert from "node:assert/strict";
import test from "node:test";
import { cloneInitialDemoData } from "../src/demo-data/sample-data.ts";
import { approveEstimate, authorizeAssessment, getCasePhase, getCurrentEstimate, issueRecords, publishEstimate, recordFinalPayment, recordInitialAssessment, recordPaymentAttempt, recordPerformedWork, recordQualityCheck, recordReturn, recordSettlement, submitServiceRequest, type EstimateLineInput } from "../src/domain/sample-case.ts";

const now = "2026-09-13T08:00:00.000Z";
const lines: EstimateLineInput[] = [
  { id: "part", category: "part", description: "Part", quantity: 1, unitPriceCents: 20000, part: { brand: "Bosch", condition: "new", warranty: "12 months" } },
  { id: "labor", category: "labor", description: "Labor", quantity: 1, unitPriceCents: 10000 },
  { id: "fee", category: "management-fee", description: "Fee", quantity: 1, unitPriceCents: 2000 },
];

function ready() {
  const input = { contactName: "D5 Customer", mobile: "+98 900 555 0197", make: "Kia", model: "Sportage", year: "2022", symptoms: "The steering wheel vibrates above 80 km/h.", preferredDate: "2026-09-15", preferredTime: "10:30", serviceMode: "expert-visit" as const, visitAddress: "Sample Boulevard, Kerman" };
  const created = submitServiceRequest(cloneInitialDemoData(), input, { caseId: "d5-case", reference: "FXA-1998" }, now, "2026-09-13");
  let data = { ...created.data, cases: created.data.cases.map((item) => item.id === created.sampleCase.id ? { ...item, request: { ...item.request, confirmedAppointment: { date: item.request.preferredDate, time: item.request.preferredTime, coordinator: "Leila", confirmedAt: now } } } : item) };
  data = authorizeAssessment(data, created.sampleCase.id, "Customer", now);
  data = recordPaymentAttempt(data, created.sampleCase.id, { id: "assessment", purpose: "assessment", label: "Assessment", amountCents: 4500, currency: "USD", outcome: "simulated-success", attemptedAt: now, estimateVersionId: null });
  data = recordInitialAssessment(data, created.sampleCase.id, { expertName: "Arman", findings: "No deeper investigation is required for this sample.", needsInvestigation: false }, now);
  data = publishEstimate(data, created.sampleCase.id, { expectedTiming: "3 days", lines }, "Staff", now);
  const estimate = getCurrentEstimate(data.cases[1])!;
  data = approveEstimate(data, created.sampleCase.id, estimate.id, "Customer", now);
  data = recordPaymentAttempt(data, created.sampleCase.id, { id: "advance", purpose: "repair-advance", label: "Advance", amountCents: estimate.totalCents, currency: "USD", outcome: "simulated-success", attemptedAt: now, estimateVersionId: estimate.id });
  return { data, caseId: created.sampleCase.id, estimate };
}

test("failed quality remains history, reassessment passes, and return requires settlement", () => {
  const prepared = ready();
  let data = recordPerformedWork(prepared.data, prepared.caseId, prepared.estimate.id, "Approved work completed.", "Specialist", now);
  data = recordQualityCheck(data, prepared.caseId, prepared.estimate.id, { specialist: "Inspector", result: "failed", findings: "Brake noise remains." }, now);
  assert.equal(getCasePhase(data.cases[1]), "quality-recheck-required");
  assert.throws(() => recordReturn(data, prepared.caseId, { recipientName: "D5 Customer", recipientAuthority: "owner", authorizationEvidence: null, condition: "Good", mileage: 1, keys: "One key", coordinator: "Coordinator" }, now), /quality check and settled/);
  data = recordPerformedWork(data, prepared.caseId, prepared.estimate.id, "Corrective adjustment completed.", "Specialist", "2026-09-14T08:00:00.000Z");
  data = recordQualityCheck(data, prepared.caseId, prepared.estimate.id, { specialist: "Inspector", result: "passed", findings: "Brake operation verified." }, "2026-09-14T09:00:00.000Z");
  data = recordSettlement(data, prepared.caseId, prepared.estimate.id, "Coordinator", now);
  data = recordReturn(data, prepared.caseId, { recipientName: "D5 Customer", recipientAuthority: "owner", authorizationEvidence: null, condition: "Good condition at return.", mileage: 81234, keys: "One ignition key", coordinator: "Coordinator" }, now);
  assert.equal(getCasePhase(data.cases[1]), "completed");
  data = issueRecords(data, prepared.caseId, now);
  assert.equal(data.cases[1].invoices.length, 1);
  assert.equal(data.cases[1].warranties.length, 1);
});

test("zero-balance settlement does not fabricate a final payment", () => {
  const prepared = ready();
  let data = recordPerformedWork(prepared.data, prepared.caseId, prepared.estimate.id, "Approved work completed.", "Specialist", now);
  data = recordQualityCheck(data, prepared.caseId, prepared.estimate.id, { specialist: "Inspector", result: "passed", findings: "All checks passed." }, now);
  data = recordSettlement(data, prepared.caseId, prepared.estimate.id, "Coordinator", now);
  assert.throws(() => recordFinalPayment(data, prepared.caseId, { id: "zero", estimateVersionId: prepared.estimate.id, amountCents: 0, currency: "USD", outcome: "simulated-success", attemptedAt: now }), /No final payment is due/);
});
