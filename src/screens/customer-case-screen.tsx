"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SimulationBadge } from "../components/simulation-badge";
import { formatMoney } from "../domain/currency";
import {
  findCase,
  getAvailableAdvanceCredit,
  getCasePhase,
  getCurrentEstimate,
  getEstimateDecision,
  getOutstandingAdvance,
  type PaymentOutcome,
  type PaymentPurpose,
  type ServiceMode,
} from "../domain/sample-case";
import { getCasePresentation } from "../presentation/case-status";
import { useDemoCases } from "../store/demo-case-provider";
import styles from "./customer-case-screen.module.css";

function timestampLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Tehran",
      }).format(date);
}

function serviceModeLabel(mode: ServiceMode) {
  switch (mode) {
    case "expert-visit": return "Expert visit";
    case "collection-request": return "Vehicle collection";
    case "office-dropoff": return "Office drop-off";
  }
}

export function CustomerCaseScreen({ caseId }: { caseId: string }) {
  const actions = useDemoCases();
  const [actionError, setActionError] = useState("");
  const sampleCase = findCase(actions.data, caseId);

  if (actions.storageError) {
    return (
      <div className={styles.screen}>
        <section className={styles.stateError} role="alert" aria-labelledby="storage-error-title">
          <h1 id="storage-error-title">Saved cases are unavailable</h1>
          <p>{actions.storageError}</p>
          <button className="button" type="button" onClick={actions.retryStorage}>Try again</button>
        </section>
      </div>
    );
  }

  if (!actions.ready) {
    return (
      <div className={styles.screen}>
        <section className={styles.loadingPanel} aria-busy="true" aria-label="Loading saved case">
          <p role="status">Loading saved sample case…</p>
          <div className={styles.skeleton} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>
      </div>
    );
  }

  if (!sampleCase) {
    return (
      <div className={styles.screen}>
        <section className={styles.emptyState} aria-labelledby="missing-case-title">
          <h1 id="missing-case-title">Case not found</h1>
          <p>This case is not present in the saved data for this browser.</p>
          <Link className="button" href="/case">Return to your cases</Link>
        </section>
      </div>
    );
  }

  const phase = getCasePhase(sampleCase);
  const presentation = getCasePresentation(sampleCase);
  const currentEstimate = getCurrentEstimate(sampleCase);
  const availableAdvanceCredit = getAvailableAdvanceCredit(sampleCase);
  const appointment = sampleCase.request.confirmedAppointment;

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

  function finalPaymentButtons() {
    const attempt = (outcome: PaymentOutcome) => run(() => actions.attemptFinalPayment(caseId, outcome));
    return (
      <div className="button-row" aria-label="Simulated final payment outcomes">
        <button className="button" type="button" onClick={() => attempt("simulated-success")}>Simulate successful final payment</button>
        <button className="button button-secondary" type="button" onClick={() => attempt("simulated-failed")}>Simulate failed final payment</button>
        <button className="button button-secondary" type="button" onClick={() => attempt("simulated-canceled")}>Simulate canceled final payment</button>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      {actions.notice ? <p className={styles.notice} role="status">{actions.notice}</p> : null}
      {actionError ? <p className={styles.actionError} role="alert">{actionError}</p> : null}

      <header className={styles.identity}>
        <Link className={styles.backLink} href="/case">My cases</Link>
        <div className={styles.identityRow}>
          <div className={styles.identityText}>
            <h1>{sampleCase.reference}</h1>
            <p className={styles.vehicleLine}>
              {sampleCase.vehicle.year} {sampleCase.vehicle.make} {sampleCase.vehicle.model}
              <span aria-hidden="true"> · </span>{sampleCase.customer.name}
            </p>
            <div className={styles.identityMeta}>
              <span className="status-pill">{presentation.status}</span>
              <span>Submitted <time dateTime={sampleCase.request.createdAt}>{timestampLabel(sampleCase.request.createdAt)}</time></span>
              <span>{serviceModeLabel(sampleCase.request.serviceMode)}</span>
            </div>
          </div>
          <figure className={styles.vehicleImage}>
            <Image
              src="/images/case-sample-sedan.png"
              alt="Illustrative sample vehicle"
              width={400}
              height={250}
              sizes="(max-width: 700px) 180px, (max-width: 1100px) 300px, 400px"
              loading="eager"
            />
            <figcaption>Illustrative vehicle</figcaption>
          </figure>
        </div>
      </header>

      <nav className={styles.anchorNav} aria-label="Case sections">
        <a href="#overview">Overview</a>
        <a href="#estimate">Estimate</a>
        <a href="#payments">Payments</a>
        <a href="#records">Records</a>
      </nav>

      <div className={styles.layout}>
        <section id="overview" className={`${styles.panel} ${styles.overview}`} aria-labelledby="overview-title">
          <div className={styles.sectionHeading}>
            <h2 id="overview-title">Overview</h2>
            <SimulationBadge>customer identity</SimulationBadge>
          </div>
          <div className={styles.overviewAction}>
            <div>
              <h3>Next step</h3>
              <p>{presentation.nextAction}</p>
              <p className={styles.secondaryText}>{presentation.timing}</p>
            </div>
            {currentEstimate ? <a className={styles.reviewLink} href="#estimate">Review estimate</a> : null}
          </div>
          <div className={styles.overviewGrid}>
            <div>
              <h3>Reported symptoms</h3>
              <p>{sampleCase.request.symptoms}</p>
            </div>
            <div>
              <h3>Appointment</h3>
              {appointment ? (
                <p>Confirmed for {appointment.date} at {appointment.time} by {appointment.coordinator}.</p>
              ) : (
                <p>Requested for {sampleCase.request.preferredDate} at {sampleCase.request.preferredTime}; confirmation is pending.</p>
              )}
              {sampleCase.request.visitAddress ? <p className={styles.secondaryText}>{sampleCase.request.visitAddress}</p> : null}
            </div>
          </div>
          {sampleCase.sharedNote ? (
            <div className={styles.sharedNote}>
              <h3>Shared note</h3>
              <p>{sampleCase.sharedNote}</p>
            </div>
          ) : null}
        </section>

        <aside className={styles.sidebar} aria-label="Case summary and next step">
          <section className={styles.panel} aria-labelledby="summary-title">
            <h2 id="summary-title">Case summary</h2>
            <dl className={styles.facts}>
              <div><dt>Case reference</dt><dd>{sampleCase.reference}</dd></div>
              <div><dt>Vehicle</dt><dd>{sampleCase.vehicle.year} {sampleCase.vehicle.make} {sampleCase.vehicle.model}</dd></div>
              <div><dt>Customer</dt><dd>{sampleCase.customer.name}</dd></div>
              <div><dt>Mobile</dt><dd>{sampleCase.customer.mobile}</dd></div>
              <div><dt>Status</dt><dd><span className="status-pill">{presentation.status}</span></dd></div>
              <div><dt>Service</dt><dd>{serviceModeLabel(sampleCase.request.serviceMode)}</dd></div>
              {currentEstimate ? <div><dt>Expected timing</dt><dd>{currentEstimate.expectedTiming}<span className={styles.finePrint}>Illustrative timing</span></dd></div> : null}
            </dl>
          </section>

          <section className={`${styles.panel} ${styles.nextStep}`} aria-labelledby="next-step-title">
            <h2 id="next-step-title">Next step</h2>
            <p>{presentation.nextAction}</p>
            <p className={styles.secondaryText}>{presentation.timing}</p>
            {!currentEstimate ? (phase === "estimate-required" ? <a className={styles.reviewLink} href="#estimate">View estimate status</a>
              : <a className={styles.reviewLink} href="#records">Review case records</a>) : null}
          </section>
        </aside>

        <div className={styles.documents}>
          <section id="estimate" className={styles.panel} aria-labelledby="estimate-title">
            <div className={styles.sectionHeading}>
              <h2 id="estimate-title">Repair estimate</h2>
              <SimulationBadge>estimate records</SimulationBadge>
            </div>
            {sampleCase.estimates.length === 0 ? (
              <div className={styles.emptyDocument}>
                <h3>No repair estimate yet</h3>
                <p>No itemized repair scope has been published for this case.</p>
              </div>
            ) : (
              <div className={styles.estimateList}>
                {sampleCase.estimates.map((estimate) => {
                  const isCurrent = currentEstimate?.id === estimate.id;
                  const decision = getEstimateDecision(sampleCase, estimate.id);
                  const reminders = sampleCase.estimateReminders.filter((item) => item.estimateVersionId === estimate.id);
                  const incurredCosts = sampleCase.authorizedIncurredCosts.filter((item) => item.estimateVersionId === estimate.id);
                  const refunds = sampleCase.estimateRefunds.filter((item) => item.estimateVersionId === estimate.id);

                  return (
                    <article className={styles.estimateVersion} key={estimate.id}>
                      <div className={styles.sectionHeading}>
                        <h3>Estimate v{estimate.version}</h3>
                        {isCurrent ? <span className={styles.currentLabel}>Current version</span> : <span className={styles.historyLabel}>Earlier version</span>}
                      </div>
                      <p className={styles.estimateMeta}>
                        Expected timing: {estimate.expectedTiming}<br />
                        Published by {estimate.publishedBy} · <time dateTime={estimate.publishedAt}>{timestampLabel(estimate.publishedAt)}</time><br />
                        All amounts are illustrative USD.
                      </p>
                      <div className={styles.tableFrame}>
                        <table className={styles.estimateTable}>
                          <caption>Itemized scope for estimate version {estimate.version}. All amounts in USD.</caption>
                          <thead>
                            <tr><th scope="col">Scope</th><th scope="col">Qty</th><th scope="col">Unit price</th><th scope="col">Amount</th></tr>
                          </thead>
                          <tbody>
                            {estimate.lines.map((line) => (
                              <tr key={line.id}>
                                <td>
                                  <strong>{line.description}</strong>
                                  <span className={styles.lineDetail}>
                                    {line.category === "management-fee" ? "Coordination fee" : line.category === "part" ? "Part" : "Labor"}
                                    {line.part ? ` · ${line.part.brand} · ${line.part.condition} · warranty ${line.part.warranty}` : ""}
                                  </span>
                                </td>
                                <td>{line.quantity}</td>
                                <td>{formatMoney(line.unitPriceCents, line.currency)}</td>
                                <td>{formatMoney(line.totalCents, line.currency)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr><th scope="row" colSpan={3}>Estimate total</th><td>{formatMoney(estimate.totalCents, estimate.currency)}</td></tr>
                          </tfoot>
                        </table>
                      </div>

                      {decision ? (
                        <p className={styles.recordLine}>
                          Decision: {decision.outcome} by {decision.authorizer} · <time dateTime={decision.decidedAt}>{timestampLabel(decision.decidedAt)}</time>
                          {decision.reason ? <span className={styles.secondaryText}>Reason: {decision.reason}</span> : null}
                        </p>
                      ) : null}
                      {reminders.length > 0 ? <ol className={`history-list ${styles.compactHistory}`} aria-label={`Estimate v${estimate.version} reminders`}>{reminders.map((item) => <li key={item.id}><strong>Simulated 24-hour call reminder</strong><time dateTime={item.reminderAt}>{timestampLabel(item.reminderAt)}</time></li>)}</ol> : null}
                      {incurredCosts.length > 0 ? <ol className={`history-list ${styles.compactHistory}`} aria-label={`Estimate v${estimate.version} authorized costs`}>{incurredCosts.map((item) => <li key={item.id}><strong>{item.description} · {formatMoney(item.amountCents, item.currency)} USD</strong><span>Authorized by {item.authorizedBy} · <time dateTime={item.recordedAt}>{timestampLabel(item.recordedAt)}</time></span></li>)}</ol> : null}
                      {refunds.length > 0 ? <ol className={`history-list ${styles.compactHistory}`} aria-label={`Estimate v${estimate.version} refunds`}>{refunds.map((item) => <li key={item.id}><strong>Simulated refund: {formatMoney(item.unspentCents, item.currency)} USD</strong><span>{formatMoney(item.fundedCents, item.currency)} USD funded · {formatMoney(item.authorizedIncurredCents, item.currency)} USD authorized costs</span><time dateTime={item.processedAt}>{timestampLabel(item.processedAt)}</time></li>)}</ol> : null}

                      {isCurrent && (phase === "estimate-approval-required" || phase === "estimate-unanswered") ? (
                        <div className={styles.actionGroup}>
                          <p>Approve only the work listed in this estimate. Any additional work needs separate approval.</p>
                          <div className="button-row">
                            <button className="button" type="button" onClick={() => run(() => actions.approveEstimate(caseId))}>Approve exact estimate</button>
                            <button className="button button-secondary" type="button" onClick={() => run(() => actions.declineEstimate(caseId, "Simulated customer declined this repair scope."))}>Decline estimate</button>
                          </div>
                        </div>
                      ) : null}

                      {isCurrent && phase === "estimate-payment-required" ? (
                        <div className={styles.actionGroup}>
                          <p>Approved amount still due: {formatMoney(getOutstandingAdvance(sampleCase, estimate.id), estimate.currency)} USD.</p>
                          <p>Available prior unallocated credit: {formatMoney(availableAdvanceCredit, estimate.currency)} USD. Credit requires explicit allocation and fresh approval.</p>
                          <div className="button-row">
                            {availableAdvanceCredit > 0 ? <button className="button button-secondary" type="button" onClick={() => run(() => actions.applyAdvanceCredit(caseId, Math.min(availableAdvanceCredit, getOutstandingAdvance(sampleCase, estimate.id))))}>Apply available credit</button> : null}
                            <button className="button" type="button" onClick={() => run(() => actions.attemptPayment(caseId, "repair-advance", "simulated-success"))}>Simulate successful repair advance</button>
                            <button className="button button-secondary" type="button" onClick={() => run(() => actions.attemptPayment(caseId, "repair-advance", "simulated-failed"))}>Simulate failed advance</button>
                            <button className="button button-secondary" type="button" onClick={() => run(() => actions.attemptPayment(caseId, "repair-advance", "simulated-canceled"))}>Simulate canceled advance</button>
                          </div>
                        </div>
                      ) : null}
                      {isCurrent && phase === "repair-ready" ? <p className={styles.successMessage}>Current estimate is approved and fully funded. Staff may coordinate the approved scope.</p> : null}
                      {isCurrent && phase === "repair-ready" ? <button className="button button-secondary" type="button" onClick={() => run(() => actions.declineEstimate(caseId, "Simulated customer rejected the funded scope before repair started."))}>Decline before repair starts</button> : null}
                      {isCurrent && phase === "estimate-declined" ? <p className={styles.blockedReason}>Declined estimate cannot authorize repair. Any refund is simulated only after authorized incurred costs are disclosed.</p> : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section id="payments" className={styles.panel} aria-labelledby="payments-title">
            <div className={styles.sectionHeading}>
              <h2 id="payments-title">Payments and credit</h2>
              <SimulationBadge>payments</SimulationBadge>
            </div>
            <h3>Payment attempts</h3>
            {sampleCase.payments.length === 0 ? <p className={styles.emptyText}>No simulated payment attempts recorded.</p> : (
              <ol className="history-list">
                {sampleCase.payments.map((payment) => (
                  <li key={payment.id}>
                    <strong>{payment.label}</strong>
                    <span>{formatMoney(payment.amountCents, payment.currency)} USD · {payment.outcome.replace("simulated-", "Simulated ")}</span>
                    <time dateTime={payment.attemptedAt}>{timestampLabel(payment.attemptedAt)}</time>
                  </li>
                ))}
              </ol>
            )}

            {sampleCase.finalPayments.length > 0 ? <>
              <h3>Final payment attempts</h3>
              <ol className="history-list">
                {sampleCase.finalPayments.map((payment) => {
                  const estimate = sampleCase.estimates.find((item) => item.id === payment.estimateVersionId);
                  return <li key={payment.id}><strong>{formatMoney(payment.amountCents, payment.currency)} USD</strong><span>{payment.outcome.replace("simulated-", "Simulated ")}{estimate ? ` · Estimate v${estimate.version}` : ""}</span><time dateTime={payment.attemptedAt}>{timestampLabel(payment.attemptedAt)}</time></li>;
                })}
              </ol>
            </> : null}

            {sampleCase.advanceCreditAllocations.length > 0 ? <>
              <h3>Advance credit allocations</h3>
              <ol className="history-list">
                {sampleCase.advanceCreditAllocations.map((allocation) => {
                  const sourcePayment = sampleCase.payments.find((payment) => payment.id === allocation.sourcePaymentId);
                  const estimate = sampleCase.estimates.find((item) => item.id === allocation.estimateVersionId);
                  return <li key={allocation.id}><strong>{formatMoney(allocation.amountCents, allocation.currency)} USD allocated by {allocation.allocatedBy}</strong><span>{sourcePayment?.label ?? "Prior payment"}{estimate ? ` · Estimate v${estimate.version}` : ""}</span><time dateTime={allocation.allocatedAt}>{timestampLabel(allocation.allocatedAt)}</time></li>;
                })}
              </ol>
            </> : null}
            <p className={styles.demoNotice}>Amounts and outcomes are simulated in this browser. They do not represent a real charge or settlement.</p>
          </section>

          <section id="records" className={styles.panel} aria-labelledby="records-title">
            <div className={styles.sectionHeading}>
              <h2 id="records-title">Case records</h2>
              <SimulationBadge>sample records</SimulationBadge>
            </div>

            <section className={styles.recordSection} aria-labelledby="transport-title">
              <h3 id="transport-title">Transport and custody</h3>
              {sampleCase.transport.kind === "not-required" ? <p className={styles.emptyText}>No separate vehicle transport is included in this case.</p> : <>
                <p>{sampleCase.transport.scope}</p>
                <dl className={styles.recordFacts}>
                  <div><dt>Destination</dt><dd>{sampleCase.transport.destination}</dd></div>
                  <div><dt>Transport</dt><dd>{formatMoney(sampleCase.transport.transportFeeCents, sampleCase.transport.currency)} USD</dd></div>
                  <div><dt>Storage</dt><dd>{formatMoney(sampleCase.transport.storageFeeCents, sampleCase.transport.currency)} USD · separate from assessment</dd></div>
                </dl>
                {phase === "transport-authorization-required" ? <button className="button" type="button" onClick={() => run(() => actions.authorizeTransport(caseId))}>Authorize transport and storage</button> : null}
                {phase === "transport-payment-required" ? paymentButtons("transport-storage") : null}
                {phase === "transport-decision-required" ? <p className={styles.blockedReason}>Staff must record qualified drive-or-tow input before dispatch.</p> : null}
                {phase === "transport-receiver-required" ? <p className={styles.blockedReason}>Staff must assign one custody-only receiver before dispatch.</p> : null}
                {phase === "transport-ready" ? <p className={styles.successMessage}>Transport and storage are authorized and paid; staff may record simulated dispatch.</p> : null}
                {phase === "custody-handover-required" ? <p className={styles.blockedReason}>Dispatch is recorded. Staff must record the simulated custody handover.</p> : null}
                {sampleCase.transport.authorizedAt ? <p className={styles.recordLine}>Authorized by {sampleCase.transport.authorizer} · <time dateTime={sampleCase.transport.authorizedAt}>{timestampLabel(sampleCase.transport.authorizedAt)}</time></p> : null}
                {sampleCase.transport.qualifiedDecision ? <p className={styles.recordLine}>Qualified route: {sampleCase.transport.qualifiedDecision.path} ({sampleCase.transport.qualifiedDecision.suitability}) · {sampleCase.transport.qualifiedDecision.rationale} · recorded by {sampleCase.transport.qualifiedDecision.qualifiedInputName} on <time dateTime={sampleCase.transport.qualifiedDecision.recordedAt}>{timestampLabel(sampleCase.transport.qualifiedDecision.recordedAt)}</time></p> : null}
                {sampleCase.transport.receiver ? <p className={styles.recordLine}>Custody receiver: {sampleCase.transport.receiver.name} ({sampleCase.transport.receiver.relation}); custody-only authority, assigned by {sampleCase.transport.receiver.assignedBy} · <time dateTime={sampleCase.transport.receiver.assignedAt}>{timestampLabel(sampleCase.transport.receiver.assignedAt)}</time></p> : null}
                {sampleCase.transport.dispatchedAt ? <p className={styles.recordLine}>Simulated dispatch · <time dateTime={sampleCase.transport.dispatchedAt}>{timestampLabel(sampleCase.transport.dispatchedAt)}</time></p> : null}
                {sampleCase.transport.handover ? <div className={styles.recordBox}><strong>Custody handover recorded</strong><p>Received by {sampleCase.transport.handover.receiverName} · {sampleCase.transport.handover.condition} · {sampleCase.transport.handover.mileage} km · {sampleCase.transport.handover.keys}</p><p>Destination: {sampleCase.transport.handover.destination}</p><p>Receiving the vehicle does not authorize repairs or spending.</p><time dateTime={sampleCase.transport.handover.receivedAt}>{timestampLabel(sampleCase.transport.handover.receivedAt)}</time></div> : null}
                {phase === "custody-return-required" ? <p className={styles.blockedReason}>The assessment is complete; staff must record simulated return to release active capacity.</p> : null}
                {sampleCase.transport.returnedAt ? <p className={styles.successMessage}>Simulated return recorded; this case no longer occupies active-car capacity. <time dateTime={sampleCase.transport.returnedAt}>{timestampLabel(sampleCase.transport.returnedAt)}</time></p> : null}
                {sampleCase.transport.assessmentEarliestDate ? <p className={styles.blockedReason}>Private-parking exception: assessment cannot begin before {sampleCase.transport.assessmentEarliestDate}.</p> : null}
              </>}</section>

            <section className={styles.recordSection} aria-labelledby="assessment-title">
              <div className={styles.sectionHeading}>
                <h3 id="assessment-title">Initial assessment</h3>
                {sampleCase.assessment.feeEarned ? <span className="status-pill">Fee earned</span> : null}
              </div>
              <p>{sampleCase.assessment.scope}</p>
              <p className={styles.priceLine}><strong>{formatMoney(sampleCase.assessment.feeCents, sampleCase.assessment.currency)} USD</strong><span>Illustrative fixed fee · earned only after the visit occurs</span></p>
              {phase === "pending-staff-confirmation" ? <p className={styles.blockedReason}>Staff must confirm the appointment first.</p> : null}
              {phase === "assessment-authorization-required" ? <button className="button" type="button" onClick={() => run(() => actions.authorizeInitialAssessment(caseId))}>Authorize as simulated customer</button> : null}
              {phase === "assessment-payment-required" ? paymentButtons("assessment") : null}
              {phase === "assessment-ready" ? <p className={styles.successMessage}>Authorized and paid. Staff may now record the expert visit.</p> : null}
              {sampleCase.assessment.authorizedAt ? <p className={styles.recordLine}>Authorized by {sampleCase.assessment.authorizer} · <time dateTime={sampleCase.assessment.authorizedAt}>{timestampLabel(sampleCase.assessment.authorizedAt)}</time></p> : null}
              {sampleCase.assessment.performedAt ? <div className={styles.recordBox}><strong>Assessment by {sampleCase.assessment.expertName}</strong><p>{sampleCase.assessment.findings}</p><p>Deeper investigation: {sampleCase.assessment.needsInvestigation ? "Recommended separately" : "Not required"}</p><time dateTime={sampleCase.assessment.performedAt}>{timestampLabel(sampleCase.assessment.performedAt)}</time></div> : null}
              {phase === "further-service-declined" ? <p className={styles.blockedReason}>Further service declined. The completed assessment and all payment attempts remain recorded.</p> : null}
              {phase !== "further-service-declined" && (phase === "assessment-complete" || phase === "estimate-required" || phase === "investigation-authorization-required" || phase === "investigation-payment-required") ? <button className="button button-secondary" type="button" onClick={() => run(() => actions.declineService(caseId))}>Decline further service</button> : null}
            </section>

            {(sampleCase.assessment.needsInvestigation || sampleCase.assessment.investigation.authorizedAt || sampleCase.assessment.investigation.completedAt) ? (
              <section className={styles.recordSection} aria-labelledby="investigation-title">
                <div className={styles.sectionHeading}><h3 id="investigation-title">Separate investigation</h3><SimulationBadge>separate authorization</SimulationBadge></div>
                <p>{sampleCase.assessment.investigation.scope}</p>
                <p className={styles.priceLine}><strong>{formatMoney(sampleCase.assessment.investigation.feeCents, sampleCase.assessment.investigation.currency)} USD</strong><span>Illustrative fee · separate from the initial assessment</span></p>
                {phase === "investigation-authorization-required" ? <button className="button" type="button" onClick={() => run(() => actions.authorizeInvestigation(caseId))}>Authorize separate investigation</button> : null}
                {phase === "investigation-payment-required" ? <div className={styles.actionGroup}><p>Initial assessment payment cannot fund this separate investigation.</p>{paymentButtons("investigation")}</div> : null}
                {phase === "investigation-funded" ? <p className={styles.successMessage}>Separate investigation is authorized and funded; staff will record findings before publishing the repair estimate.</p> : null}
                {sampleCase.assessment.investigation.authorizedAt ? <p className={styles.recordLine}>Authorized by {sampleCase.assessment.investigation.authorizer} · <time dateTime={sampleCase.assessment.investigation.authorizedAt}>{timestampLabel(sampleCase.assessment.investigation.authorizedAt)}</time></p> : null}
                {sampleCase.assessment.investigation.completedAt ? <div className={styles.recordBox}><strong>Investigation by {sampleCase.assessment.investigation.expertName}</strong><p>{sampleCase.assessment.investigation.findings}</p><time dateTime={sampleCase.assessment.investigation.completedAt}>{timestampLabel(sampleCase.assessment.investigation.completedAt)}</time></div> : null}
              </section>
            ) : null}

            {sampleCase.performedWork.length || sampleCase.qualityChecks.length || sampleCase.settlements.length || sampleCase.invoices.length || sampleCase.warranties.length || sampleCase.returns.length || sampleCase.complaints.length ? (
              <section className={styles.recordSection} aria-labelledby="completion-title">
                <h3 id="completion-title">Work and completion records</h3>
                {sampleCase.performedWork.map((work) => <p className={styles.recordLine} key={work.id}><strong>Performed work:</strong> {work.summary} ({work.performedBy}) · <time dateTime={work.performedAt}>{timestampLabel(work.performedAt)}</time></p>)}
                {sampleCase.qualityChecks.map((check) => <p className={styles.recordLine} key={check.id}><strong>Quality {check.result} by {check.specialist}:</strong> {check.findings} · <time dateTime={check.checkedAt}>{timestampLabel(check.checkedAt)}</time></p>)}
                {sampleCase.settlements.map((settlement) => <div className={styles.recordBox} key={settlement.id}><p><strong>Settlement recorded by {settlement.settledBy}:</strong> {formatMoney(settlement.approvedWorkCents, "USD")} USD approved · {formatMoney(settlement.incurredCents, "USD")} USD incurred · {formatMoney(settlement.outstandingCents, "USD")} USD outstanding · <time dateTime={settlement.settledAt}>{timestampLabel(settlement.settledAt)}</time></p>{phase === "settlement-payment-required" && settlement.estimateVersionId === currentEstimate?.id ? <div className={styles.actionGroup}><p>Final balance due: {formatMoney(settlement.outstandingCents, "USD")} USD.</p>{finalPaymentButtons()}</div> : null}</div>)}
                {sampleCase.invoices.map((invoice) => <p className={styles.recordLine} key={invoice.id}><strong>Illustrative invoice:</strong> {invoice.summary} · {formatMoney(invoice.totalCents, invoice.currency)} USD · <time dateTime={invoice.issuedAt}>{timestampLabel(invoice.issuedAt)}</time></p>)}
                {sampleCase.warranties.map((warranty) => <p className={styles.recordLine} key={warranty.id}><strong>Illustrative warranty:</strong> {warranty.terms} · <time dateTime={warranty.issuedAt}>{timestampLabel(warranty.issuedAt)}</time></p>)}
                {sampleCase.returns.map((record) => <div className={styles.recordBox} key={record.id}><strong>Returned to {record.recipientName} ({record.recipientAuthority === "owner" ? "owner" : "authorized representative"})</strong><p>{record.condition} · {record.mileage} km · {record.keys}</p>{record.authorizationEvidence ? <p>Authority evidence: {record.authorizationEvidence}</p> : null}<p>Coordinator: {record.coordinator}</p><p>Warranty and complaint rights remain open.</p><time dateTime={record.returnedAt}>{timestampLabel(record.returnedAt)}</time></div>)}
                {sampleCase.complaints.map((complaint) => <div className={styles.recordBox} key={complaint.id}><strong>Complaint review opened by {complaint.coordinator}</strong><p>{complaint.summary}</p><time dateTime={complaint.openedAt}>{timestampLabel(complaint.openedAt)}</time>{complaint.secondAssessmentAuthorizedAt ? <p>Separate assessment authorized · <time dateTime={complaint.secondAssessmentAuthorizedAt}>{timestampLabel(complaint.secondAssessmentAuthorizedAt)}</time></p> : null}</div>)}
              </section>
            ) : null}

            <section className={styles.recordSection} aria-labelledby="sms-title">
              <div className={styles.sectionHeading}><h3 id="sms-title">Daily updates</h3><SimulationBadge>SMS log</SimulationBadge></div>
              {sampleCase.smsLog.length === 0 ? <p className={styles.emptyText}>No daily summaries recorded.</p> : <ol className="history-list">{sampleCase.smsLog.map((sms) => <li key={sms.id}><strong>{sms.summaryDate ? <time dateTime={sms.summaryDate}>{sms.summaryDate}</time> : null}{sms.nonWorkingDay ? " · non-working day" : ""}</strong><span>{sms.situation}</span><span>Next: {sms.nextAction} · {sms.expectedTiming}</span></li>)}</ol>}
              <p className={styles.demoNotice}>These simulated updates do not authorize work, charges, consent, or custody changes.</p>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}
