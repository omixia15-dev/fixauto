"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cloneInitialDemoData } from "../demo-data/sample-data";
import {
  authorizeAssessment,
  authorizeDeeperInvestigation,
  authorizeTransportStorage,
  assignCustodyReceiver,
  confirmRequestedAppointment,
  declineFurtherService,
  publishEstimate,
  approveEstimate,
  declineEstimate,
  recordEstimateReminder,
  applyAdvanceCredit,
  recordAuthorizedIncurredCost,
  refundUnspentAdvance,
  recordPerformedWork,
  recordQualityCheck,
  recordSettlement,
  recordFinalPayment,
  issueRecords,
  recordReturn,
  openComplaint,
  authorizeComplaintSecondAssessment,
  getCurrentEstimate,
  getOutstandingAdvance,
  dispatchVehicle,
  findCase,
  getDisclosedCharge,
  recordInitialAssessment,
  recordCustodyHandover,
  recordPaymentAttempt,
  recordQualifiedTransportDecision,
  recordVehicleReturned,
  submitServiceRequest,
  updateSharedNote,
  type DemoData,
  type PaymentOutcome,
  type PaymentPurpose,
  type ServiceRequestInput,
  type EstimateLineInput,
  type ReturnRecord,
} from "../domain/sample-case";
import { loadDemoData, resetDemoData, saveDemoData } from "./storage";

type AssessmentInput = { expertName: string; findings: string; needsInvestigation: boolean };
type TransportDecisionInput = { qualifiedInputName: string; suitability: "drive-suitable" | "tow-required" | "uncertain"; rationale: string };
type ReceiverInput = { name: string; relation: "customer" | "brother-in-law" | "father" };
type HandoverInput = { receiverName: string; condition: string; mileage: number; keys: string; destination: string };
type IncurredCostInput = { description: string; amountCents: number; authorizedBy: string };

type DemoCaseContextValue = {
  data: DemoData;
  ready: boolean;
  notice: string;
  submitRequest: (input: ServiceRequestInput) => { caseId: string; reference: string };
  confirmAppointment: (caseId: string) => void;
  authorizeInitialAssessment: (caseId: string) => void;
  authorizeTransport: (caseId: string) => void;
  attemptPayment: (caseId: string, purpose: PaymentPurpose, outcome: PaymentOutcome) => void;
  recordTransportDecision: (caseId: string, input: TransportDecisionInput) => void;
  assignReceiver: (caseId: string, input: ReceiverInput) => void;
  dispatch: (caseId: string) => void;
  recordHandover: (caseId: string, input: HandoverInput) => void;
  recordReturn: (caseId: string) => void;
  completeInitialAssessment: (caseId: string, input: AssessmentInput) => void;
  authorizeInvestigation: (caseId: string) => void;
  declineService: (caseId: string) => void;
  publishEstimate: (caseId: string, input: { expectedTiming: string; lines: EstimateLineInput[] }) => void;
  approveEstimate: (caseId: string) => void;
  declineEstimate: (caseId: string, reason: string) => void;
  remindEstimate: (caseId: string) => void;
  applyAdvanceCredit: (caseId: string, amountCents: number) => void;
  recordIncurredCost: (caseId: string, input: IncurredCostInput) => void;
  refundEstimate: (caseId: string, estimateVersionId: string) => void;
  recordWork: (caseId: string, summary: string, specialist: string) => void;
  recordQuality: (caseId: string, input: { specialist: string; result: "passed" | "failed"; findings: string }) => void;
  settle: (caseId: string) => void;
  attemptFinalPayment: (caseId: string, outcome: PaymentOutcome) => void;
  issueRecords: (caseId: string) => void;
  returnVehicle: (caseId: string, input: Omit<ReturnRecord, "id" | "estimateVersionId" | "returnedAt">) => void;
  openComplaint: (caseId: string, summary: string) => void;
  authorizeSecondAssessment: (caseId: string) => void;
  saveSharedNote: (caseId: string, note: string) => void;
  reset: () => void;
};

const DemoCaseContext = createContext<DemoCaseContextValue | null>(null);

function tehranDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function DemoCaseProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoData>(() => cloneInitialDemoData());
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const stored = loadDemoData(window.localStorage);
    saveDemoData(window.localStorage, stored);
    queueMicrotask(() => {
      setData(stored);
      setReady(true);
    });
  }, []);

  const value = useMemo<DemoCaseContextValue>(() => {
    function commit(next: DemoData, message: string) {
      saveDemoData(window.localStorage, next);
      setData(next);
      setNotice(message);
    }

    function paymentDetails(caseId: string, purpose: PaymentPurpose) {
      const sampleCase = findCase(data, caseId);
      if (!sampleCase) throw new Error("The sample case could not be found.");
      return getDisclosedCharge(sampleCase, purpose);
    }

    return {
      data,
      ready,
      notice,
      submitRequest(input) {
        const now = new Date();
        const nextNumber = Math.max(1000, ...data.cases.map((item) => Number(item.reference.replace("FXA-", "")) || 1000)) + 1;
        const result = submitServiceRequest(
          data,
          input,
          { caseId: `case-${crypto.randomUUID()}`, reference: `FXA-${nextNumber}` },
          now.toISOString(),
          tehranDate(now),
        );
        commit(result.data, `Sample request ${result.sampleCase.reference} created and awaiting staff confirmation.`);
        return { caseId: result.sampleCase.id, reference: result.sampleCase.reference };
      },
      confirmAppointment(caseId) {
        commit(
          confirmRequestedAppointment(data, caseId, "Leila Moradi", new Date().toISOString()),
          "Requested appointment confirmed by the simulated coordinator.",
        );
      },
      authorizeInitialAssessment(caseId) {
        commit(
          authorizeAssessment(data, caseId, "Simulated customer", new Date().toISOString()),
          "Assessment scope and illustrative fee authorized.",
        );
      },
      authorizeTransport(caseId) {
        commit(
          authorizeTransportStorage(data, caseId, "Simulated customer", new Date().toISOString()),
          "Transport and storage scope authorized.",
        );
      },
      attemptPayment(caseId, purpose, outcome) {
        const sampleCase = findCase(data, caseId);
        if (!sampleCase) throw new Error("The sample case could not be found.");
        const currentEstimate = purpose === "repair-advance" ? getCurrentEstimate(sampleCase) : null;
        const details = currentEstimate
          ? { label: `Repair advance — estimate v${currentEstimate.version}`, amountCents: getOutstandingAdvance(sampleCase, currentEstimate.id), currency: currentEstimate.currency }
          : paymentDetails(caseId, purpose);
        commit(
          recordPaymentAttempt(data, caseId, {
            id: `payment-${crypto.randomUUID()}`,
            purpose,
            label: details.label,
            amountCents: details.amountCents,
            currency: details.currency,
            outcome,
            attemptedAt: new Date().toISOString(),
            estimateVersionId: currentEstimate?.id ?? null,
          }),
          outcome === "simulated-success"
            ? "Simulated payment succeeded."
            : `Simulated payment ${outcome === "simulated-failed" ? "failed" : "was canceled"}; the dependent action remains blocked.`,
        );
      },
      recordTransportDecision(caseId, input) {
        commit(
          recordQualifiedTransportDecision(data, caseId, input, new Date().toISOString()),
          "Qualified sample drive-or-tow decision recorded.",
        );
      },
      assignReceiver(caseId, input) {
        commit(
          assignCustodyReceiver(data, caseId, input, "Leila Moradi", new Date().toISOString()),
          "Custody-only receiver assigned.",
        );
      },
      dispatch(caseId) {
        commit(dispatchVehicle(data, caseId, new Date().toISOString()), "Simulated dispatch recorded; no real vehicle moved.");
      },
      recordHandover(caseId, input) {
        commit(recordCustodyHandover(data, caseId, input, new Date().toISOString()), "Custody handover recorded in the sample case.");
      },
      recordReturn(caseId) {
        commit(recordVehicleReturned(data, caseId, new Date().toISOString()), "Simulated vehicle return recorded; active capacity is available.");
      },
      completeInitialAssessment(caseId, input) {
        commit(
          recordInitialAssessment(data, caseId, input, new Date().toISOString()),
          "Expert-first assessment recorded; its disclosed fee is now earned.",
        );
      },
      authorizeInvestigation(caseId) {
        commit(
          authorizeDeeperInvestigation(data, caseId, "Simulated customer", new Date().toISOString()),
          "Separate deeper-investigation scope authorized.",
        );
      },
      declineService(caseId) {
        commit(
          declineFurtherService(data, caseId, new Date().toISOString()),
          "Further service declined; assessment and payment history were preserved.",
        );
      },
      publishEstimate(caseId, input) {
        commit(publishEstimate(data, caseId, input, "Fixauto staff", new Date().toISOString()), "A new immutable repair estimate version was published.");
      },
      approveEstimate(caseId) {
        const estimate = getCurrentEstimate(findCase(data, caseId)!);
        if (!estimate) throw new Error("No current estimate is available.");
        commit(approveEstimate(data, caseId, estimate.id, "Simulated customer", new Date().toISOString()), "Current estimate version approved by the simulated customer.");
      },
      declineEstimate(caseId, reason) {
        const estimate = getCurrentEstimate(findCase(data, caseId)!);
        if (!estimate) throw new Error("No current estimate is available.");
        commit(declineEstimate(data, caseId, estimate.id, reason, "Simulated customer", new Date().toISOString()), "Current estimate declined; repair remains paused.");
      },
      remindEstimate(caseId) {
        const estimate = getCurrentEstimate(findCase(data, caseId)!);
        if (!estimate) throw new Error("No current estimate is available.");
        commit(recordEstimateReminder(data, caseId, estimate.id, new Date(new Date(estimate.publishedAt).getTime() + 24 * 60 * 60 * 1000).toISOString()), "Simulated 24-hour reminder recorded; silence is not consent.");
      },
      applyAdvanceCredit(caseId, amountCents) {
        const estimate = getCurrentEstimate(findCase(data, caseId)!);
        if (!estimate) throw new Error("No current estimate is available.");
        commit(applyAdvanceCredit(data, caseId, estimate.id, amountCents, "Simulated customer", new Date().toISOString()), "Prior unspent advance credit was explicitly allocated to the newly approved estimate.");
      },
      recordIncurredCost(caseId, input) {
        const estimate = getCurrentEstimate(findCase(data, caseId)!);
        if (!estimate) throw new Error("No current estimate is available.");
        commit(recordAuthorizedIncurredCost(data, caseId, estimate.id, input, new Date().toISOString()), "Authorized incurred cost recorded against the funded estimate.");
      },
      refundEstimate(caseId, estimateVersionId) {
        commit(refundUnspentAdvance(data, caseId, estimateVersionId, new Date().toISOString()), "Simulated refund recorded for unspent advance after authorized costs.");
      },
      recordWork(caseId, summary, specialist) {
        const estimate = getCurrentEstimate(findCase(data, caseId)!);
        if (!estimate) throw new Error("No current estimate is available.");
        commit(recordPerformedWork(data, caseId, estimate.id, summary, specialist, new Date().toISOString()), "Performed work recorded; quality check is still required.");
      },
      recordQuality(caseId, input) {
        const estimate = getCurrentEstimate(findCase(data, caseId)!);
        if (!estimate) throw new Error("No current estimate is available.");
        commit(recordQualityCheck(data, caseId, estimate.id, input, new Date().toISOString()), input.result === "passed" ? "Current quality check passed." : "Quality check failed; repair remains open for reassessment.");
      },
      settle(caseId) {
        const estimate = getCurrentEstimate(findCase(data, caseId)!);
        if (!estimate) throw new Error("No current estimate is available.");
        commit(recordSettlement(data, caseId, estimate.id, "Fixauto coordinator", new Date().toISOString()), "Illustrative settlement recorded.");
      },
      attemptFinalPayment(caseId, outcome) {
        const sampleCase = findCase(data, caseId);
        const estimate = sampleCase && getCurrentEstimate(sampleCase);
        const settlement = estimate && sampleCase?.settlements.findLast((entry) => entry.estimateVersionId === estimate.id);
        if (!estimate || !settlement) throw new Error("Settlement is required before final payment.");
        commit(recordFinalPayment(data, caseId, { id: `final-${crypto.randomUUID()}`, estimateVersionId: estimate.id, amountCents: settlement.outstandingCents, currency: "USD", outcome, attemptedAt: new Date().toISOString() }), outcome === "simulated-success" ? "Simulated final payment succeeded." : "Simulated final payment did not clear the balance.");
      },
      issueRecords(caseId) {
        commit(issueRecords(data, caseId, new Date().toISOString()), "Illustrative invoice and warranty records issued.");
      },
      returnVehicle(caseId, input) {
        commit(recordReturn(data, caseId, input, new Date().toISOString()), "Vehicle return recorded; warranty and complaint rights remain open.");
      },
      openComplaint(caseId, summary) {
        commit(openComplaint(data, caseId, summary, "Fixauto coordinator", new Date().toISOString()), "Complaint review opened without authorizing new work or charges.");
      },
      authorizeSecondAssessment(caseId) {
        commit(authorizeComplaintSecondAssessment(data, caseId, new Date().toISOString()), "A separate no-charge second-assessment review was explicitly authorized.");
      },
      saveSharedNote(caseId, note) {
        commit(updateSharedNote(data, caseId, note), "Sample note saved across all demo screens.");
      },
      reset() {
        const next = resetDemoData(window.localStorage);
        setData(next);
        setNotice("Fixauto sample data was reset.");
      },
    };
  }, [data, notice, ready]);

  return <DemoCaseContext.Provider value={value}>{children}</DemoCaseContext.Provider>;
}

export function useDemoCases(): DemoCaseContextValue {
  const context = useContext(DemoCaseContext);
  if (!context) throw new Error("useDemoCases must be used inside DemoCaseProvider.");
  return context;
}
