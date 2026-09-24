"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import styles from "./page.module.css";

const steps = [
  {
    title: "Request help",
    body: "Share your contact details, vehicle information, symptoms, and preferred appointment. No account is required to begin.",
  },
  {
    title: "Approve the next step",
    body: "An expert assesses the vehicle and helps determine the right destination. Assessment, transport, investigation, and repair are approved separately.",
  },
  {
    title: "Let Fixauto coordinate",
    body: "Fixauto coordinates the approved work, parts, updates, quality check, final records, and return. Changed work requires fresh approval.",
  },
];

export default function HomePage() {
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contact.trim()) return;
    setSubmitted(true);
  }

  return (
    <div className={styles.marketingPage}>
      <nav className={styles.marketingNav} aria-label="Main navigation">
        <Link className={styles.wordmark} href="/" aria-label="Fixauto home">
          fixauto<span>.</span>
        </Link>
        <div className={styles.navLinks}>
          <a href="#problem">The problem</a>
          <a href="#how-it-works">How it works</a>
          <a href="#benefits">Benefits</a>
        </div>
        <a className={styles.navCta} href="#coming-soon">
          Coming soon
        </a>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.heroMeta}>Managed vehicle repair coordination / Kerman</p>
          <h1>Your car repaired, without managing every step.</h1>
          <p className={styles.heroLead}>
            Fixauto helps busy car owners coordinate diagnosis, approvals, repair, and return through one accountable coordinator.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#coming-soon">
              Join the coming-soon list
            </a>
            <a className={styles.textButton} href="#how-it-works">
              See how it works
            </a>
          </div>
          <p className={styles.heroNote}>No account needed to request help. Service opening soon in Kerman.</p>
        </div>

        <div className={styles.heroPreview} aria-label="Product preview, demonstration only">
          <div className={styles.previewTopline}>
            <span>fixauto / sample case</span>
            <span className={styles.previewStatus}>DEMO</span>
          </div>
          <div className={styles.previewHeader}>
            <div>
              <p className={styles.previewLabel}>CASE IN MOTION</p>
              <h2>Atlas · Hyundai Tucson</h2>
            </div>
            <span className={styles.caseMark}>FA</span>
          </div>
          <div className={styles.previewProgress} aria-hidden="true">
            <span className={styles.progressDone} />
            <span className={styles.progressDone} />
            <span />
            <span />
          </div>
          <div className={styles.previewGrid}>
            <div>
              <span>Current step</span>
              <strong>Assessment</strong>
            </div>
            <div>
              <span>Next action</span>
              <strong>Approve diagnosis</strong>
            </div>
          </div>
          <div className={styles.previewLog}>
            <div className={styles.logRow}>
              <span className={styles.logDot} />
              <div>
                <strong>Expert visit requested</strong>
                <span>Appointment pending confirmation</span>
              </div>
              <time>09:40</time>
            </div>
            <div className={styles.logRow}>
              <span className={styles.logDot} />
              <div>
                <strong>Symptoms recorded</strong>
                <span>Vibration under braking</span>
              </div>
              <time>09:44</time>
            </div>
            <div className={styles.logRowMuted}>
              <span className={styles.logDot} />
              <div>
                <strong>Repair estimate</strong>
                <span>Waiting for diagnosis</span>
              </div>
              <time>—</time>
            </div>
          </div>
          <p className={styles.previewFooter}>Illustrative screen · no real booking or payment</p>
        </div>
      </header>

      <div>
        <section id="problem" className={styles.problemSection}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionRule}>The problem</p>
            <h2>Car repair should not become a second job.</h2>
          </div>
          <div className={styles.problemCopy}>
            <p>
              The repair is only part of the work. You still have to find the right specialist, explain the symptoms, compare estimates, source parts, arrange transport, follow up, and check what came back.
            </p>
            <div className={styles.frictionList}>
              <span>Find a specialist you can trust</span>
              <span>Know what is approved before spending</span>
              <span>Keep the case moving without chasing</span>
            </div>
          </div>
        </section>

        <section id="how-it-works" className={styles.howSection}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionRule}>How it works</p>
            <h2>One case. Three clear moves.</h2>
          </div>
          <ol className={styles.stepList}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="benefits" className={styles.benefitsSection}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionRule}>Why Fixauto</p>
            <h2>More clarity. Less coordination.</h2>
          </div>
          <div className={styles.benefitLayout}>
            <article className={styles.featureBenefit}>
              <span className={styles.benefitMark}>01</span>
              <h3>One accountable coordinator</h3>
              <p>Have one named Fixauto contact responsible for communicating the case and coordinating the specialists involved.</p>
              <div className={styles.signalLine}>
                <span>one case</span>
                <span>one contact</span>
                <span>clear next step</span>
              </div>
            </article>
            <div className={styles.benefitStack}>
              <article className={styles.benefitRow}>
                <span className={styles.benefitMark}>02</span>
                <div>
                  <h3>Clear decisions before spending</h3>
                  <p>See itemized estimates, parts details, fees, and timing before approving repair work.</p>
                </div>
              </article>
              <article className={styles.benefitRow}>
                <span className={styles.benefitMark}>03</span>
                <div>
                  <h3>Less chasing and uncertainty</h3>
                  <p>Reduce the work of arranging specialists, transport, handovers, updates, quality checks, and final records yourself.</p>
                </div>
              </article>
            </div>
          </div>

          <div className={styles.productStrip}>
            <div>
              <p className={styles.sectionRule}>Inside the demo</p>
              <h3>See the case from both sides.</h3>
              <p>Request a service, follow a saved customer case, or explore the staff workspace. Every screen is labeled as a demonstration.</p>
            </div>
            <div className={styles.screenList}>
              <span><b>01</b> Service request</span>
              <span><b>02</b> Customer case</span>
              <span><b>03</b> Staff workspace</span>
            </div>
          </div>
        </section>

        <section id="coming-soon" className={styles.comingSoon}>
          <div>
            <p className={styles.sectionRule}>Coming soon</p>
            <h2>Fixauto is coming to Kerman.</h2>
            <p>Leave your contact details to hear when the service is ready for its first customers.</p>
          </div>
          {submitted ? (
            <div className={styles.formSuccess} role="status">
              <strong>Thanks. You are on the list.</strong>
              <span>This form is a preview and does not send a real message yet.</span>
            </div>
          ) : (
            <form className={styles.comingForm} onSubmit={handleSubmit}>
              <label htmlFor="coming-soon-contact">Email or mobile number</label>
              <div className={styles.formRow}>
                <input
                  id="coming-soon-contact"
                  name="contact"
                  type="text"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                <button type="button" onClick={() => setSubmitted(Boolean(contact.trim()))}>Notify me</button>
              </div>
              <span>We will only use this to share launch updates.</span>
            </form>
          )}
        </section>
      </div>

      <footer className={styles.footer}>
        <Link className={styles.wordmark} href="/" aria-label="Fixauto home">
          fixauto<span>.</span>
        </Link>
        <span>Managed vehicle repair coordination · Kerman</span>
        <span>Coming soon</span>
      </footer>
    </div>
  );
}








