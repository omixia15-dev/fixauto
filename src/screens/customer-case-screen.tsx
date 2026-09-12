"use client";

import Link from "next/link";
import { CaseSummary } from "../components/case-summary";
import { SimulationBadge } from "../components/simulation-badge";
import { formatMoney } from "../domain/currency";
import { findCase } from "../domain/sample-case";
import { useDemoCases } from "../store/demo-case-provider";

export function CustomerCaseScreen({ caseId }: { caseId: string }) {
  const { data, ready } = useDemoCases();
  const sampleCase = findCase(data, caseId);

  if (!ready) return <p className="loading-state">Loading saved sample case…</p>;
  if (!sampleCase) {
    return (
      <section className="empty-state">
        <h1>Sample case not found</h1>
        <p>This browser does not contain that fictional case.</p>
        <Link className="button" href="/">Return to service request</Link>
      </section>
    );
  }

  const payment = sampleCase.payments[0];
  const sms = sampleCase.smsLog[0];

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <SimulationBadge>customer role</SimulationBadge>
          <p className="eyebrow">Customer case</p>
          <h1>Your repair journey</h1>
          <p className="lede">One place for the current situation, next action, and saved records.</p>
        </div>
      </section>
      <CaseSummary sampleCase={sampleCase} />
      <div className="content-grid">
        <section className="card" aria-labelledby="next-action-title">
          <p className="eyebrow">Action needed</p>
          <h2 id="next-action-title">{sampleCase.nextAction}</h2>
          <p>{sampleCase.expectedTiming}</p>
          <p className="helper-text">Approval controls arrive in D2–D4.</p>
        </section>
        <section className="card" aria-labelledby="payment-title">
          <div className="section-heading">
            <h2 id="payment-title">Payment history</h2>
            <SimulationBadge>payment</SimulationBadge>
          </div>
          <p>{payment.purpose}</p>
          <strong>{formatMoney(payment.amountCents, payment.currency)} USD</strong>
          <p className="status-line">Outcome: {payment.outcome.replace("simulated-", "simulated ")}</p>
        </section>
        <section className="card" aria-labelledby="updates-title">
          <div className="section-heading">
            <h2 id="updates-title">Updates</h2>
            <SimulationBadge>SMS log</SimulationBadge>
          </div>
          <p>{sms.situation}</p>
          <p><strong>Next:</strong> {sms.nextAction}</p>
          <p><strong>Timing:</strong> {sms.expectedTiming}</p>
        </section>
        <section className="card muted-card" aria-labelledby="documents-title">
          <h2 id="documents-title">Invoice, warranty, and return</h2>
          <p>These sample records will appear as the later workflow slices are implemented.</p>
        </section>
      </div>
    </div>
  );
}

