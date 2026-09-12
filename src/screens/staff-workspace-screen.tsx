"use client";

import { CaseSummary } from "../components/case-summary";
import { SimulationBadge } from "../components/simulation-badge";
import { useDemoCases } from "../store/demo-case-provider";

export function StaffWorkspaceScreen() {
  const { data, ready } = useDemoCases();
  const sampleCase = data.cases[0];

  return (
    <div className="page-stack" aria-busy={!ready}>
      <section className="page-intro">
        <div>
          <SimulationBadge>staff role</SimulationBadge>
          <p className="eyebrow">Staff workspace</p>
          <h1>One case, one accountable view</h1>
          <p className="lede">Manage the same fictional record the sample customer sees.</p>
        </div>
        <div className="capacity-card">
          <span>Active case capacity</span>
          <strong>0 / 1</strong>
          <small>Capacity workflow arrives in D3.</small>
        </div>
      </section>
      <div className="workspace-grid">
        <aside className="card case-list" aria-labelledby="case-list-title">
          <h2 id="case-list-title">Cases</h2>
          <button className="case-list-item" type="button" aria-current="true">
            <span>{sampleCase.reference}</span>
            <strong>{sampleCase.customer.name}</strong>
            <small>Pending request</small>
          </button>
        </aside>
        <div className="page-stack">
          <CaseSummary sampleCase={sampleCase} />
          <section className="card" aria-labelledby="staff-next-title">
            <p className="eyebrow">Next required action</p>
            <h2 id="staff-next-title">{sampleCase.nextAction}</h2>
            <p>{sampleCase.expectedTiming}</p>
            <div className="placeholder-grid" aria-label="Future workflow sections">
              <span>Assessment · D2</span>
              <span>Transport · D3</span>
              <span>Estimate · D4</span>
              <span>Quality and return · D5</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
