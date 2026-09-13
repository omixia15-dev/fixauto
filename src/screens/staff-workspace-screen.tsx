"use client";

import { useState, type FormEvent } from "react";
import { CaseSummary } from "../components/case-summary";
import { SimulationBadge } from "../components/simulation-badge";
import { findCase, getActiveCarCount, getActiveOccupant, getCasePhase, getCurrentEstimate, getAvailableAdvanceCredit } from "../domain/sample-case";
import { getCasePresentation } from "../presentation/case-status";
import { useDemoCases } from "../store/demo-case-provider";

export function StaffWorkspaceScreen() {
  const actions = useDemoCases();
  const [selectedId, setSelectedId] = useState(() => actions.data.cases.at(-1)?.id ?? "case-atlas-001");
  const [expertName, setExpertName] = useState("Arman Karimi");
  const [findings, setFindings] = useState("Initial expert visit indicates that workshop investigation is needed.");
  const [needsInvestigation, setNeedsInvestigation] = useState(true);
  const [qualifiedInputName, setQualifiedInputName] = useState("Dr. Nima Farhadi");
  const [suitability, setSuitability] = useState<"drive-suitable" | "tow-required" | "uncertain">("uncertain");
  const [transportRationale, setTransportRationale] = useState("Suitability is unresolved, so the safe sample path is towing.");
  const [receiverName, setReceiverName] = useState("Mina Rahimi");
  const [receiverRelation, setReceiverRelation] = useState<"customer" | "brother-in-law" | "father">("customer");
  const [condition, setCondition] = useState("No new visible damage in this simulated handover.");
  const [mileage, setMileage] = useState("50000");
  const [keys, setKeys] = useState("One ignition key and one remote.");
  const [destination, setDestination] = useState("Designated Fixauto private parking");
  const [estimateTiming, setEstimateTiming] = useState("3 business days after approval");
  const [partDescription, setPartDescription] = useState("Front brake pad set");
  const [partBrand, setPartBrand] = useState("Bosch");
  const [partCondition, setPartCondition] = useState<"new" | "used" | "remanufactured">("new");
  const [partWarranty, setPartWarranty] = useState("12 months");
  const [partPrice, setPartPrice] = useState("240");
  const [laborPrice, setLaborPrice] = useState("180");
  const [managementPrice, setManagementPrice] = useState("35");
  const [costDescription, setCostDescription] = useState("Authorized diagnostic parts reservation");
  const [costAmount, setCostAmount] = useState("0");
  const [workSummary, setWorkSummary] = useState("Approved brake replacement completed; no substitutions.");
  const [qualityFindings, setQualityFindings] = useState("Brake operation verified against the approved scope.");
  const [qualityResult, setQualityResult] = useState<"passed" | "failed">("passed");
  const [returnName, setReturnName] = useState("D4 Customer");
  const [returnAuthority, setReturnAuthority] = useState<"owner" | "authorized-representative">("owner");
  const [returnEvidence, setReturnEvidence] = useState("");
  const [returnCondition, setReturnCondition] = useState("No new visible damage in the simulated return.");
  const [returnMileage, setReturnMileage] = useState("81234");
  const [returnKeys, setReturnKeys] = useState("One ignition key and one remote.");
  const [complaintSummary, setComplaintSummary] = useState("Customer reports a concern for coordinator review.");
  const [summarySituation, setSummarySituation] = useState("Vehicle remains safely held while the next approved step is reviewed.");
  const [summaryNextAction, setSummaryNextAction] = useState("Coordinator will update the customer after the next check.");
  const [summaryTiming, setSummaryTiming] = useState("Next staffed period");
  const [summaryDate, setSummaryDate] = useState(new Date().toISOString().slice(0, 10));
  const [summaryNonWorking, setSummaryNonWorking] = useState(false);
  const [actionError, setActionError] = useState("");
  const sampleCase = findCase(actions.data, selectedId) ?? actions.data.cases.at(-1)!;
  const phase = getCasePhase(sampleCase);
  const presentation = getCasePresentation(sampleCase);
  const currentEstimate = getCurrentEstimate(sampleCase);
  const fundedCurrentEstimateCents = currentEstimate
    ? sampleCase.payments.filter((payment) => payment.purpose === "repair-advance" && payment.estimateVersionId === currentEstimate.id && payment.outcome === "simulated-success").reduce((sum, payment) => sum + payment.amountCents, 0)
      + sampleCase.advanceCreditAllocations.filter((allocation) => allocation.estimateVersionId === currentEstimate.id).reduce((sum, allocation) => sum + allocation.amountCents, 0)
    : 0;
  const estimatePreviewCents = Math.round(Number(partPrice || 0) * 100) + Math.round(Number(laborPrice || 0) * 100) + Math.round(Number(managementPrice || 0) * 100);

  function run(action: () => void) {
    try {
      action();
      setActionError("");
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "The sample action was blocked.");
    }
  }

  function handleAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(() => actions.completeInitialAssessment(sampleCase.id, { expertName, findings, needsInvestigation }));
  }

  return (
    <div className="page-stack" aria-busy={!actions.ready}>
      <section className="page-intro">
        <div>
          <SimulationBadge>staff role</SimulationBadge>
          <p className="eyebrow">Staff workspace</p>
          <h1>Request and assessment queue</h1>
          <p className="lede">Confirm requests and record an assessment only after separate consent and payment.</p>
        </div>
        <div className="capacity-card"><span>Active car capacity</span><strong>{getActiveCarCount(actions.data)} / 1</strong><small>{getActiveOccupant(actions.data)?.reference ? `Occupied by ${getActiveOccupant(actions.data)?.reference}.` : "Parked and dispatched sample vehicles count."}</small></div>
      </section>
      {actionError ? <p className="error-banner" role="alert">{actionError}</p> : null}
      <div className="workspace-grid">
        <aside className="card case-list" aria-labelledby="case-list-title">
          <h2 id="case-list-title">Cases</h2>
          <div className="case-list-stack">
            {actions.data.cases.map((item) => (
              <button
                className="case-list-item"
                type="button"
                key={item.id}
                aria-pressed={item.id === sampleCase.id}
                onClick={() => setSelectedId(item.id)}
              >
                <span>{item.reference}</span><strong>{item.customer.name}</strong><small>{getCasePresentation(item).status}</small>
              </button>
            ))}
          </div>
        </aside>
        <div className="page-stack">
          <CaseSummary sampleCase={sampleCase} />
          <section className="card" aria-labelledby="daily-summary-title"><div className="section-heading"><h2 id="daily-summary-title">Simulated daily summary</h2><SimulationBadge>SMS log</SimulationBadge></div><p className="helper-text">A summary is informational only; it never grants consent, approval, payment, custody, or repair authority.</p>{sampleCase.smsLog.length > 0 ? <ol className="history-list">{sampleCase.smsLog.map((sms) => <li key={sms.id}><strong>{sms.summaryDate ?? "Historical update"}</strong><span>{sms.situation}</span><span>Next: {sms.nextAction} · {sms.expectedTiming}</span></li>)}</ol> : null}<input aria-label="Summary date" value={summaryDate} onChange={(event) => setSummaryDate(event.target.value)} /><textarea aria-label="Summary situation" value={summarySituation} onChange={(event) => setSummarySituation(event.target.value)} /><input aria-label="Summary next action" value={summaryNextAction} onChange={(event) => setSummaryNextAction(event.target.value)} /><input aria-label="Summary timing" value={summaryTiming} onChange={(event) => setSummaryTiming(event.target.value)} /><label className="checkbox-row"><input type="checkbox" checked={summaryNonWorking} onChange={(event) => setSummaryNonWorking(event.target.checked)} /> Non-working day while vehicle is held</label><button className="button button-secondary" type="button" onClick={() => run(() => actions.addDailySummary(sampleCase.id, { situation: summarySituation, nextAction: summaryNextAction, expectedTiming: summaryTiming, summaryDate, nonWorkingDay: summaryNonWorking }))}>Add simulated summary</button></section>
          <section className="card" aria-labelledby="staff-next-title">
            <p className="eyebrow">Next required action</p>
            <h2 id="staff-next-title">{presentation.nextAction}</h2>
            <p>{presentation.timing}</p>

            {phase === "pending-staff-confirmation" ? (
              <div className="nested-panel">
                <p>Requested: {sampleCase.request.preferredDate} at {sampleCase.request.preferredTime}</p>
                <p>{sampleCase.request.serviceMode === "office-dropoff"
                  ? "Office drop-off requested"
                  : `${sampleCase.request.serviceMode === "collection-request" ? "Collection address review" : "Expert visit"}: ${sampleCase.request.visitAddress}`}</p>
                <button className="button" type="button" onClick={() => run(() => actions.confirmAppointment(sampleCase.id))}>
                  Confirm requested appointment
                </button>
              </div>
            ) : null}

            {phase === "assessment-authorization-required" ? <p className="blocked-reason">Blocked: the sample customer must authorize the disclosed assessment scope and fee.</p> : null}
            {phase === "assessment-payment-required" ? <p className="blocked-reason">Blocked: assessment payment has not succeeded.</p> : null}

            {sampleCase.transport.kind !== "not-required" && phase === "transport-authorization-required" ? <p className="blocked-reason">Blocked: the sample customer must authorize the separate transport and storage scope.</p> : null}
            {sampleCase.transport.kind !== "not-required" && phase === "transport-payment-required" ? <p className="blocked-reason">Blocked: transport and storage payment has not succeeded.</p> : null}

            {phase === "transport-decision-required" ? (
              <form className="assessment-form" onSubmit={(event) => { event.preventDefault(); run(() => actions.recordTransportDecision(sampleCase.id, { qualifiedInputName, suitability, rationale: transportRationale })); }}>
                <h3>Qualified drive-or-tow input</h3>
                <label htmlFor="qualifiedInputName">Qualified sample input name</label>
                <input id="qualifiedInputName" value={qualifiedInputName} onChange={(event) => setQualifiedInputName(event.target.value)} />
                <label htmlFor="suitability">Suitability</label>
                <select id="suitability" value={suitability} onChange={(event) => setSuitability(event.target.value as typeof suitability)}>
                  <option value="drive-suitable">Drive is suitable</option>
                  <option value="tow-required">Tow is required</option>
                  <option value="uncertain">Suitability is unresolved</option>
                </select>
                <label htmlFor="transportRationale">Decision rationale</label>
                <textarea id="transportRationale" value={transportRationale} onChange={(event) => setTransportRationale(event.target.value)} />
                <button className="button" type="submit">Record transport decision</button>
              </form>
            ) : null}

            {phase === "transport-receiver-required" ? (
              <form className="assessment-form" onSubmit={(event) => { event.preventDefault(); run(() => actions.assignReceiver(sampleCase.id, { name: receiverName, relation: receiverRelation })); }}>
                <h3>Assign custody-only receiver</h3>
                <label htmlFor="receiverName">Receiver name</label>
                <input id="receiverName" value={receiverName} onChange={(event) => setReceiverName(event.target.value)} />
                <label htmlFor="receiverRelation">Relationship</label>
                <select id="receiverRelation" value={receiverRelation} onChange={(event) => setReceiverRelation(event.target.value as typeof receiverRelation)}>
                  <option value="customer">Customer</option><option value="brother-in-law">Brother-in-law</option><option value="father">Father</option>
                </select>
                <p className="helper-text">Receiving the vehicle gives custody authority only, never repair-spending authority.</p>
                <button className="button" type="submit">Assign receiver</button>
              </form>
            ) : null}

            {phase === "transport-ready" ? (
              <div className="nested-panel"><p>Capacity check occurs at dispatch; a vehicle already in custody blocks this action.</p><button className="button" type="button" onClick={() => run(() => actions.dispatch(sampleCase.id))}>Record simulated dispatch</button></div>
            ) : null}

            {phase === "custody-handover-required" ? (
              <form className="assessment-form" onSubmit={(event) => { event.preventDefault(); run(() => actions.recordHandover(sampleCase.id, { receiverName: sampleCase.transport.receiver?.name ?? receiverName, condition, mileage: Number(mileage), keys, destination: destination || sampleCase.transport.destination })); }}>
                <h3>Record custody handover</h3>
                <label htmlFor="condition">Vehicle condition</label><textarea id="condition" value={condition} onChange={(event) => setCondition(event.target.value)} />
                <label htmlFor="mileage">Mileage</label><input id="mileage" inputMode="numeric" value={mileage} onChange={(event) => setMileage(event.target.value)} />
                <label htmlFor="keys">Keys received</label><input id="keys" value={keys} onChange={(event) => setKeys(event.target.value)} />
                <label htmlFor="destination">Destination</label><input id="destination" value={destination} onChange={(event) => setDestination(event.target.value)} />
                <button className="button" type="submit">Record custody handover</button>
              </form>
            ) : null}

            {phase === "custody-return-required" ? <div className="nested-panel"><p>Return is a simulated custody release only; settlement and warranty remain D5.</p><button className="button" type="button" onClick={() => run(() => actions.recordReturn(sampleCase.id))}>Record simulated vehicle return</button></div> : null}

            {phase === "assessment-ready" ? (
              <form className="assessment-form" onSubmit={handleAssessment}>
                <label htmlFor="expertName">Sample expert name</label>
                <input id="expertName" value={expertName} onChange={(event) => setExpertName(event.target.value)} />
                <label htmlFor="findings">Assessment findings</label>
                <textarea id="findings" value={findings} onChange={(event) => setFindings(event.target.value)} />
                <label className="checkbox-row">
                  <input type="checkbox" checked={needsInvestigation} onChange={(event) => setNeedsInvestigation(event.target.checked)} />
                  Deeper workshop investigation is needed
                </label>
                <button className="button" type="submit">Record completed assessment</button>
              </form>
            ) : null}

            {phase === "assessment-ready" && sampleCase.transport.assessmentEarliestDate ? <p className="blocked-reason">This private-parking assessment is not eligible before {sampleCase.transport.assessmentEarliestDate}.</p> : null}

            {sampleCase.assessment.performedAt ? (
              <div className="nested-panel">
                <strong>Assessment recorded by {sampleCase.assessment.expertName}</strong>
                <p>{sampleCase.assessment.findings}</p>
                <p>Assessment fee: earned under the authorized scope.</p>
                {sampleCase.assessment.needsInvestigation ? <p>Deeper investigation is separate; customer authorization/payment status: {phase.replaceAll("-", " ")}.</p> : null}
              </div>
            ) : null}

            {(phase === "estimate-required" || phase === "estimate-declined" || phase === "estimate-unanswered" || phase === "estimate-approval-required" || phase === "estimate-payment-required" || phase === "repair-ready") && sampleCase.assessment.needsInvestigation === false ? (
              <form className="assessment-form" onSubmit={(event) => { event.preventDefault(); run(() => actions.publishEstimate(sampleCase.id, {
                expectedTiming: estimateTiming,
                lines: [
                  { id: "part-brake-pad", category: "part", description: partDescription, quantity: 1, unitPriceCents: Math.round(Number(partPrice) * 100), part: { brand: partBrand, condition: partCondition, warranty: partWarranty } },
                  { id: "labor-brake", category: "labor", description: "Repair labor", quantity: 1, unitPriceCents: Math.round(Number(laborPrice) * 100) },
                  { id: "management-fee", category: "management-fee", description: "Repair coordination fee", quantity: 1, unitPriceCents: Math.round(Number(managementPrice) * 100) },
                ],
              })); }}>
                <h3>Publish a new immutable estimate version</h3>
                <label htmlFor="estimateTiming">Expected timing</label>
                <input id="estimateTiming" value={estimateTiming} onChange={(event) => setEstimateTiming(event.target.value)} />
                <label htmlFor="partDescription">Part description</label><input id="partDescription" value={partDescription} onChange={(event) => setPartDescription(event.target.value)} />
                <label htmlFor="partBrand">Part brand</label><input id="partBrand" value={partBrand} onChange={(event) => setPartBrand(event.target.value)} />
                <label htmlFor="partCondition">Part condition</label><select id="partCondition" value={partCondition} onChange={(event) => setPartCondition(event.target.value as typeof partCondition)}><option value="new">New</option><option value="used">Used</option><option value="remanufactured">Remanufactured</option></select>
                <label htmlFor="partWarranty">Part warranty</label><input id="partWarranty" value={partWarranty} onChange={(event) => setPartWarranty(event.target.value)} />
                <label htmlFor="partPrice">Part price (USD)</label><input id="partPrice" inputMode="decimal" value={partPrice} onChange={(event) => setPartPrice(event.target.value)} />
                <label htmlFor="laborPrice">Labor amount (USD)</label><input id="laborPrice" inputMode="decimal" value={laborPrice} onChange={(event) => setLaborPrice(event.target.value)} />
                <label htmlFor="managementPrice">Management fee (USD)</label><input id="managementPrice" inputMode="decimal" value={managementPrice} onChange={(event) => setManagementPrice(event.target.value)} />
                <p className="price-line"><strong>Calculated total: {(estimatePreviewCents / 100).toFixed(2)} USD</strong><span>All amounts are illustrative sample USD.</span></p>
                <p className="helper-text">Publishing creates a new version; it never edits an earlier estimate or carries approval forward.</p>
                <button className="button" type="submit">Publish estimate v{(sampleCase.estimates.length || 0) + 1}</button>
              </form>
            ) : null}

            {currentEstimate && (phase === "repair-ready" || phase === "estimate-declined") ? (
              <div className="nested-panel">
                <h3>Estimate v{currentEstimate.version} settlement simulation</h3>
                <p>Funded: {(fundedCurrentEstimateCents / 100).toFixed(2)} USD · prior unallocated credit: {(getAvailableAdvanceCredit(sampleCase) / 100).toFixed(2)} USD</p>
                <form className="assessment-form" onSubmit={(event) => { event.preventDefault(); run(() => actions.recordIncurredCost(sampleCase.id, { description: costDescription, amountCents: Math.round(Number(costAmount) * 100), authorizedBy: "Simulated customer" })); }}>
                  <label htmlFor="costDescription">Authorized incurred cost</label><input id="costDescription" value={costDescription} onChange={(event) => setCostDescription(event.target.value)} />
                  <label htmlFor="costAmount">Amount (USD)</label><input id="costAmount" inputMode="decimal" value={costAmount} onChange={(event) => setCostAmount(event.target.value)} />
                  <button className="button button-secondary" type="submit">Record authorized cost</button>
                </form>
                {phase === "estimate-declined" ? <button className="button" type="button" onClick={() => run(() => actions.refundEstimate(sampleCase.id, currentEstimate.id))}>Record simulated refund of unspent advance</button> : null}
              </div>
            ) : null}

            {phase === "repair-ready" || phase === "quality-recheck-required" ? <div className="nested-panel"><h3>Record performed work</h3><textarea aria-label="Performed work summary" value={workSummary} onChange={(event) => setWorkSummary(event.target.value)} /><button className="button" type="button" onClick={() => run(() => actions.recordWork(sampleCase.id, workSummary, "Specialist workshop"))}>Record performed work</button></div> : null}
            {phase === "quality-check-required" || phase === "quality-recheck-required" ? <div className="nested-panel"><h3>Specialist quality check</h3><label htmlFor="qualityResult">Result</label><select id="qualityResult" value={qualityResult} onChange={(event) => setQualityResult(event.target.value as typeof qualityResult)}><option value="passed">Passed</option><option value="failed">Failed</option></select><textarea aria-label="Quality findings" value={qualityFindings} onChange={(event) => setQualityFindings(event.target.value)} /><button className="button" type="button" onClick={() => run(() => actions.recordQuality(sampleCase.id, { specialist: "Specialist workshop", result: qualityResult, findings: qualityFindings }))}>Record quality check</button></div> : null}
            {phase === "settlement-required" ? <div className="nested-panel"><p>Quality passed. The D4 advance normally leaves a zero final balance.</p><button className="button" type="button" onClick={() => run(() => actions.settle(sampleCase.id))}>Record illustrative settlement</button></div> : null}
            {phase === "settlement-payment-required" ? <div className="nested-panel"><button className="button" type="button" onClick={() => run(() => actions.attemptFinalPayment(sampleCase.id, "simulated-success"))}>Simulate final payment</button><button className="button button-secondary" type="button" onClick={() => run(() => actions.attemptFinalPayment(sampleCase.id, "simulated-failed"))}>Simulate failed final payment</button></div> : null}
            {phase === "return-required" ? <div className="nested-panel"><h3>Return to owner or authorized representative</h3><input aria-label="Return recipient" value={returnName} onChange={(event) => setReturnName(event.target.value)} /><select aria-label="Return authority" value={returnAuthority} onChange={(event) => setReturnAuthority(event.target.value as typeof returnAuthority)}><option value="owner">Owner</option><option value="authorized-representative">Authorized representative</option></select>{returnAuthority === "authorized-representative" ? <input aria-label="Return authorization evidence" value={returnEvidence} onChange={(event) => setReturnEvidence(event.target.value)} /> : null}<textarea aria-label="Return condition" value={returnCondition} onChange={(event) => setReturnCondition(event.target.value)} /><input aria-label="Return mileage" value={returnMileage} onChange={(event) => setReturnMileage(event.target.value)} /><input aria-label="Return keys" value={returnKeys} onChange={(event) => setReturnKeys(event.target.value)} /><button className="button" type="button" onClick={() => run(() => actions.returnVehicle(sampleCase.id, { recipientName: returnName, recipientAuthority: returnAuthority, authorizationEvidence: returnAuthority === "owner" ? null : returnEvidence, condition: returnCondition, mileage: Number(returnMileage), keys: returnKeys, coordinator: "Fixauto coordinator" }))}>Record vehicle return</button></div> : null}
            {phase === "completed" ? <div className="nested-panel"><button className="button" type="button" onClick={() => run(() => actions.issueRecords(sampleCase.id))}>Issue illustrative invoice and warranty</button><textarea aria-label="Complaint summary" value={complaintSummary} onChange={(event) => setComplaintSummary(event.target.value)} /><button className="button button-secondary" type="button" onClick={() => run(() => actions.openComplaint(sampleCase.id, complaintSummary))}>Open complaint review</button></div> : null}
            {phase === "complaint-review" ? <div className="nested-panel"><p>Complaint review is recorded under the coordinator; no charge or repair is authorized automatically.</p><button className="button" type="button" onClick={() => run(() => actions.authorizeSecondAssessment(sampleCase.id))}>Authorize separate no-charge second assessment review</button></div> : null}

            <div className="placeholder-grid" aria-label="Future workflow sections">
              <span>Transport · D3</span><span>Estimate · D4</span><span>Quality and return · D5</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
