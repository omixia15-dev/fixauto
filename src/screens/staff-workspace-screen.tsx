"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ResetSampleButton } from "../components/reset-sample-button";
import { formatMoney } from "../domain/currency";
import styles from "./staff-workspace-screen.module.css";
import { SimulationBadge } from "../components/simulation-badge";
import { findCase, getActiveCarCount, getActiveOccupant, getCasePhase, getCurrentEstimate, getAvailableAdvanceCredit, serviceDateFromIso } from "../domain/sample-case";
import { getCasePresentation } from "../presentation/case-status";
import { useDemoCases } from "../store/demo-case-provider";

export function StaffWorkspaceScreen({ initialCaseId }: { initialCaseId?: string }) {
  const actions = useDemoCases();
  const [selectedId, setSelectedId] = useState(() => initialCaseId ?? actions.data.cases.at(-1)?.id ?? "case-atlas-001");
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
  const [summarySituation, setSummarySituation] = useState("The next step is awaiting staff review.");
  const [summaryNextAction, setSummaryNextAction] = useState("Coordinator will update the customer after the next check.");
  const [summaryTiming, setSummaryTiming] = useState("Next staffed period");
  const [summaryDate, setSummaryDate] = useState(serviceDateFromIso(new Date().toISOString()));
  const [summaryNonWorking, setSummaryNonWorking] = useState(false);
  const [actionError, setActionError] = useState("");
  if (actions.storageError) return <div className={styles.screen}><section className={styles.state} role="alert"><h1>Saved cases are unavailable</h1><p>{actions.storageError}</p><button className="button" type="button" onClick={actions.retryStorage}>Try again</button></section></div>;
  if (!actions.ready) return <div className={styles.screen}><section className={styles.state} aria-busy="true"><h1>Staff workspace</h1><p role="status">Loading saved sample cases…</p><div className={styles.skeleton} aria-hidden="true" /></section></div>;
  const sampleCase = findCase(actions.data, selectedId);
  if (!sampleCase) return <div className={styles.screen}><section className={styles.state}><h1>{actions.data.cases.length ? "Case not found" : "No saved cases"}</h1><p>This case is not present in this browser. Choose a saved case or create a sample request.</p>{actions.data.cases.length ? <button className="button" type="button" onClick={() => { setSelectedId(actions.data.cases[0].id); window.history.replaceState(null, "", "/staff?caseId=" + encodeURIComponent(actions.data.cases[0].id)); }}>Return to staff queue</button> : <Link className="button" href="/case/new">Create sample request</Link>}</section></div>;
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
    run(() => actions.completeInitialAssessment(selectedId, { expertName, findings, needsInvestigation }));
  }

  const activity = [
    { at: sampleCase.request.createdAt, title: "Request received", detail: sampleCase.request.symptoms },
    ...(sampleCase.request.confirmedAppointment ? [{ at: sampleCase.request.confirmedAppointment.confirmedAt, title: "Appointment confirmed", detail: sampleCase.request.confirmedAppointment.coordinator }] : []),
    ...(sampleCase.assessment.performedAt ? [{ at: sampleCase.assessment.performedAt, title: "Initial assessment recorded", detail: sampleCase.assessment.findings ?? "" }] : []),
    ...(sampleCase.assessment.investigation.completedAt ? [{ at: sampleCase.assessment.investigation.completedAt, title: "Investigation completed", detail: sampleCase.assessment.investigation.findings ?? "" }] : []),
    ...(sampleCase.transport.dispatchedAt ? [{ at: sampleCase.transport.dispatchedAt, title: "Simulated dispatch recorded", detail: sampleCase.transport.destination }] : []),
    ...(sampleCase.transport.handover ? [{ at: sampleCase.transport.handover.receivedAt, title: "Custody received", detail: sampleCase.transport.handover.receiverName }] : []),
    ...sampleCase.estimates.map((item) => ({ at: item.publishedAt, title: `Estimate v${item.version} published`, detail: item.expectedTiming })),
    ...sampleCase.performedWork.map((item) => ({ at: item.performedAt, title: "Performed work recorded", detail: item.summary })),
    ...sampleCase.qualityChecks.map((item) => ({ at: item.checkedAt, title: `Quality check ${item.result}`, detail: item.findings })),
    ...(sampleCase.transport.returnedAt ? [{ at: sampleCase.transport.returnedAt, title: "Simulated vehicle return", detail: "This case no longer occupies capacity." }] : []),
    ...sampleCase.complaints.map((item) => ({ at: item.openedAt, title: "Complaint review opened", detail: item.summary })),
  ].sort((a, b) => a.at.localeCompare(b.at));
  return (
    <div className={styles.screen}>
      {actions.notice ? <p className={styles.notice} role="status">{actions.notice}</p> : null}
      {actionError ? <p className={styles.error} role="alert">{actionError}</p> : null}
      <div className={styles.tools}>
        <div><h1>Staff workspace</h1><label htmlFor="staff-case-selector">Select a case</label>
          <select id="staff-case-selector" value={sampleCase.id} onChange={(event) => { setSelectedId(event.target.value); setActionError(""); window.history.replaceState(null, "", "/staff?caseId=" + encodeURIComponent(event.target.value)); }}>
            {actions.data.cases.map((item) => <option key={item.id} value={item.id}>{item.reference} · {item.vehicle.make} {item.vehicle.model} · {item.customer.name}</option>)}
          </select>
        </div>
        <ResetSampleButton />
      </div>
      <header className={styles.identity}>
        <div><h2>{sampleCase.reference}</h2><p>{sampleCase.vehicle.year} {sampleCase.vehicle.make} {sampleCase.vehicle.model} · {sampleCase.customer.name}</p><span className={styles.status}>{presentation.status}</span></div>
        <div className={styles.capacity}><span>Active car capacity</span><strong>{getActiveCarCount(actions.data)} / 1</strong><small>{getActiveOccupant(actions.data)?.reference ? `Occupied by ${getActiveOccupant(actions.data)?.reference}.` : "Parked and dispatched sample vehicles count."}</small></div>
        <figure><Image src="/images/case-sample-sedan.png" alt="" width="320" height="160" sizes="(max-width: 500px) 104px, (max-width: 800px) 180px, 320px" /><figcaption>Illustrative vehicle</figcaption></figure>
      </header>
      <nav className={styles.anchorNav} aria-label="Staff case sections">
        <a href="#staff-overview">Overview</a><a href="#staff-workflow">Workflow</a><a href="#staff-updates">Updates</a><a href="#staff-records">Records</a>
      </nav>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <section id="staff-workflow" className={styles.panel + " " + styles.workflow} aria-labelledby="staff-next-title">
            <h2 id="staff-next-title">Next required action</h2>
            <div className={styles.nextAction}><h3>{presentation.nextAction}</h3><p>{presentation.timing}</p></div>
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
            {sampleCase.transport.kind !== "not-required" && sampleCase.transport.handover && !sampleCase.transport.returnedAt && !sampleCase.estimates.length && ["estimate-required", "estimate-approval-required", "estimate-unanswered", "estimate-declined"].includes(phase) ? <div className="nested-panel"><p>Assessment-only or canceled service may release custody here; this is optional and is not required to continue into repair.</p><button className="button button-secondary" type="button" onClick={() => run(() => actions.recordReturn(sampleCase.id))}>Record simulated vehicle return</button></div> : null}

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
                {sampleCase.assessment.investigation.completedAt ? <p><strong>Completed investigation:</strong> {sampleCase.assessment.investigation.findings} ({sampleCase.assessment.investigation.expertName})</p> : null}
              </div>
            ) : null}

            {phase === "investigation-funded" && !sampleCase.assessment.investigation.completedAt ? (
              <form className="assessment-form" onSubmit={(event) => { event.preventDefault(); run(() => actions.completeInvestigation(sampleCase.id, { expertName, findings })); }}>
                <h3>Record completed deeper investigation</h3>
                <label htmlFor="investigationExpert">Investigation expert</label><input id="investigationExpert" value={expertName} onChange={(event) => setExpertName(event.target.value)} />
                <label htmlFor="investigationFindings">Investigation findings</label><textarea id="investigationFindings" value={findings} onChange={(event) => setFindings(event.target.value)} />
                <button className="button" type="submit">Complete paid investigation</button>
              </form>
            ) : null}

            {(phase === "estimate-required" || phase === "estimate-declined" || phase === "estimate-unanswered" || phase === "estimate-approval-required" || phase === "estimate-payment-required" || phase === "repair-ready") && (sampleCase.assessment.needsInvestigation === false || Boolean(sampleCase.assessment.investigation.completedAt)) ? (
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


            <p className={styles.limit}>Actions are simulated. Customer consent and successful payment remain separate requirements.</p>
          </section>
          <section className={styles.panel + " " + styles.facts} aria-labelledby="staff-facts-title">
            <h2 id="staff-facts-title">Case facts</h2>
            <dl><div><dt>Customer</dt><dd>{sampleCase.customer.name}</dd></div><div><dt>Sample mobile</dt><dd>{sampleCase.customer.mobile}</dd></div><div><dt>Assessment fee</dt><dd>{formatMoney(sampleCase.assessment.feeCents, sampleCase.assessment.currency)} USD · illustrative</dd></div><div><dt>Coordinator</dt><dd>{sampleCase.request.confirmedAppointment?.coordinator ?? "Awaiting assignment"}</dd></div><div><dt>Custody receiver</dt><dd>{sampleCase.transport.receiver?.name ?? "Not assigned"}</dd></div></dl>
            <p className={styles.sharedNote}>Shared sample note<strong data-testid="shared-note">{sampleCase.sharedNote}</strong></p>
            <Link className={styles.customerLink} href={`/cases/${encodeURIComponent(sampleCase.id)}`}>Open customer case</Link>
            <SimulationBadge>staff role and customer identity</SimulationBadge>
          </section>
        </aside>
        <div className={styles.documents}>
          <section id="staff-overview" className={styles.panel + " " + styles.overview} aria-labelledby="staff-overview-title">
            <h2 id="staff-overview-title">Case overview</h2>
            <div className={styles.overviewGrid}><div><h3>Reported symptoms</h3><p>{sampleCase.request.symptoms}</p></div><div><h3>{sampleCase.request.confirmedAppointment ? "Confirmed appointment" : "Requested appointment"}</h3><p>{sampleCase.request.preferredDate} at {sampleCase.request.preferredTime}</p><p>{sampleCase.request.serviceMode === "office-dropoff" ? "Office drop-off" : sampleCase.request.visitAddress}</p><small>{sampleCase.request.confirmedAppointment ? "Confirmed in the sample workflow" : "Pending staff confirmation"}</small></div></div>
          </section>
          <section className={styles.panel + " " + styles.activity} aria-labelledby="staff-activity-title">
            <h2 id="staff-activity-title">Case activity</h2>
            <ol className={styles.timeline}>{activity.map((item, index) => <li key={`${item.at}-${index}`}><div className={styles.timelinePoint} aria-hidden="true" /><div><strong>{item.title}</strong><time dateTime={item.at}>{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(item.at))}</time></div><p>{item.detail}</p></li>)}{!sampleCase.request.confirmedAppointment ? <li><div className={styles.pendingPoint} aria-hidden="true" /><div><strong>Appointment confirmation pending</strong></div><p>Staff must review and confirm the requested appointment.</p></li> : null}</ol>
          </section>
          <section id="staff-updates" className={styles.panel + " " + styles.updates} aria-labelledby="daily-summary-title"><div className="section-heading"><h2 id="daily-summary-title">Simulated daily summary</h2><SimulationBadge>SMS log</SimulationBadge></div><p className="helper-text">A summary is informational only; it never grants consent, approval, payment, custody, or repair authority.</p>{sampleCase.smsLog.length > 0 ? <ol className="history-list">{sampleCase.smsLog.map((sms) => <li key={sms.id}><strong>{sms.summaryDate ?? "Historical update"}</strong><span>{sms.situation}</span><span>Next: {sms.nextAction} · {sms.expectedTiming}</span></li>)}</ol> : null}<label htmlFor="summary-date">Summary date</label><input id="summary-date" aria-label="Summary date" value={summaryDate} onChange={(event) => setSummaryDate(event.target.value)} /><label htmlFor="summary-situation">Summary situation</label><textarea id="summary-situation" aria-label="Summary situation" value={summarySituation} onChange={(event) => setSummarySituation(event.target.value)} /><label htmlFor="summary-next">Summary next action</label><input id="summary-next" aria-label="Summary next action" value={summaryNextAction} onChange={(event) => setSummaryNextAction(event.target.value)} /><label htmlFor="summary-timing">Summary timing</label><input id="summary-timing" aria-label="Summary timing" value={summaryTiming} onChange={(event) => setSummaryTiming(event.target.value)} /><label className="checkbox-row"><input type="checkbox" checked={summaryNonWorking} onChange={(event) => setSummaryNonWorking(event.target.checked)} /> Non-working day while vehicle is held</label><button className="button button-secondary" type="button" onClick={() => run(() => actions.addDailySummary(sampleCase.id, { situation: summarySituation, nextAction: summaryNextAction, expectedTiming: summaryTiming, summaryDate, nonWorkingDay: summaryNonWorking }))}>Add simulated summary</button></section>

          <section id="staff-records" className={styles.panel + " " + styles.records} aria-labelledby="staff-records-title">
            <h2 id="staff-records-title">Supporting records</h2>
            <h3>Estimate versions</h3>
            {sampleCase.estimates.length ? sampleCase.estimates.map((estimate) => <div className={styles.record} key={estimate.id}><h4>Estimate v{estimate.version} · {formatMoney(estimate.totalCents, estimate.currency)} USD</h4><p>{estimate.expectedTiming}</p><ul>{estimate.lines.map((line) => <li key={line.id}>{line.description} · {formatMoney(line.totalCents, line.currency)} USD{line.part ? ` · ${line.part.brand}, ${line.part.condition}, ${line.part.warranty}` : ""}</li>)}</ul>{sampleCase.estimateDecisions.filter((decision) => decision.estimateVersionId === estimate.id).map((decision) => <p key={decision.id}>Decision: {decision.outcome} by {decision.authorizer}</p>)}</div>) : <p>No estimate has been published yet.</p>}
            <h3>Simulated payments</h3>
            {sampleCase.payments.length || sampleCase.finalPayments.length ? <ul>{sampleCase.payments.map((payment) => <li key={payment.id}>{payment.label} · {formatMoney(payment.amountCents, payment.currency)} USD · {payment.outcome.replace("simulated-", "Simulated ")}</li>)}{sampleCase.finalPayments.map((payment) => <li key={payment.id}>Final payment · {formatMoney(payment.amountCents, payment.currency)} USD · {payment.outcome.replace("simulated-", "Simulated ")}</li>)}</ul> : <p>No simulated payment attempts yet.</p>}
            {sampleCase.transport.handover ? <div className={styles.record}><h3>Custody handover</h3><p>{sampleCase.transport.handover.receiverName} · {sampleCase.transport.handover.destination}</p><p>{sampleCase.transport.handover.condition} · {sampleCase.transport.handover.mileage} km · {sampleCase.transport.handover.keys}</p></div> : null}
            {sampleCase.invoices.map((invoice) => <p key={invoice.id}><strong>Illustrative invoice:</strong> {invoice.summary} · {formatMoney(invoice.totalCents, invoice.currency)} USD</p>)}
            {sampleCase.warranties.map((warranty) => <p key={warranty.id}><strong>Illustrative warranty:</strong> {warranty.terms}</p>)}
            {sampleCase.returns.map((record) => <p key={record.id}><strong>Returned to {record.recipientName}:</strong> {record.condition} · {record.mileage} km · {record.keys}. Warranty and complaint rights remain open.</p>)}
          </section>
        </div>
      </div>
    </div>
  );
}
