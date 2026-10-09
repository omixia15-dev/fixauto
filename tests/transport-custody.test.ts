import assert from "node:assert/strict";
import test from "node:test";
import { cloneInitialDemoData as cloneAllSamples } from "../src/demo-data/sample-data.ts";
import {
  assignCustodyReceiver,
  authorizeAssessment,
  authorizeTransportStorage,
  confirmRequestedAppointment,
  dispatchVehicle,
  getActiveCarCount,
  getCasePhase,
  recordCustodyHandover,
  recordInitialAssessment,
  recordPaymentAttempt,
  recordQualifiedTransportDecision,
  recordVehicleReturned,
  submitServiceRequest,
  type ServiceRequestInput,
} from "../src/domain/sample-case.ts";

const standardInput: ServiceRequestInput = {
  contactName: "Sara Ahmadi",
  mobile: "+98 900 555 0102",
  make: "Kia",
  model: "Sportage",
  year: "2022",
  symptoms: "The steering wheel vibrates above 80 km/h.",
  preferredDate: "2026-09-21",
  preferredTime: "10:30",
  serviceMode: "collection-request",
  visitAddress: "Sample Boulevard, Kerman",
};

const transportPayment = (id: string, outcome: "simulated-success" | "simulated-failed" | "simulated-canceled") => ({
  id,
  purpose: "transport-storage" as const,
  label: "Illustrative transport and storage fees",
  amountCents: 15500,
  currency: "USD" as const,
  outcome,
  attemptedAt: "2026-09-13T08:00:00.000Z",
  estimateVersionId: null,
});

function createCollection(data = cloneInitialDemoData(), input = standardInput, id = "case-collection-002", reference = "FXA-1002") {
  return submitServiceRequest(data, input, { caseId: id, reference }, "2026-09-13T08:00:00.000Z", "2026-09-13");
}

function prepareTransport(data: ReturnType<typeof createCollection>["data"], caseId: string) {
  data = confirmRequestedAppointment(data, caseId, "Leila Moradi", "2026-09-13T08:00:00.000Z");
  data = authorizeTransportStorage(data, caseId, "Simulated customer", "2026-09-13T08:00:00.000Z");
  return data;
}

test("collection transport has an independent payment gate and custody handover", () => {
  const created = createCollection();
  assert.equal(created.sampleCase.transport.kind, "standard-collection");
  let data = prepareTransport(created.data, created.sampleCase.id);
  assert.equal(getCasePhase(data.cases[1]), "transport-payment-required");
  data = recordPaymentAttempt(data, created.sampleCase.id, transportPayment("transport-failed", "simulated-failed"));
  data = recordPaymentAttempt(data, created.sampleCase.id, transportPayment("transport-canceled", "simulated-canceled"));
  assert.equal(getCasePhase(data.cases[1]), "transport-payment-required");
  assert.throws(() => recordPaymentAttempt(data, created.sampleCase.id, {
    ...transportPayment("assessment-payment", "simulated-success"),
    purpose: "assessment",
    amountCents: 4500,
    label: "Illustrative assessment fee",
  }), /authorization is required/);

  data = recordPaymentAttempt(data, created.sampleCase.id, transportPayment("transport-success", "simulated-success"));
  data = recordQualifiedTransportDecision(data, created.sampleCase.id, {
    qualifiedInputName: "Dr. Nima Farhadi",
    suitability: "uncertain",
    rationale: "Suitability is unresolved, so the safe sample path is towing.",
  }, "2026-09-13T08:00:00.000Z");
  assert.equal(data.cases[1].transport.qualifiedDecision?.path, "tow");
  data = assignCustodyReceiver(data, created.sampleCase.id, { name: "Reza Ahmadi", relation: "brother-in-law" }, "Leila Moradi", "2026-09-13T08:00:00.000Z");
  assert.equal(data.cases[1].transport.receiver?.authority, "custody-only");
  data = dispatchVehicle(data, created.sampleCase.id, "2026-09-13T08:00:00.000Z");
  assert.throws(() => recordCustodyHandover(data, created.sampleCase.id, {
    receiverName: "Different person",
    condition: "Front bumper intact; warning light noted.",
    mileage: 81234,
    keys: "One ignition key and one remote.",
    destination: "Simulated Fixauto destination",
  }, "2026-09-13T08:00:00.000Z"), /must match the assigned receiver/);
  assert.equal(getActiveCarCount(data), 1);
  data = recordCustodyHandover(data, created.sampleCase.id, {
    receiverName: "Reza Ahmadi",
    condition: "Front bumper intact; warning light noted.",
    mileage: 81234,
    keys: "One ignition key and one remote.",
    destination: "Simulated Fixauto destination",
  }, "2026-09-13T08:00:00.000Z");
  assert.equal(getCasePhase(data.cases[1]), "assessment-authorization-required");
  assert.throws(() => recordInitialAssessment(data, created.sampleCase.id, { expertName: "Arman Karimi", findings: "Transport payment must not fund assessment.", needsInvestigation: false }, "2026-09-13T10:00:00.000Z"), /authorization and successful payment/);

  const second = createCollection(data, { ...standardInput, contactName: "Niloofar Karimi", mobile: "+98 900 555 0103" }, "case-collection-003", "FXA-1003");
  let secondData = prepareTransport(second.data, second.sampleCase.id);
  secondData = recordPaymentAttempt(secondData, second.sampleCase.id, transportPayment("transport-second", "simulated-success"));
  secondData = recordQualifiedTransportDecision(secondData, second.sampleCase.id, {
    qualifiedInputName: "Dr. Nima Farhadi",
    suitability: "drive-suitable",
    rationale: "Sample qualified input says driving is suitable.",
  }, "2026-09-13T08:00:00.000Z");
  secondData = assignCustodyReceiver(secondData, second.sampleCase.id, { name: "Niloofar Karimi", relation: "customer" }, "Leila Moradi", "2026-09-13T08:00:00.000Z");
  assert.throws(() => dispatchVehicle(secondData, second.sampleCase.id, "2026-09-13T08:00:00.000Z"), /capacity is full/);

  data = recordVehicleReturned(data, created.sampleCase.id, "2026-09-14T08:00:00.000Z");
  assert.equal(getActiveCarCount(data), 0);
  const releasedSecondData = secondData.cases.map((item) => item.id === created.sampleCase.id ? data.cases[1] : item);
  secondData = { ...secondData, cases: releasedSecondData };
  secondData = dispatchVehicle(secondData, second.sampleCase.id, "2026-09-14T09:00:00.000Z");
  assert.equal(getActiveCarCount(secondData), 1);
});

test("Thursday-Friday new-customer collection is tow-only and Saturday-gated", () => {
  const thursday = { ...standardInput, preferredDate: "2026-09-17", mobile: "+98 900 555 0104" };
  const created = createCollection(cloneInitialDemoData(), thursday, "case-collection-004", "FXA-1004");
  assert.equal(created.sampleCase.transport.kind, "private-parking-exception");
  assert.equal(created.sampleCase.transport.destination, "Designated Fixauto private parking");
  assert.equal(created.sampleCase.transport.assessmentEarliestDate, "2026-09-19");
  let data = prepareTransport(created.data, created.sampleCase.id);
  data = recordPaymentAttempt(data, created.sampleCase.id, transportPayment("transport-private", "simulated-success"));
  data = recordQualifiedTransportDecision(data, created.sampleCase.id, {
    qualifiedInputName: "Dr. Nima Farhadi",
    suitability: "drive-suitable",
    rationale: "The private-parking exception overrides the normal drive input.",
  }, "2026-09-13T08:00:00.000Z");
  assert.equal(data.cases[1].transport.qualifiedDecision?.path, "tow");
  data = assignCustodyReceiver(data, created.sampleCase.id, { name: "Mina Rahimi", relation: "customer" }, "Leila Moradi", "2026-09-13T08:00:00.000Z");
  data = dispatchVehicle(data, created.sampleCase.id, "2026-09-13T08:00:00.000Z");
  data = recordCustodyHandover(data, created.sampleCase.id, {
    receiverName: "Mina Rahimi",
    condition: "No new visible damage in this simulated handover.",
    mileage: 50000,
    keys: "One key.",
    destination: "Designated Fixauto private parking",
  }, "2026-09-13T08:00:00.000Z");
  data = authorizeAssessment(data, created.sampleCase.id, "Simulated customer", "2026-09-13T08:00:00.000Z");
  data = recordPaymentAttempt(data, created.sampleCase.id, {
    id: "assessment-private",
    purpose: "assessment",
    label: "Illustrative assessment fee",
    amountCents: 4500,
    currency: "USD",
    outcome: "simulated-success",
    attemptedAt: "2026-09-13T08:00:00.000Z",
    estimateVersionId: null,
  });
  assert.throws(() => recordInitialAssessment(data, created.sampleCase.id, { expertName: "Arman Karimi", findings: "Saturday assessment is not yet available.", needsInvestigation: false }, "2026-09-17T10:00:00.000Z"), /cannot begin before 2026-09-19/);
  data = recordInitialAssessment(data, created.sampleCase.id, { expertName: "Arman Karimi", findings: "Saturday assessment was completed after the private-parking wait.", needsInvestigation: false }, "2026-09-19T10:00:00.000Z");
  assert.equal(data.cases[1].assessment.feeEarned, true);
});

test("Friday is also eligible for the private-parking exception, while a repeat customer is not", () => {
  const friday = { ...standardInput, preferredDate: "2026-09-18", mobile: "+98 900 555 0105" };
  const first = createCollection(cloneInitialDemoData(), friday, "case-collection-005", "FXA-1005");
  assert.equal(first.sampleCase.transport.kind, "private-parking-exception");
  const repeat = createCollection(first.data, { ...friday, contactName: "Another Customer" }, "case-collection-006", "FXA-1006");
  assert.equal(repeat.sampleCase.transport.kind, "standard-collection");
});

function cloneInitialDemoData() { const data = cloneAllSamples(); return { ...data, cases: data.cases.slice(0, 1) }; }
