import assert from "node:assert/strict";
import test from "node:test";
import { cloneInitialDemoData as cloneAllSamples } from "../src/demo-data/sample-data.ts";
import {
  authorizeAssessment,
  authorizeDeeperInvestigation,
  confirmRequestedAppointment,
  declineFurtherService,
  getCasePhase,
  recordInitialAssessment,
  recordPaymentAttempt,
  submitServiceRequest,
  validateServiceRequest,
  type PaymentOutcome,
  type PaymentPurpose,
  type ServiceRequestInput,
} from "../src/domain/sample-case.ts";

const today = "2026-09-13";
const now = "2026-09-13T08:00:00.000Z";
const validInput: ServiceRequestInput = {
  contactName: "Sara Ahmadi",
  mobile: "+98 900 555 0102",
  make: "Kia",
  model: "Sportage",
  year: "2022",
  symptoms: "The steering wheel vibrates above 80 km/h.",
  preferredDate: "2026-09-15",
  preferredTime: "10:30",
  serviceMode: "expert-visit",
  visitAddress: "Sample Boulevard, Kerman",
};

function newCase() {
  return submitServiceRequest(
    cloneInitialDemoData(),
    validInput,
    { caseId: "case-request-002", reference: "FXA-1002" },
    now,
    today,
  );
}

function payment(purpose: PaymentPurpose, outcome: PaymentOutcome, id: string) {
  return {
    id,
    purpose,
    label: purpose === "assessment" ? "Illustrative assessment fee" : "Illustrative investigation fee",
    amountCents: purpose === "assessment" ? 4500 : 8500,
    currency: "USD" as const,
    outcome,
    attemptedAt: now,
    estimateVersionId: null,
  };
}

test("request validation returns field-specific errors without changing input", () => {
  const invalidInput = { ...validInput, contactName: "", mobile: "x", year: "1970", symptoms: "short", preferredDate: "2020-01-01", preferredTime: "", visitAddress: "" };
  const errors = validateServiceRequest(invalidInput, today);
  assert.deepEqual(Object.keys(errors).sort(), ["contactName", "mobile", "preferredDate", "preferredTime", "symptoms", "visitAddress", "year"]);
  assert.equal(invalidInput.make, validInput.make);
});

test("request validation rejects impossible dates, times, mobiles, and a collection without an address", () => {
  const errors = validateServiceRequest({
    ...validInput,
    mobile: "+-------",
    preferredDate: "2026-99-99",
    preferredTime: "99:99",
    serviceMode: "collection-request",
    visitAddress: "",
  }, today);
  assert.deepEqual(Object.keys(errors).sort(), ["mobile", "preferredDate", "preferredTime", "visitAddress"]);
  assert.match(errors.visitAddress ?? "", /collection address/);
});

test("valid submission creates a new pending case and staff confirmation does not authorize it", () => {
  const result = newCase();
  assert.equal(result.sampleCase.reference, "FXA-1002");
  assert.equal(result.data.cases.length, 2);
  assert.equal(getCasePhase(result.sampleCase), "pending-staff-confirmation");

  const confirmed = confirmRequestedAppointment(result.data, result.sampleCase.id, "Leila Moradi", now);
  assert.equal(getCasePhase(confirmed.cases[1]), "assessment-authorization-required");
  assert.equal(confirmed.cases[1].assessment.authorizedAt, null);
});

test("failed and canceled assessment payments remain history and cannot unlock the visit", () => {
  const result = newCase();
  let data = confirmRequestedAppointment(result.data, result.sampleCase.id, "Leila Moradi", now);
  data = authorizeAssessment(data, result.sampleCase.id, "Simulated customer", now);
  data = recordPaymentAttempt(data, result.sampleCase.id, payment("assessment", "simulated-failed", "pay-1"));
  data = recordPaymentAttempt(data, result.sampleCase.id, payment("assessment", "simulated-canceled", "pay-2"));
  assert.equal(getCasePhase(data.cases[1]), "assessment-payment-required");
  assert.equal(data.cases[1].payments.length, 2);
  assert.throws(
    () => recordInitialAssessment(data, result.sampleCase.id, { expertName: "Arman", findings: "Inspection could not begin.", needsInvestigation: false }, now),
    /successful payment/,
  );
});

test("a payment attempt must match the disclosed fee", () => {
  const result = newCase();
  let data = confirmRequestedAppointment(result.data, result.sampleCase.id, "Leila Moradi", now);
  data = authorizeAssessment(data, result.sampleCase.id, "Simulated customer", now);
  assert.throws(
    () => recordPaymentAttempt(data, result.sampleCase.id, {
      ...payment("assessment", "simulated-success", "pay-wrong"),
      amountCents: 1,
    }),
    /match the disclosed scope and fee/,
  );
  assert.equal(data.cases[1].payments.length, 0);
});

test("successful payment unlocks assessment and deeper investigation has a separate gate", () => {
  const result = newCase();
  let data = confirmRequestedAppointment(result.data, result.sampleCase.id, "Leila Moradi", now);
  data = authorizeAssessment(data, result.sampleCase.id, "Simulated customer", now);
  data = recordPaymentAttempt(data, result.sampleCase.id, payment("assessment", "simulated-success", "pay-1"));
  assert.equal(getCasePhase(data.cases[1]), "assessment-ready");
  data = recordInitialAssessment(data, result.sampleCase.id, { expertName: "Arman Karimi", findings: "Workshop investigation is recommended.", needsInvestigation: true }, now);
  assert.equal(data.cases[1].assessment.feeEarned, true);
  assert.equal(getCasePhase(data.cases[1]), "investigation-authorization-required");
  data = authorizeDeeperInvestigation(data, result.sampleCase.id, "Simulated customer", now);
  assert.equal(getCasePhase(data.cases[1]), "investigation-payment-required");
  data = recordPaymentAttempt(data, result.sampleCase.id, payment("investigation", "simulated-success", "pay-2"));
  assert.equal(getCasePhase(data.cases[1]), "investigation-funded");
  assert.throws(
    () => declineFurtherService(data, result.sampleCase.id, now),
    /cannot be closed in the D2 sample workflow/,
  );
});

test("declining after assessment preserves earned fee and payment history", () => {
  const result = newCase();
  let data = confirmRequestedAppointment(result.data, result.sampleCase.id, "Leila Moradi", now);
  data = authorizeAssessment(data, result.sampleCase.id, "Simulated customer", now);
  data = recordPaymentAttempt(data, result.sampleCase.id, payment("assessment", "simulated-success", "pay-1"));
  data = recordInitialAssessment(data, result.sampleCase.id, { expertName: "Arman Karimi", findings: "No deeper investigation is required.", needsInvestigation: false }, now);
  data = declineFurtherService(data, result.sampleCase.id, now);
  assert.equal(getCasePhase(data.cases[1]), "further-service-declined");
  assert.equal(data.cases[1].assessment.feeEarned, true);
  assert.equal(data.cases[1].assessment.authorizer, "Simulated customer");
  assert.equal(data.cases[1].assessment.authorizedAt, now);
  assert.equal(data.cases[1].payments[0].outcome, "simulated-success");
  assert.match(data.cases[1].assessment.findings ?? "", /No deeper/);
});

test("declining a recommended investigation blocks later authorization and payments", () => {
  const result = newCase();
  let data = confirmRequestedAppointment(result.data, result.sampleCase.id, "Leila Moradi", now);
  data = authorizeAssessment(data, result.sampleCase.id, "Simulated customer", now);
  data = recordPaymentAttempt(data, result.sampleCase.id, payment("assessment", "simulated-success", "pay-1"));
  data = recordInitialAssessment(data, result.sampleCase.id, {
    expertName: "Arman Karimi",
    findings: "Workshop investigation is recommended.",
    needsInvestigation: true,
  }, now);
  data = declineFurtherService(data, result.sampleCase.id, now);

  assert.throws(
    () => authorizeDeeperInvestigation(data, result.sampleCase.id, "Simulated customer", now),
    /Further service was declined/,
  );
  const forcedAuthorization = structuredClone(data);
  forcedAuthorization.cases[1].assessment.investigation.authorizedAt = now;
  assert.throws(
    () => recordPaymentAttempt(forcedAuthorization, result.sampleCase.id, payment("investigation", "simulated-success", "pay-2")),
    /Further service was declined/,
  );
});

function cloneInitialDemoData() { const data = cloneAllSamples(); return { ...data, cases: data.cases.slice(0, 1) }; }
