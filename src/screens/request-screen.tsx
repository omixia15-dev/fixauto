"use client";

import { useState, type FormEvent } from "react";
import { CaseSummary } from "../components/case-summary";
import { SimulationBadge } from "../components/simulation-badge";
import { useDemoCases } from "../store/demo-case-provider";

export function RequestScreen() {
  const { data, ready, saveSharedNote } = useDemoCases();
  const sampleCase = data.cases[0];

  return (
    <RequestScreenContent
      key={sampleCase.sharedNote}
      ready={ready}
      sampleCase={sampleCase}
      saveSharedNote={saveSharedNote}
    />
  );
}

function RequestScreenContent({
  ready,
  sampleCase,
  saveSharedNote,
}: {
  ready: boolean;
  sampleCase: ReturnType<typeof useDemoCases>["data"]["cases"][number];
  saveSharedNote: ReturnType<typeof useDemoCases>["saveSharedNote"];
}) {
  const [note, setNote] = useState(sampleCase.sharedNote);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      saveSharedNote(sampleCase.id, note);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The sample note could not be saved.");
    }
  }

  return (
    <div className="page-stack" aria-busy={!ready}>
      <section className="hero">
        <div>
          <SimulationBadge>service request</SimulationBadge>
          <p className="eyebrow">Managed car repair</p>
          <h1>Let us manage your car repair</h1>
          <p className="lede">
            Follow one sample case through assessment, approval, repair, and return.
          </p>
        </div>
        <ol className="journey" aria-label="Service journey">
          <li>Assessment</li>
          <li>Approval</li>
          <li>Repair</li>
          <li>Return</li>
        </ol>
      </section>

      <div className="content-grid">
        <section className="card" aria-labelledby="request-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Sample request shell</p>
              <h2 id="request-heading">Request an expert visit</h2>
            </div>
            <span className="status-pill">Pending staff confirmation</span>
          </div>
          <dl className="request-preview">
            <div><dt>Contact</dt><dd>{sampleCase.customer.name} · {sampleCase.customer.mobile}</dd></div>
            <div><dt>Vehicle</dt><dd>{sampleCase.vehicle.make} {sampleCase.vehicle.model} · {sampleCase.vehicle.year}</dd></div>
            <div><dt>Symptoms</dt><dd>{sampleCase.request.symptoms}</dd></div>
            <div><dt>Visit address</dt><dd>{sampleCase.request.visitAddress}</dd></div>
          </dl>
          <p className="helper-text">
            Request validation and submission arrive in D2. This saved sample proves the shared foundation only.
          </p>
        </section>

        <form className="card note-editor" onSubmit={handleSubmit}>
          <p className="eyebrow">Foundation demonstration</p>
          <h2>Update the shared sample note</h2>
          <p className="helper-text">
            Save a harmless note here, then open the customer and staff screens to see the same record.
          </p>
          <label htmlFor="shared-note-input">Sample coordination note</label>
          <textarea
            id="shared-note-input"
            name="sharedNote"
            value={note}
            maxLength={160}
            onChange={(event) => setNote(event.target.value)}
            aria-describedby={error ? "note-error" : "note-help"}
          />
          <span id="note-help" className="field-hint">1–160 characters · sample data only</span>
          {error ? <p id="note-error" className="field-error">{error}</p> : null}
          <button className="button" type="submit">Save sample note</button>
        </form>
      </div>

      <CaseSummary sampleCase={sampleCase} />
    </div>
  );
}
