"use client";

import Link from "next/link";
import { useState } from "react";
import { CaseSummary } from "../components/case-summary";
import { SimulationBadge } from "../components/simulation-badge";
import { formatMoney } from "../domain/currency";
import { findCase, getCasePhase, getCurrentEstimate, getEstimateDecision, getOutstandingAdvance, getAvailableAdvanceCredit, type PaymentOutcome, type PaymentPurpose } from "../domain/sample-case";
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
  const currentEstimate = getCurrentEstimate(sampleCase);

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
      <section className="card" aria-labelledby="sms-log-title"><div className="section-heading"><h2 id="sms-log-title">Daily simulated updates</h2><SimulationBadge>SMS log</SimulationBadge></div>{sampleCase.smsLog.length === 0 ? <p className="helper-text">No daily summaries recorded.</p> : <ol className="history-list">{sampleCase.smsLog.map((sms) => <li key={sms.id}><strong>{sms.summaryDate ?? "Recorded update"}{sms.nonWorkingDay ? " · non-working day" : ""}</strong><span>{sms.situation}</span><span>Next: {sms.nextAction} · {sms.expectedTiming}</span></li>)}</ol>}<p className="helper-text">These updates never authorize work, charges, consent, or custody changes.</p></section>

      {sampleCase.transport.kind !== "not-required" ? (
        <section className="card" aria-labelledby="transport-title">
          <div className="section-heading">
            <div><p className="eyebrow">Separate custody scope</p><h2 id="transport-title">Transport and storage</h2></div>
            <SimulationBadge>transport and payment</SimulationBadge>
          </div>
          <p>{sampleCase.transport.scope}</p>
          <p><strong>Destination:</strong> {sampleCase.transport.destination}</p>
          {sampleCase.transport.assessmentEarliestDate ? (
            <p className="blocked-reason">Private-parking exception: assessment cannot begin before {sampleCase.transport.assessmentEarliestDate}.</p>
          ) : null}
          <p className="price-line">
            <strong>{formatMoney(sampleCase.transport.transportFeeCents, sampleCase.transport.currency)} USD transport</strong>
            <span>{formatMoney(sampleCase.transport.storageFeeCents, sampleCase.transport.currency)} USD illustrative storage · separate from assessment</span>
          </p>
          {phase === "transport-authorization-required" ? (
            <button className="button" type="button" onClick={() => run(() => actions.authorizeTransport(caseId))}>
              Authorize transport and storage
            </button>
          ) : null}
          {phase === "transport-payment-required" ? paymentButtons("transport-storage") : null}
          {phase === "transport-decision-required" ? <p className="blocked-reason">Staff must record qualified drive-or-tow input before dispatch.</p> : null}
          {phase === "transport-receiver-required" ? <p className="blocked-reason">Staff must assign one custody-only receiver before dispatch.</p> : null}
          {phase === "transport-ready" ? <p className="success-message">Transport and storage are authorized and paid; staff may record simulated dispatch.</p> : null}
          {phase === "custody-handover-required" ? <p className="blocked-reason">Dispatch is recorded. Staff must record the simulated custody handover.</p> : null}
          {sampleCase.transport.qualifiedDecision ? <p className="history-line">Qualified route: {sampleCase.transport.qualifiedDecision.path} ({sampleCase.transport.qualifiedDecision.suitability}).</p> : null}
          {sampleCase.transport.receiver ? <p className="history-line">Custody receiver: {sampleCase.transport.receiver.name} ({sampleCase.transport.receiver.relation}); custody-only authority.</p> : null}
          {sampleCase.transport.handover ? (
            <div className="nested-panel">
              <strong>Custody handover recorded</strong>
              <p>{sampleCase.transport.handover.condition} · {sampleCase.transport.handover.mileage} km · {sampleCase.transport.handover.keys}</p>
              <p>Destination: {sampleCase.transport.handover.destination}</p>
              <p>Receiving the vehicle does not authorize repairs or spending.</p>
            </div>
          ) : null}
          {phase === "custody-return-required" ? <p className="blocked-reason">The assessment is complete; staff must record simulated return to release active capacity.</p> : null}
          {sampleCase.transport.returnedAt ? <p className="success-message">Simulated return recorded; this case no longer occupies active-car capacity.</p> : null}
        </section>
      ) : null}

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
          {phase !== "further-service-declined" && (phase === "assessment-complete" || phase === "estimate-required" || phase === "investigation-authorization-required" || phase === "investigation-payment-required") ? (
            <button className="button button-danger" type="button" onClick={() => run(() => actions.declineService(caseId))}>
              Decline further service
            </button>
          ) : null}
          {phase === "further-service-declined" ? <p className="blocked-reason">Further service declined. The completed assessment and all payment attempts remain recorded.</p> : null}
        </section>
      ) : null}

      {currentEstimate ? (
        <section className="card" aria-labelledby="estimate-title">
          <div className="section-heading"><div><p className="eyebrow">Exact repair scope</p><h2 id="estimate-title">Estimate v{currentEstimate.version}</h2></div><SimulationBadge>immutable estimate</SimulationBadge></div>
          <p><strong>Expected timing:</strong> {currentEstimate.expectedTiming}</p>
          <ol className="history-list">
            {currentEstimate.lines.map((line) => <li key={line.id}><strong>{line.description}</strong><span>{line.category}{line.part ? ` · ${line.part.brand} · ${line.part.condition} · warranty ${line.part.warranty}` : ""}</span><span>{line.quantity} × {formatMoney(line.unitPriceCents, line.currency)} USD = {formatMoney(line.totalCents, line.currency)} USD</span></li>)}
          </ol>
          <p className="price-line"><strong>Total: {formatMoney(currentEstimate.totalCents, currentEstimate.currency)} USD</strong><span>Version published by {currentEstimate.publishedBy}; earlier versions remain historical only.</span></p>
          {phase === "estimate-approval-required" || phase === "estimate-unanswered" ? <div className="button-row"><button className="button" type="button" onClick={() => run(() => actions.approveEstimate(caseId))}>Approve exact estimate</button><button className="button button-danger" type="button" onClick={() => run(() => actions.declineEstimate(caseId, "Simulated customer declined this repair scope."))}>Decline estimate</button>{phase === "estimate-approval-required" ? <button className="button button-secondary" type="button" onClick={() => run(() => actions.remindEstimate(caseId))}>Record 24-hour call reminder</button> : null}</div> : null}
          {phase === "estimate-payment-required" ? <div className="nested-panel"><p>Approved amount still due: {formatMoney(getOutstandingAdvance(sampleCase, currentEstimate.id), currentEstimate.currency)} USD.</p><p>Available prior unallocated credit: {formatMoney(getAvailableAdvanceCredit(sampleCase), currentEstimate.currency)} USD. Credit requires explicit allocation and fresh approval.</p><div className="button-row"><button className="button" type="button" onClick={() => run(() => actions.attemptPayment(caseId, "repair-advance", "simulated-success"))}>Simulate successful repair advance</button><button className="button button-secondary" type="button" onClick={() => run(() => actions.attemptPayment(caseId, "repair-advance", "simulated-failed"))}>Simulate failed advance</button><button className="button button-secondary" type="button" onClick={() => run(() => actions.attemptPayment(caseId, "repair-advance", "simulated-canceled"))}>Simulate canceled advance</button></div></div> : null}
          {phase === "repair-ready" ? <p className="success-message">Current estimate is approved and fully funded. No repair execution occurs in this D4 simulation.</p> : null}
          {phase === "repair-ready" ? <button className="button button-danger" type="button" onClick={() => run(() => actions.declineEstimate(caseId, "Simulated customer rejected the funded scope before repair started."))}>Decline before repair starts</button> : null}
          {phase === "estimate-declined" ? <p className="blocked-reason">Declined estimate cannot authorize repair. Any refund is simulated only after authorized incurred costs are disclosed.</p> : null}
          {getEstimateDecision(sampleCase, currentEstimate.id) ? <p className="history-line">Decision: {getEstimateDecision(sampleCase, currentEstimate.id)?.outcome} by {getEstimateDecision(sampleCase, currentEstimate.id)?.authorizer}.</p> : null}
        </section>
      ) : null}

      {currentEstimate && (sampleCase.performedWork.length > 0 || sampleCase.qualityChecks.length > 0 || sampleCase.settlements.length > 0 || sampleCase.returns.length > 0 || sampleCase.invoices.length > 0 || sampleCase.warranties.length > 0) ? <section className="card" aria-labelledby="completion-title"><div className="section-heading"><h2 id="completion-title">Work, quality, settlement, and return</h2><SimulationBadge>D5 simulation</SimulationBadge></div>{sampleCase.performedWork.filter((work) => work.estimateVersionId === currentEstimate.id).map((work) => <p key={work.id}><strong>Performed work:</strong> {work.summary} ({work.performedBy})</p>)}{sampleCase.qualityChecks.filter((check) => check.estimateVersionId === currentEstimate.id).map((check) => <p key={check.id}><strong>Quality {check.result}:</strong> {check.findings}</p>)}{sampleCase.settlements.filter((settlement) => settlement.estimateVersionId === currentEstimate.id).map((settlement) => <p key={settlement.id}><strong>Settlement:</strong> {formatMoney(settlement.outstandingCents, "USD")} USD outstanding.</p>)}{sampleCase.invoices.filter((invoice) => invoice.estimateVersionId === currentEstimate.id).map((invoice) => <p key={invoice.id}><strong>Illustrative invoice:</strong> {invoice.summary} · {formatMoney(invoice.totalCents, invoice.currency)} USD</p>)}{sampleCase.warranties.filter((warranty) => warranty.estimateVersionId === currentEstimate.id).map((warranty) => <p key={warranty.id}><strong>Illustrative warranty:</strong> {warranty.terms}</p>)}{sampleCase.returns.filter((record) => record.estimateVersionId === currentEstimate.id).map((record) => <p key={record.id}><strong>Returned to {record.recipientName}:</strong> {record.condition} · {record.mileage} km · {record.keys}. Warranty and complaint rights remain open.</p>)}</section> : null}

      <section className="card muted-card" aria-labelledby="updates-title">
        <div className="section-heading"><h2 id="updates-title">Updates and later records</h2><SimulationBadge>SMS log</SimulationBadge></div>
        <p>Daily SMS, transport, estimates, quality, invoices, warranty, and return remain later issues.</p>
      </section>
    </div>
  );
}
