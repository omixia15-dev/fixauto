import assert from "node:assert/strict";
import test from "node:test";
import { cloneInitialDemoData } from "../src/demo-data/sample-data.ts";
import {
  approveEstimate,
  authorizeAssessment,
  declineEstimate,
  getCasePhase,
  getCurrentEstimate,
  publishEstimate,
  recordEstimateReminder,
  recordAuthorizedIncurredCost,
  recordInitialAssessment,
  recordPaymentAttempt,
  refundUnspentAdvance,
  submitServiceRequest,
  type EstimateLineInput,
} from "../src/domain/sample-case.ts";

const now = "2026-09-13T08:00:00.000Z";
const input = {
  contactName: "Estimate Customer", mobile: "+98 900 555 0199", make: "Kia", model: "Sportage", year: "2022",
  symptoms: "The steering wheel vibrates above 80 km/h.", preferredDate: "2026-09-15", preferredTime: "10:30",
  serviceMode: "expert-visit" as const, visitAddress: "Sample Boulevard, Kerman",
};
const lines: EstimateLineInput[] = [
  { id: "part", category: "part", description: "Brake pad set", quantity: 1, unitPriceCents: 20000, part: { brand: "Bosch", condition: "new", warranty: "12 months" } },
  { id: "labor", category: "labor", description: "Replacement labor", quantity: 1, unitPriceCents: 15000 },
  { id: "fee", category: "management-fee", description: "Coordination fee", quantity: 1, unitPriceCents: 2500 },
];

function prepared() {
  const result = submitServiceRequest(cloneInitialDemoData(), input, { caseId: "estimate-case", reference: "FXA-1999" }, now, "2026-09-13");
  let data = { ...result.data, cases: result.data.cases.map((item) => item.id === result.sampleCase.id ? { ...item, request: { ...item.request, confirmedAppointment: { date: item.request.preferredDate, time: item.request.preferredTime, coordinator: "Leila", confirmedAt: now } } } : item) };
  data = authorizeAssessment(data, result.sampleCase.id, "Simulated customer", now);
  data = recordPaymentAttempt(data, result.sampleCase.id, { id: "assessment", purpose: "assessment", label: "Assessment", amountCents: 4500, currency: "USD", outcome: "simulated-success", attemptedAt: now, estimateVersionId: null });
  data = recordInitialAssessment(data, result.sampleCase.id, { expertName: "Arman", findings: "No deeper investigation is required for this sample.", needsInvestigation: false }, now);
  return { data, caseId: result.sampleCase.id };
}

test("estimate approval and repair advance are bound to the exact immutable version", () => {
  const preparedCase = prepared();
  let data = publishEstimate(preparedCase.data, preparedCase.caseId, { expectedTiming: "3 days", lines }, "Fixauto staff", now);
  const v1 = getCurrentEstimate(data.cases[1])!;
  assert.equal(getCasePhase(data.cases[1]), "estimate-approval-required");
  data = approveEstimate(data, preparedCase.caseId, v1.id, "Simulated customer", now);
  assert.equal(getCasePhase(data.cases[1]), "estimate-payment-required");
  assert.throws(() => recordPaymentAttempt(data, preparedCase.caseId, { id: "stale", purpose: "repair-advance", label: "Advance", amountCents: v1.totalCents, currency: "USD", outcome: "simulated-success", attemptedAt: now, estimateVersionId: "estimate-999" }), /current estimate version/);
  data = recordPaymentAttempt(data, preparedCase.caseId, { id: "advance-v1", purpose: "repair-advance", label: "Advance", amountCents: v1.totalCents, currency: "USD", outcome: "simulated-success", attemptedAt: now, estimateVersionId: v1.id });
  assert.equal(getCasePhase(data.cases[1]), "repair-ready");
  data = publishEstimate(data, preparedCase.caseId, { expectedTiming: "5 days", lines: lines.map((line) => ({ ...line, unitPriceCents: line.unitPriceCents + 1000 })) }, "Fixauto staff", now);
  const v2 = getCurrentEstimate(data.cases[1])!;
  assert.notEqual(v2.id, v1.id);
  assert.equal(getCasePhase(data.cases[1]), "estimate-approval-required");
  assert.throws(() => recordPaymentAttempt(data, preparedCase.caseId, { id: "old", purpose: "repair-advance", label: "Advance", amountCents: v1.totalCents, currency: "USD", outcome: "simulated-success", attemptedAt: now, estimateVersionId: v1.id }), /current estimate version/);
});

test("reminders do not imply consent and declined estimates can record a bounded simulated refund", () => {
  const preparedCase = prepared();
  let data = publishEstimate(preparedCase.data, preparedCase.caseId, { expectedTiming: "3 days", lines }, "Fixauto staff", now);
  const estimate = getCurrentEstimate(data.cases[1])!;
  data = recordEstimateReminder(data, preparedCase.caseId, estimate.id, "2026-09-14T08:00:00.000Z");
  assert.equal(getCasePhase(data.cases[1]), "estimate-unanswered");
  assert.throws(() => recordPaymentAttempt(data, preparedCase.caseId, { id: "silence", purpose: "repair-advance", label: "Advance", amountCents: estimate.totalCents, currency: "USD", outcome: "simulated-success", attemptedAt: now, estimateVersionId: estimate.id }), /approval/);
  data = approveEstimate(data, preparedCase.caseId, estimate.id, "Simulated customer", now);
  data = recordPaymentAttempt(data, preparedCase.caseId, { id: "advance", purpose: "repair-advance", label: "Advance", amountCents: estimate.totalCents, currency: "USD", outcome: "simulated-success", attemptedAt: now, estimateVersionId: estimate.id });
  data = declineEstimate(data, preparedCase.caseId, estimate.id, "Scope changed", "Simulated customer", now);
  assert.equal(getCasePhase(data.cases[1]), "estimate-declined");
  data = recordAuthorizedIncurredCost(data, preparedCase.caseId, estimate.id, { description: "Authorized parts reservation", amountCents: 5000, authorizedBy: "Simulated customer" }, now);
  data = refundUnspentAdvance(data, preparedCase.caseId, estimate.id, now);
  assert.equal(data.cases[1].estimateRefunds[0].unspentCents, estimate.totalCents - 5000);
});
