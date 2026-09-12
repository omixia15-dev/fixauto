"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cloneInitialDemoData } from "../demo-data/sample-data";
import {
  authorizeAssessment,
  authorizeDeeperInvestigation,
  confirmRequestedAppointment,
  declineFurtherService,
  findCase,
  recordInitialAssessment,
  recordPaymentAttempt,
  submitServiceRequest,
  updateSharedNote,
  type DemoData,
  type PaymentOutcome,
  type PaymentPurpose,
  type ServiceRequestInput,
} from "../domain/sample-case";
import { loadDemoData, resetDemoData, saveDemoData } from "./storage";

type AssessmentInput = { expertName: string; findings: string; needsInvestigation: boolean };

type DemoCaseContextValue = {
  data: DemoData;
  ready: boolean;
  notice: string;
  submitRequest: (input: ServiceRequestInput) => { caseId: string; reference: string };
  confirmAppointment: (caseId: string) => void;
  authorizeInitialAssessment: (caseId: string) => void;
  attemptPayment: (caseId: string, purpose: PaymentPurpose, outcome: PaymentOutcome) => void;
  completeInitialAssessment: (caseId: string, input: AssessmentInput) => void;
  authorizeInvestigation: (caseId: string) => void;
  declineService: (caseId: string) => void;
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
      const charge = purpose === "assessment" ? sampleCase.assessment : sampleCase.assessment.investigation;
      return {
        label: purpose === "assessment" ? "Illustrative assessment fee" : "Illustrative deeper-investigation fee",
        amountCents: charge.feeCents,
        currency: charge.currency,
      };
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
      attemptPayment(caseId, purpose, outcome) {
        const details = paymentDetails(caseId, purpose);
        commit(
          recordPaymentAttempt(data, caseId, {
            id: `payment-${crypto.randomUUID()}`,
            purpose,
            label: details.label,
            amountCents: details.amountCents,
            currency: details.currency,
            outcome,
            attemptedAt: new Date().toISOString(),
          }),
          outcome === "simulated-success"
            ? "Simulated payment succeeded."
            : `Simulated payment ${outcome === "simulated-failed" ? "failed" : "was canceled"}; the dependent action remains blocked.`,
        );
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
