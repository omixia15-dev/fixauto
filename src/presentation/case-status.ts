import { getCasePhase, type SampleCase } from "../domain/sample-case.ts";

const phasePresentation = {
  "pending-staff-confirmation": {
    status: "Request received — awaiting staff confirmation",
    nextAction: "Staff reviews the requested appointment.",
    timing: "During the next staffed period",
  },
  "assessment-authorization-required": {
    status: "Appointment confirmed",
    nextAction: "Customer reviews and authorizes the assessment scope.",
    timing: "Before the expert visit",
  },
  "assessment-payment-required": {
    status: "Assessment authorized — payment required",
    nextAction: "Customer completes the simulated assessment payment.",
    timing: "Before the expert visit",
  },
  "assessment-ready": {
    status: "Assessment funded — visit ready",
    nextAction: "Staff records the expert-first assessment.",
    timing: "At the confirmed appointment",
  },
  "assessment-complete": {
    status: "Initial assessment complete",
    nextAction: "Customer decides whether to continue service.",
    timing: "After reviewing the findings",
  },
  "investigation-authorization-required": {
    status: "Deeper investigation recommended",
    nextAction: "Customer reviews the separate investigation scope and fee.",
    timing: "Before workshop investigation",
  },
  "investigation-payment-required": {
    status: "Investigation authorized — payment required",
    nextAction: "Customer completes the separate simulated payment.",
    timing: "Before workshop investigation",
  },
  "investigation-funded": {
    status: "Investigation authorized and funded",
    nextAction: "Transport and workshop handling continue in D3.",
    timing: "No dispatch occurs in this D2 demo",
  },
  "further-service-declined": {
    status: "Further service declined",
    nextAction: "Assessment history remains available; no further work starts.",
    timing: "Assessment fee remains earned",
  },
  "transport-authorization-required": {
    status: "Collection requested — transport approval required",
    nextAction: "Customer reviews the separate transport and storage scope.",
    timing: "Before simulated dispatch",
  },
  "transport-payment-required": {
    status: "Transport authorized — payment required",
    nextAction: "Customer completes the separate transport and storage payment.",
    timing: "Before simulated dispatch",
  },
  "transport-decision-required": {
    status: "Transport paid — qualified route required",
    nextAction: "Staff records whether driving is suitable or towing is required.",
    timing: "Before simulated dispatch",
  },
  "transport-receiver-required": {
    status: "Transport route recorded — receiver required",
    nextAction: "Staff assigns one custody-only receiver.",
    timing: "Before simulated dispatch",
  },
  "transport-ready": {
    status: "Transport ready for simulated dispatch",
    nextAction: "Staff records the simulated dispatch.",
    timing: "No real vehicle will move",
  },
  "custody-handover-required": {
    status: "Vehicle dispatched — custody handover required",
    nextAction: "Staff records condition, mileage, keys, and destination.",
    timing: "At simulated receipt",
  },
  "custody-return-required": {
    status: "Assessment complete — vehicle remains in custody",
    nextAction: "Staff records the simulated return to release capacity.",
    timing: "No real vehicle will be released",
  },
} as const;

export function getCasePresentation(sampleCase: SampleCase) {
  return phasePresentation[getCasePhase(sampleCase)];
}
