"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ResetSampleButton } from "../components/reset-sample-button";
import { getCasePhase, type SampleCase } from "../domain/sample-case";
import { getCasePresentation } from "../presentation/case-status";
import { useDemoCases } from "../store/demo-case-provider";
import styles from "../../app/case/case.module.css";

const overviewLabels: Partial<Record<ReturnType<typeof getCasePhase>, string>> = {
  "pending-staff-confirmation": "Request received",
  "assessment-authorization-required": "Appointment confirmed",
  "estimate-approval-required": "Approval needed",
  "repair-ready": "Repair approved",
  completed: "Completed",
};
function statusInfo(sampleCase: SampleCase) {
  const phase = getCasePhase(sampleCase);
  const tone = phase === "assessment-authorization-required" ? "confirmed" : phase === "completed" ? "complete"
    : phase.includes("approval") || phase.includes("authorization") || phase.includes("payment") ? "attention"
    : phase === "repair-ready" ? "repair" : "current";
  return { label: overviewLabels[phase] ?? getCasePresentation(sampleCase).status, tone };
}
function activity(sampleCase: SampleCase) {
  const confirmation = sampleCase.request.confirmedAppointment;
  return [
    { title: "Request received", at: sampleCase.request.createdAt, detail: "Your sample request was saved in this browser." },
    { title: "Symptoms recorded", at: sampleCase.request.createdAt, detail: sampleCase.request.symptoms },
    ...(confirmation ? [{ title: "Appointment confirmed", at: confirmation.confirmedAt, detail: `${confirmation.date} at ${confirmation.time} · ${confirmation.coordinator}` }] : []),
    ...(sampleCase.assessment.performedAt ? [{ title: "Assessment recorded", at: sampleCase.assessment.performedAt, detail: sampleCase.assessment.findings ?? "" }] : []),
    ...sampleCase.estimates.map(item => ({ title: `Estimate version ${item.version} published`, at: item.publishedAt, detail: "Itemized work requires your approval." })),
    ...sampleCase.estimateDecisions.map(item => ({ title: `Estimate ${item.outcome}`, at: item.decidedAt, detail: `Recorded by ${item.authorizer}.` })),
    ...sampleCase.performedWork.map(item => ({ title: "Repair work recorded", at: item.performedAt, detail: item.summary })),
    ...sampleCase.qualityChecks.map(item => ({ title: `Quality check ${item.result}`, at: item.checkedAt, detail: item.findings })),
    ...sampleCase.returns.map(item => ({ title: "Vehicle returned", at: item.returnedAt, detail: `Received by ${item.recipientName}.` })),
  ].sort((a, b) => a.at.localeCompare(b.at));
}
function dateLabel(at: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(at));
}
export function CasesScreen({ initialCaseId }: { initialCaseId?: string }) {
  const { data, ready, storageError, retryStorage, notice } = useDemoCases();
  const [selectedId, setSelectedId] = useState(initialCaseId);
  const [query, setQuery] = useState("");
  const [dismissedNotice, setDismissedNotice] = useState("");
  const cases = data.cases.filter(item => `${item.reference} ${item.vehicle.make} ${item.vehicle.model}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = cases.find(item => item.id === selectedId) ?? cases[0];
  const showNotice = notice && notice !== dismissedNotice;
  return <div className={styles.content}>
    <div className={styles.heading}><div><h1>Your repair cases</h1><p>View the status of your repair requests and next steps.</p></div><Link className={styles.primaryButton} href="/case/new"><span aria-hidden="true">+</span> New repair request</Link></div>
    <div className={styles.tools}><label className={styles.search}>Find a case<input type="search" placeholder="Case reference or vehicle" value={query} onChange={event => setQuery(event.target.value)} disabled={!ready || Boolean(storageError)} /></label><ResetSampleButton /></div>
    {storageError ? <section className={styles.error} role="alert"><h2>We could not open your saved cases</h2><p>{storageError}</p><button className={styles.primaryButton} type="button" onClick={retryStorage}>Try again</button></section>
    : !ready ? <section className={styles.loading} aria-busy="true" aria-label="Loading saved repair cases"><p role="status">Loading your saved cases…</p><div className={styles.loadingGrid}><div>{[1,2,3,4,5].map(item => <div className={styles.skeletonRow} key={item} />)}</div><div className={styles.skeletonDetail} /></div></section>
    : !selected ? <section className={styles.empty}><h2>{query ? "No cases match your search" : "Your first repair starts here"}</h2><p>{query ? "Try a vehicle name or case reference." : "Send a sample request and follow its next steps here."}</p>{query ? <button className={styles.primaryButton} type="button" onClick={() => setQuery("")}>Show all cases</button> : <Link className={styles.primaryButton} href="/case/new">New repair request</Link>}</section>
    : <div className={styles.split}>
      <aside className={styles.caseList} aria-label="Repair cases"><ul>{cases.map(item => { const status = statusInfo(item); return <li key={item.id}><button type="button" className={`${styles.caseRow} ${item.id === selected.id ? styles.selected : ""}`} aria-pressed={item.id === selected.id} onClick={() => setSelectedId(item.id)}><span className={styles.rowIdentity}><strong>{item.reference}</strong><span>{item.vehicle.make} {item.vehicle.model}</span></span><span className={styles.status} data-tone={status.tone}>{status.label}</span><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 5 7 7-7 7" /></svg></button></li>; })}</ul></aside>
      <section className={styles.detail} aria-labelledby="selected-case-title">
        <div className={styles.detailTop}><div><span className={styles.label}>Case reference</span><h2 id="selected-case-title">{selected.reference}</h2><h3>{selected.vehicle.make} {selected.vehicle.model}</h3><p>{selected.vehicle.year} · Sample vehicle</p></div>
          <figure className={styles.vehicle}><Image src="/images/case-sample-sedan.png" alt="Illustrative silver sedan" width={400} height={250} sizes="(max-width: 700px) 180px, 240px" /><figcaption>Illustrative vehicle</figcaption></figure>
          <div className={styles.currentStatus}><span className={styles.label}>Current status</span><span className={styles.status} data-tone={statusInfo(selected).tone}>{statusInfo(selected).label}</span><p>Submitted {dateLabel(selected.request.createdAt)}</p></div>
        </div>
        {showNotice ? <div className={styles.success} role="status"><div><strong>{notice}</strong><p>Your demo changes are saved in this browser.</p></div><button type="button" aria-label="Dismiss confirmation" onClick={() => setDismissedNotice(notice)}>×</button></div> : null}
        <div className={styles.summary}><div><h3>Symptoms</h3><p>{selected.request.symptoms}</p></div><div className={styles.nextStep}><h3>Next step</h3><p>{getCasePresentation(selected).nextAction}</p><span>{selected.request.confirmedAppointment ? getCasePresentation(selected).timing : "Appointment pending confirmation"}</span></div></div>
        <div className={styles.timeline}><h3>Activity timeline</h3><ol>{activity(selected).map((item, index) => <li key={`${item.title}-${index}`}><span className={styles.timelineDot} aria-hidden="true"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 8 3 3 7-7" /></svg></span><div><strong>{item.title}</strong><time dateTime={item.at}>{dateLabel(item.at)}</time></div><p>{item.detail}</p></li>)}{!selected.request.confirmedAppointment ? <li><span className={styles.pendingDot} aria-hidden="true" /><strong>Appointment confirmation pending</strong><p>Fixauto staff reviews your requested appointment.</p></li> : null}</ol></div>
        <div className={styles.detailActions}><Link className={styles.secondaryButton} href={`/cases/${selected.id}`}>Open full case & approvals <span aria-hidden="true">→</span></Link><Link className={styles.textLink} href={`/staff?caseId=${encodeURIComponent(selected.id)}`}>Update in staff demo <span aria-hidden="true">↗</span></Link></div>
      </section>
    </div>}
  </div>;
}
