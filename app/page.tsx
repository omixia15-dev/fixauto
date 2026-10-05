"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "./page.module.css";
const alexandria = localFont({src:[{path:"./fonts/alexandria-light.ttf",weight:"300"},{path:"./fonts/alexandria-semibold.ttf",weight:"600"},{path:"./fonts/alexandria-regular.ttf",weight:"400"},{path:"./fonts/alexandria-bold.ttf",weight:"700"}],display:"swap"});
const milestones = [
  {title:"Assessment",body:"We understand the problem and check the vehicle."},
  {title:"Estimate awaiting approval",body:"You receive a clear estimate and approve before we proceed."},
  {title:"Vehicle return",body:"Repairs are completed and your vehicle is returned to you."},
];
const labels = ["Explain the issue","Vehicle inspection","Estimate provided","Awaiting approval","Repairs carried out","Vehicle returned"];
const steps = ["Tell us what needs attention.","Start with an assessment.","Approve the work; follow the case."];
function StepIcon({index}:{index:number}) {
  return <svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{index===1 ? <><path d="m12 30 6-16h28l6 16v21H12Z"/><path d="M12 30h40M17 38h7m16 0h7M17 51v5m30-5v5"/></> : <><path d="M16 8h28l5 6v40H16Z"/><path d="M24 20h16M24 28h16M24 36h11"/>{index===0 ? <path d="m32 46 13-13 5 5-13 13-7 2Z"/> : <><circle cx="45" cy="45" r="12" fill="#e7eeee"/><path d="m39 45 4 4 7-8"/></>}</>}</svg>;
}
export default function HomePage() {
  const [contact,setContact] = useState("");
  const [submitted,setSubmitted] = useState(false);
  function handleSubmit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contact.trim()) return;
    setSubmitted(true);
  }
  return <div className={`${styles.marketingPage} ${alexandria.className}`}>
    <header className={styles.hero}>
      <div className={styles.heroArt}><Image src="/images/session-13-hero-art.png" alt="Silver car outside a specialist repair workshop" width={1536} height={1024} preload sizes="(max-width: 900px) 150vw, 50vw" /></div>
      <nav className={styles.nav} aria-label="Main navigation"><Link href="/" className={styles.wordmark}>Fixauto</Link><a href="#coming-soon">Coming soon <span aria-hidden="true">→</span></a></nav>
      <div className={styles.heroCopy}><h1><span>Car repairs in Kerman.</span><span>One coordinator, start to finish.</span></h1><p>Fixauto is being built to coordinate assessment, specialist repairs,<br className={styles.desktopBreak}/> and vehicle return, with your approval before repair work or extra spending.</p><a className={styles.primaryButton} href="#coming-soon">Get launch updates <span aria-hidden="true">→</span></a></div>
    </header>
    <section className={styles.journey} aria-labelledby="journey-title">
      <p className={styles.kicker}>Demo</p><h2 id="journey-title">Planned service journey</h2>
      <ol className={styles.milestones}>{milestones.map((m,i)=><li key={m.title}><span className={styles.marker}>{i+1}</span><div><h3>{m.title}</h3><p>{m.body}</p></div></li>)}</ol>
      <div className={styles.journeyArt}><Image src="/images/session-13-journey-art.png" alt="Illustrated repair journey from inspection through an approval pause to repairs and vehicle return" width={2172} height={724} preload sizes="94vw" /></div>
      <ol className={styles.routeLabels}>{labels.map(l=><li key={l}>{l}</li>)}</ol>
    </section>
    <div className={styles.intro}>
      <section id="problem" className={styles.problem}><p className={styles.kicker}>Problem</p><h2>Finding a specialist is only part of the job.</h2><p>You still have to explain the problem, review costs, arrange handovers, and follow up.</p><p className={styles.problemClose}>Fixauto brings those steps together through one contact.</p></section>
      <section id="how-it-works" className={styles.how}><h2 className={styles.kicker}>How it works</h2><ol className={styles.steps}>{steps.map((s,i)=><li key={s}><div className={styles.icon}><StepIcon index={i}/></div><div><span className={styles.smallMarker}>{i+1}</span><h3>{s}</h3></div></li>)}</ol></section>
    </div>
    <div className={styles.details}>
      <ol className={styles.stepDetails} aria-label="How the planned service works">
        <li><h3>Tell us what needs attention.</h3><p>Share your vehicle and symptoms. Your request still needs confirmation.</p></li>
        <li><h3>Start with an assessment.</h3><p>The assessment fee is disclosed before the visit. Transport and further investigation need separate approval.</p></li>
        <li><h3>Approve the work; follow the case.</h3><p>Review an itemized estimate. Fixauto coordinates approved repairs, a quality check, and return. Changed work or costs need fresh approval.</p></li>
      </ol>
    </div>
    <section className={styles.previews} aria-labelledby="previews-title">
      <div className={styles.sectionHeading}><h2 id="previews-title">Three views. One coordinated case.</h2><p>Demo · simulated sign-in, payments, and SMS. No live bookings or operations.</p></div>
      <div className={styles.previewGrid}>
        <article><p className={styles.kicker}>Demo / Request</p><h3>Service request</h3><dl><div><dt>Vehicle</dt><dd>Sample car</dd></div><div><dt>What needs attention?</dt><dd>Vibration under braking</dd></div><div><dt>Next step</dt><dd>Request an assessment</dd></div></dl><p className={styles.previewNote}>Sample only · not submitted</p></article>
        <article><p className={styles.kicker}>Demo / Customer case</p><h3>Review before repair.</h3><p className={styles.approvalState}>Estimate awaiting approval</p><dl><div><dt>Estimate</dt><dd>Itemized work and costs</dd></div><div><dt>Owner&apos;s decision</dt><dd>Approval required</dd></div><div><dt>Changed scope or costs</dt><dd>Fresh approval required</dd></div></dl></article>
        <article><p className={styles.kicker}>Demo / Staff workspace</p><h3>Keep the case moving.</h3><ol className={styles.staffList}><li>Assignment and handovers</li><li>Approved repair progress</li><li>Quality check and return</li><li>Case history and follow-up</li></ol><p className={styles.previewNote}>Illustrative workflow · not operational</p></article>
      </div>
    </section>
    <section id="benefits" className={styles.benefits} aria-labelledby="benefits-title"><h2 id="benefits-title">More clarity. Less coordination.</h2><div className={styles.benefitGrid}><article><h3>One contact</h3><p>Know who coordinates your case.</p></article><article><h3>Approval before spending</h3><p>Review work and costs before proceeding.</p></article><article><h3>Less coordination</h3><p>Delegate follow-ups, handovers, and return.</p></article></div></section>
    <section id="coming-soon" className={styles.comingSoon} aria-labelledby="coming-title"><div><h2 id="coming-title">Coming soon in Kerman.</h2><p>Try the launch-updates form below.</p></div>{submitted ? <div className={styles.formSuccess} role="status"><strong>Thanks for trying the preview.</strong><p>Your details were not saved or sent. This demo cannot add you to a real launch list.</p></div> : <form onSubmit={handleSubmit} className={styles.form}><label htmlFor="coming-soon-contact">Email or mobile number</label><div className={styles.formRow}><input id="coming-soon-contact" name="contact" type="text" value={contact} onChange={e=>setContact(e.target.value)} placeholder="Email or mobile number" autoComplete="on" required pattern={String.raw`.*\S.*`} title="Enter an email address or mobile number" aria-describedby="form-note"/><button className={styles.primaryButton} type="submit">Get launch updates <span aria-hidden="true">→</span></button></div><p id="form-note">Demo only: your details are not saved or sent.</p></form>}</section>
    <footer className={styles.footer}><Link className={styles.wordmark} href="/">Fixauto</Link><span>Managed repair coordination</span><span>Coming soon in Kerman.</span></footer>
  </div>;
}