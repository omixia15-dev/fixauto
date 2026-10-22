"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { useWarningInteraction } from "@/src/components/use-warning-interaction";
import { WarningLights, type WarningScene } from "@/src/components/warning-lights";
import { PublicHeader } from "@/src/components/public-header";
import styles from "./page.module.css";

const alexandria = localFont({
  src: [
    { path: "./fonts/alexandria-regular.ttf", weight: "400" },
    { path: "./fonts/alexandria-semibold.ttf", weight: "600" },
  ],
  display: "swap",
});

export default function HomePage() {
  const landingRef = useRef<HTMLDivElement>(null);
  const [activeScene, setActiveScene] = useState<WarningScene | null>("hero");
  const { revealedCount, soundEnabled, toggleSound, soundAvailable, quietEnding } = useWarningInteraction(activeScene ?? "");

  useEffect(() => {
    const landing = landingRef.current;
    if (!landing || !("IntersectionObserver" in window)) return;

    const scenes = Array.from(
      landing.querySelectorAll<HTMLElement>("[data-scene]"),
    );
    if (scenes.length < 2) return;

    landing.dataset.enhanced = "true";
    const visibleScenes = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleScenes.set(entry.target, entry.intersectionRatio);
          else visibleScenes.delete(entry.target);
        }
        const active = [...visibleScenes].sort((a, b) => b[1] - a[1])[0]?.[0];
        setActiveScene(active ? active.getAttribute("data-scene") as WarningScene : null);
        scenes.forEach((scene) =>
          scene.classList.toggle(styles.active, scene === active),
        );
      },
      {
        rootMargin: "-28% 0px -28% 0px",
        threshold: [0.01, 0.3, 0.6, 0.9],
      },
    );

    scenes.forEach((scene) => observer.observe(scene));
    return () => {
      observer.disconnect();
      delete landing.dataset.enhanced;
      scenes.forEach((scene) => scene.classList.remove(styles.active));
    };
  }, []);

  return (
    <div
      ref={landingRef}
      className={`${styles.landing} ${alexandria.className}`}
    >
      <button
        className={styles.soundToggle}
        type="button"
        aria-label={quietEnding ? "Sound off for the quiet ending" : soundEnabled ? "Mute warning sounds" : "Enable warning sounds"}
        aria-pressed={soundEnabled}
        disabled={!soundAvailable || quietEnding}
        onClick={() => void toggleSound()}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" />{soundEnabled ? <path d="M16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14" /> : <path d="m17 9 5 6m0-6-5 6" />}</svg>
        <span>{quietEnding ? "Quiet ending" : !soundAvailable ? "Sound unavailable" : soundEnabled ? "Sound on" : "Sound off"}</span>
      </button>
      <a className={styles.skipLink} href="#summary">
        Skip to the journey
      </a>
      <div className={styles.header}>
        <PublicHeader><WarningLights revealedCount={revealedCount} /></PublicHeader>
      </div>

      <section className={styles.scenes} aria-label="The Fixauto service journey">
        <article
          className={`${styles.scene} ${styles.sceneStart} ${styles.active}`}
          data-scene="hero"
          aria-labelledby="title-start"
        >
          <div className={styles.sceneCopy}>
            <h1 className={styles.sceneTitle} id="title-start">
              <span>Car repairs.</span>
              <span>Handled for you.</span>
            </h1>
            <p>Assessment to return. One coordinator.</p>
            <Link className={styles.actionLink} href="#expert">
              <span>See how it works</span>
              <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                <path d="M3.5 10h12m-5-5 5 5-5 5" />
              </svg>
            </Link>
          </div>
          <figure className={styles.sceneMedia}>
            <Image
              src="/images/landing-hero-branded.png"
              alt="Concept image of a customer handing her car key to a coordinator wearing a Fixauto uniform and cap."
              width={1584}
              height={992}
              sizes="100vw"
              preload
              className={styles.sceneImage}
            />
          </figure>
        </article>

        <article
          className={`${styles.scene} ${styles.sceneExpert}`}
          data-scene="assessment"
          id="expert"
          aria-labelledby="title-expert"
        >
          <div className={styles.sceneCopy}>
            <h2 className={styles.sceneTitle} id="title-expert">
              Start with an expert.
            </h2>
            <p>Describe the symptoms. We arrange the assessment.</p>
            <details className={styles.serviceDetail}>
              <summary>Assessment and optional services</summary>
              <p>
                Any assessment fee is shared with you and approved before the
                visit. Transport and further investigation are offered
                separately for your approval.
              </p>
            </details>
          </div>
          <figure className={styles.sceneMedia}>
            <Image
              src="/images/landing-assessment-branded.png"
              alt="Concept image of a Fixauto expert wearing a branded cap and uniform while inspecting a car."
              width={1584}
              height={992}
              sizes="100vw"
              loading="lazy"
              className={styles.sceneImage}
            />
          </figure>
        </article>

        <article
          className={`${styles.scene} ${styles.sceneApproval}`}
          data-scene="approval"
          id="approval"
          aria-labelledby="title-approval"
        >
          <div className={styles.sceneCopy}>
            <h2 className={styles.sceneTitle} id="title-approval">
              You stay in control.
            </h2>
            <p>Review the work and cost. Changes need your approval.</p>
            <details className={styles.serviceDetail}>
              <summary>If the estimate changes</summary>
              <p>
                Work pauses while the coordinator shares the updated scope and
                cost for your approval.
              </p>
            </details>
          </div>
          <figure className={styles.sceneMedia}>
            <Image
              src="/images/landing-approval.png"
              alt="Concept image of a customer reviewing a repair estimate on her phone."
              width={1584}
              height={992}
              sizes="100vw"
              loading="lazy"
              className={styles.sceneImage}
            />
          </figure>
        </article>

        <article
          className={`${styles.scene} ${styles.sceneReturn}`}
          data-scene="return"
          id="return"
          aria-labelledby="title-return"
        >
          <div className={styles.sceneCopy}>
            <h2 className={styles.sceneTitle} id="title-return">
              Back to your day.
            </h2>
            <p>Checked. Documented. Returned.</p>
            <Link className={styles.journeyLink} href="#summary">
              <span>View the journey</span>
              <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                <path d="M3.5 10h12m-5-5 5 5-5 5" />
              </svg>
            </Link>
          </div>
          <figure className={styles.sceneMedia}>
            <Image
              src="/images/landing-return.png"
              alt="Concept image of a woman relaxed at her desk, with her car visible outside."
              width={1584}
              height={992}
              sizes="100vw"
              loading="lazy"
              className={styles.sceneImage}
            />
          </figure>
        </article>
      </section>

      <div className={styles.journeyEnding}>
        <section className={styles.summary} id="summary">
          <details className={styles.journeyDetails}>
            <summary>
              <span>The planned eight-step journey</span>
              <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                <path d="m5 7.5 5 5 5-5" />
              </svg>
            </summary>
            <div className={styles.summaryContent}>
              <p className={styles.summaryNote}>
                Planned service overview. A visit request does not confirm an
                appointment.
              </p>
              <ol className={styles.journeySteps}>
                <li>
                  Notice a problem and describe the symptoms. No diagnosis is
                  needed.
                </li>
                <li>
                  Request help. In the planned service, a coordinator would
                  confirm next steps.
                </li>
                <li>
                  Review and approve the assessment fee before a visit. Transport
                  and further investigation need separate approval.
                </li>
                <li>
                  Review an itemized repair estimate. Changed scope, cost, or
                  parts require fresh approval.
                </li>
                <li>
                  The coordinator arranges approved repair work and keeps you
                  informed.
                </li>
                <li>
                  The work is checked. Failed checks keep the case open for
                  reassessment.
                </li>
                <li>
                  Complete final settlement and a documented return, including
                  recipient, condition, mileage, and keys.
                </li>
                <li>
                  Keep the case records and your coordinator&apos;s follow-up
                  contact.
                </li>
              </ol>
            </div>
          </details>
        </section>

        <section className={styles.finalCta} data-scene="request" id="coming-soon" aria-label="Request a visit">
          <Image
            className={styles.requestImage}
            src="/images/landing-request.png"
            alt="Concept image of a woman describing a car problem by phone beside her parked car."
            width={1584}
            height={992}
            sizes="100vw"
            loading="lazy"
          />
          <div className={styles.finalCtaCopy}>
            <p>Your car has a problem</p>
            <Link className={styles.requestButton} href="/case/new">
              Request a visit
            </Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Planned service &middot; Generated concept imagery</span>
          <Link href="/case">Explore the demo</Link>
        </footer>
      </div>
    </div>
  );
}
