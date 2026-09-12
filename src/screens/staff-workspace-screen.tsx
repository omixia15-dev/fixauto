"use client";

import { useState, type FormEvent } from "react";
import { CaseSummary } from "../components/case-summary";
import { SimulationBadge } from "../components/simulation-badge";
import { findCase, getCasePhase } from "../domain/sample-case";
import { getCasePresentation } from "../presentation/case-status";
import { useDemoCases } from "../store/demo-case-provider";

export function StaffWorkspaceScreen() {
  const actions = useDemoCases();
  const [selectedId, setSelectedId] = useState(() => actions.data.cases.at(-1)?.id ?? "case-atlas-001");
  const [expertName, setExpertName] = useState("Arman Karimi");
  const [findings, setFindings] = useState("Initial expert visit indicates that workshop investigation is needed.");
  const [needsInvestigation, setNeedsInvestigation] = useState(true);
  const [actionError, setActionError] = useState("");
  const sampleCase = findCase(actions.data, selectedId) ?? actions.data.cases.at(-1)!;
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
        <div className="capacity-card"><span>Active car capacity</span><strong>0 / 1</strong><small>Custody capacity begins in D3.</small></div>
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

            {sampleCase.assessment.performedAt ? (
              <div className="nested-panel">
                <strong>Assessment recorded by {sampleCase.assessment.expertName}</strong>
                <p>{sampleCase.assessment.findings}</p>
                <p>Assessment fee: earned under the authorized scope.</p>
                {sampleCase.assessment.needsInvestigation ? <p>Deeper investigation is separate; customer authorization/payment status: {phase.replaceAll("-", " ")}.</p> : null}
              </div>
            ) : null}

            <div className="placeholder-grid" aria-label="Future workflow sections">
              <span>Transport · D3</span><span>Estimate · D4</span><span>Quality and return · D5</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
