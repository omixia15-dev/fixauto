import { formatMoney } from "../domain/currency";
import type { SampleCase } from "../domain/sample-case";
import { getCasePresentation } from "../presentation/case-status";
import { SimulationBadge } from "./simulation-badge";

export function CaseSummary({ sampleCase }: { sampleCase: SampleCase }) {
  const presentation = getCasePresentation(sampleCase);

  return (
    <section className="card" aria-labelledby="case-summary-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Case reference</p>
          <h2 id="case-summary-title">{sampleCase.reference}</h2>
        </div>
        <span className="status-pill">{presentation.status}</span>
      </div>
      <dl className="detail-grid">
        <div>
          <dt>Customer</dt>
          <dd>{sampleCase.customer.name}</dd>
        </div>
        <div>
          <dt>Vehicle</dt>
          <dd>
            {sampleCase.vehicle.year} {sampleCase.vehicle.make} {sampleCase.vehicle.model}
          </dd>
        </div>
        <div>
          <dt>Illustrative assessment fee</dt>
          <dd>{formatMoney(sampleCase.assessment.feeCents, sampleCase.assessment.currency)} USD</dd>
        </div>
        <div>
          <dt>Preferred appointment</dt>
          <dd>
            {sampleCase.request.preferredDate} at {sampleCase.request.preferredTime}
            {sampleCase.request.confirmedAppointment ? " · confirmed" : " · pending confirmation"}
          </dd>
        </div>
      </dl>
      <div className="note-panel">
        <span>Shared sample note</span>
        <strong data-testid="shared-note">{sampleCase.sharedNote}</strong>
      </div>
      <SimulationBadge>customer identity</SimulationBadge>
    </section>
  );
}
