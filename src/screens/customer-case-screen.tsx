"use client";

import Link from "next/link";
import { useState } from "react";
import { CaseSummary } from "../components/case-summary";
import { SimulationBadge } from "../components/simulation-badge";
import { formatMoney } from "../domain/currency";
import { findCase, getCasePhase, type PaymentOutcome, type PaymentPurpose } from "../domain/sample-case";
import { getCasePresentation } from "../presentation/case-status";
import { useDemoCases } from "../store/demo-case-provider";

export function CustomerCaseScreen({ caseId }: { caseId: string }) {
  const actions = useDemoCases();
  const [actionError, setActionError] = useState("");
  const sampleCase = findCase(actions.data, caseId);

  if (!actions.ready) return <p className="loading-state">Loading saved sample case…</p>;
  if (!sampleCase) {
    return (
      <section className="empty-state">
        <h1>Sample case not found</h1>
        <p>This browser does not contain that fictional case.</p>
        <Link className="button" href="/">Return to service request</Link>
      </section>
    );
  }

  const phase = getCasePhase(sampleCase);
  const presentation = getCasePresentation(sampleCase);

  function run(action: () => void) {
    try {
      action();
      setActionError("");
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "The sample action was blocked.");
    }
  }

  function paymentButtons(purpose: PaymentPurpose) {
    const attempt = (outcome: PaymentOutcome) => run(() => actions.attemptPayment(caseId, purpose, outcome));
    return (
      <div className="button-row" aria-label={`Simulated ${purpose} payment outcomes`}>
        <button className="button" type="button" onClick={() => attempt("simulated-success")}>Simulate successful payment</button>
        <button className="button button-secondary" type="button" onClick={() => attempt("simulated-failed")}>Simulate failed payment</button>
        <button className="button button-secondary" type="button" onClick={() => attempt("simulated-canceled")}>Simulate canceled payment</button>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <SimulationBadge>customer role</SimulationBadge>
          <p className="eyebrow">Customer case</p>
          <h1>{presentation.status}</h1>
          <p className="lede">{presentation.nextAction} {presentation.timing}.</p>
        </div>
      </section>
      {actionError ? <p className="error-banner" role="alert">{actionError}</p> : null}
      <CaseSummary sampleCase={sampleCase} />

      <div className="content-grid">
        <section className="card" aria-labelledby="assessment-title">
          <div className="section-heading">
            <div><p className="eyebrow">Exact scope before consent</p><h2 id="assessment-title">Initial assessment</h2></div>
            <SimulationBadge>identity and consent</SimulationBadge>
          </div>
          <p>{sampleCase.assessment.scope}</p>
          <p className="price-line">
            <strong>{formatMoney(sampleCase.assessment.feeCents, sampleCase.assessment.currency)} USD</strong>
            <span>Illustrative fixed fee · earned only after the visit occurs</span>
          </p>

          {phase === "pending-staff-confirmation" ? <p className="blocked-reason">Blocked: staff must confirm the appointment first.</p> : null}
          {phase === "assessment-authorization-required" ? (
            <button className="button" type="button" onClick={() => run(() => actions.authorizeInitialAssessment(caseId))}>
              Authorize as simulated customer
            </button>
          ) : null}
          {phase === "assessment-payment-required" ? paymentButtons("assessment") : null}
          {phase === "assessment-ready" ? <p className="success-message">Authorized and paid. Staff may now record the expert visit.</p> : null}
          {sampleCase.assessment.authorizedAt ? <p className="history-line">Authorized by {sampleCase.assessment.authorizer}.</p> : null}
        </section>

        <section className="card" aria-labelledby="payment-title">
          <div className="section-heading"><h2 id="payment-title">Payment history</h2><SimulationBadge>payment</SimulationBadge></div>
          {sampleCase.payments.length === 0 ? <p className="helper-text">No simulated payment attempts yet.</p> : (
            <ol className="history-list">
              {sampleCase.payments.map((payment) => (
                <li key={payment.id}>
                  <strong>{payment.label}</strong>
                  <span>{formatMoney(payment.amountCents, payment.currency)} USD</span>
                  <span>{payment.outcome.replace("simulated-", "Simulated ")}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {sampleCase.assessment.performedAt ? (
        <section className="card" aria-labelledby="findings-title">
          <div className="section-heading">
            <div><p className="eyebrow">Expert-first result</p><h2 id="findings-title">Assessment findings</h2></div>
            <span className="status-pill">Fee earned</span>
          </div>
          <p><strong>Sample expert:</strong> {sampleCase.assessment.expertName}</p>
          <p>{sampleCase.assessment.findings}</p>
          <p><strong>Deeper investigation:</strong> {sampleCase.assessment.needsInvestigation ? "Recommended separately" : "Not required"}</p>

          {phase === "investigation-authorization-required" ? (
            <div className="nested-panel">
              <h3>Separate workshop investigation</h3>
              <p>{sampleCase.assessment.investigation.scope}</p>
              <strong>{formatMoney(sampleCase.assessment.investigation.feeCents, "USD")} USD illustrative fee</strong>
              <button className="button" type="button" onClick={() => run(() => actions.authorizeInvestigation(caseId))}>
                Authorize separate investigation
              </button>
            </div>
          ) : null}
          {phase === "investigation-payment-required" ? (
            <div className="nested-panel">
              <p>Initial assessment payment cannot fund this separate investigation.</p>
              {paymentButtons("investigation")}
            </div>
          ) : null}
          {phase === "investigation-funded" ? <p className="success-message">Separate investigation is authorized and funded. Transport remains D3.</p> : null}
          {phase !== "further-service-declined" && phase !== "investigation-funded" ? (
            <button className="button button-danger" type="button" onClick={() => run(() => actions.declineService(caseId))}>
              Decline further service
            </button>
          ) : null}
          {phase === "further-service-declined" ? <p className="blocked-reason">Further service declined. The completed assessment and all payment attempts remain recorded.</p> : null}
        </section>
      ) : null}

      <section className="card muted-card" aria-labelledby="updates-title">
        <div className="section-heading"><h2 id="updates-title">Updates and later records</h2><SimulationBadge>SMS log</SimulationBadge></div>
        <p>Daily SMS, transport, estimates, quality, invoices, warranty, and return remain later issues.</p>
      </section>
    </div>
  );
}
