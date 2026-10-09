"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AppNavigation } from "@/src/components/app-navigation";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "./page.module.css";
const alexandria = localFont({src:[{path:"./fonts/alexandria-light.ttf",weight:"300"},{path:"./fonts/alexandria-semibold.ttf",weight:"600"},{path:"./fonts/alexandria-regular.ttf",weight:"400"},{path:"./fonts/alexandria-bold.ttf",weight:"700"}],display:"swap"});
const milestones = ["Assessment", "Estimate awaiting approval", "Vehicle return"];
const labels = ["Explain the issue","Vehicle inspection","Estimate provided","Awaiting approval","Repairs carried out","Vehicle returned"];
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
      <div className={styles.heroArt}><Image src="/images/session-13-hero-art.png" alt="Silver car outside a specialist repair workshop" width={1536} height={1024} preload sizes="(max-width: 900px) 150vw, 52vw" /></div>
      <div className={styles.nav}><Link href="/" className={styles.wordmark}>Fixauto</Link><AppNavigation /></div>
      <div className={styles.heroCopy}><h1><span>Car repairs in Kerman.</span><span>One coordinator,<br/>start to finish.</span></h1><p>Fixauto is being built to coordinate assessment, specialist repairs,<br className={styles.desktopBreak}/> and vehicle return, with your approval before repair work or extra spending.</p><a className={styles.primaryButton} href="#coming-soon">Get launch updates <span aria-hidden="true">→</span></a></div>
    </header>
    <section className={styles.journey} aria-labelledby="journey-title">
      <div className={styles.journeyHeading}><h2 id="journey-title">Planned service journey</h2><span>Demo</span></div>
      <ol className={styles.milestones}>{milestones.map((title,i)=><li key={title}><span className={styles.marker}>{i+1}</span><h3>{title}</h3></li>)}</ol>
      <div className={styles.journeyArt}><Image src="/images/session-13-journey-art.png" alt="Illustrated repair journey from inspection through an approval pause to repairs and vehicle return" width={2172} height={724} preload sizes="94vw" /></div>
      <ol className={styles.routeLabels}>{labels.map(l=><li key={l}>{l}</li>)}</ol>
    </section>
    <div className={styles.intro}>
      <section id="problem" className={styles.problem}><h2>Finding a specialist is only part of the job.</h2><p>You still have to explain the problem, review costs, arrange handovers, and follow up.</p><p className={styles.problemClose}>Fixauto brings those steps together through one contact.</p></section>
      <section id="how-it-works" className={styles.how} aria-labelledby="how-title"><h2 id="how-title">How it works</h2>
      <ol className={styles.stepDetails} aria-label="How the planned service works">
        <li><h3>Tell us what needs attention.</h3><p>Share your vehicle and symptoms. Your request still needs confirmation.</p></li>
        <li><h3>Start with an assessment.</h3><p>The assessment fee is disclosed before the visit. Transport and further investigation need separate approval.</p></li>
        <li><h3>Approve the work; follow the case.</h3><p>Review an itemized estimate. Fixauto coordinates approved repairs, a quality check, and return. Changed work or costs need fresh approval.</p></li>
      </ol>
      </section>
    </div>
    <section className={styles.previews} aria-labelledby="previews-title">
      <div className={styles.sectionHeading}><h2 id="previews-title">Three views. One coordinated case.</h2><p>Demo · simulated sign-in, payments, and SMS. No live bookings or operations.</p><Link className={styles.primaryButton} href="/case">Try the repair demo <span aria-hidden="true">→</span></Link></div>
      <div className={styles.previewGrid}>
        <article><h3>Service request</h3><p className={styles.previewRole}>Demo / Request</p><dl><div><dt>Vehicle</dt><dd>Sample car</dd></div><div><dt>What needs attention?</dt><dd>Vibration under braking</dd></div><div><dt>Next step</dt><dd>Request an assessment</dd></div></dl><p className={styles.previewNote}>Sample only · not submitted</p></article>
        <article><h3>Review before repair.</h3><p className={styles.previewRole}>Demo / Customer case</p><p className={styles.approvalState}>Estimate awaiting approval</p><dl><div><dt>Estimate</dt><dd>Itemized work and costs</dd></div><div><dt>Owner&apos;s decision</dt><dd>Approval required</dd></div><div><dt>Changed scope or costs</dt><dd>Fresh approval required</dd></div></dl></article>
        <article><h3>Keep the case moving.</h3><p className={styles.previewRole}>Demo / Staff workspace</p><ol className={styles.staffList}><li>Assignment and handovers</li><li>Approved repair progress</li><li>Quality check and return</li><li>Case history and follow-up</li></ol><p className={styles.previewNote}>Illustrative workflow · not operational</p></article>
      </div>
    </section>
    <section id="benefits" className={styles.benefits} aria-labelledby="benefits-title"><h2 id="benefits-title">More clarity. Less coordination.</h2><div className={styles.benefitGrid}><article><h3>One contact</h3><p>Know who coordinates your case.</p></article><article><h3>Approval before spending</h3><p>Review work and costs before proceeding.</p></article><article><h3>Less coordination</h3><p>Delegate follow-ups, handovers, and return.</p></article></div></section>
    <section id="coming-soon" className={styles.comingSoon} aria-labelledby="coming-title"><div><h2 id="coming-title">Coming soon in Kerman.</h2><p>Try the launch-updates form below.</p></div>{submitted ? <div className={styles.formSuccess} role="status"><strong>Thanks for trying the preview.</strong><p>Your details were not saved or sent. This demo cannot add you to a real launch list.</p></div> : <form onSubmit={handleSubmit} className={styles.form}><label htmlFor="coming-soon-contact">Email or mobile number</label><div className={styles.formRow}><input id="coming-soon-contact" name="contact" type="text" value={contact} onChange={e=>setContact(e.target.value)} placeholder="Email or mobile number" autoComplete="on" required pattern={String.raw`.*\S.*`} title="Enter an email address or mobile number" aria-describedby="form-note"/><button className={styles.primaryButton} type="submit">Get launch updates <span aria-hidden="true">→</span></button></div><p id="form-note">Demo only: your details are not saved or sent.</p></form>}</section>
    <footer className={styles.footer}><Link className={styles.wordmark} href="/">Fixauto</Link><span>Managed repair coordination</span><span>Coming soon in Kerman.</span></footer>
  </div>;
}
