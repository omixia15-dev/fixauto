"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { PublicHeader } from "../components/public-header";
import {
  RequestValidationError,
  serviceDateFromIso,
  validateServiceRequest,
  type RequestErrors,
  type ServiceRequestInput,
} from "../domain/sample-case";
import { useDemoCases } from "../store/demo-case-provider";
import styles from "./request-screen.module.css";

const emptyRequest: ServiceRequestInput = {
  contactName: "",
  mobile: "",
  make: "",
  model: "",
  year: "",
  symptoms: "",
  preferredDate: "",
  preferredTime: "",
  serviceMode: "expert-visit",
  visitAddress: "",
};

const fieldLabels: Record<keyof ServiceRequestInput, string> = {
  contactName: "Contact name",
  mobile: "Mobile number",
  make: "Vehicle make",
  model: "Model",
  year: "Year",
  symptoms: "Describe the symptoms",
  preferredDate: "Preferred date",
  preferredTime: "Preferred time",
  serviceMode: "Visit type",
  visitAddress: "Visit address",
};

const requestOrder: Array<keyof ServiceRequestInput> = [
  "make",
  "model",
  "year",
  "serviceMode",
  "preferredDate",
  "preferredTime",
  "visitAddress",
  "symptoms",
  "contactName",
  "mobile",
];

const serviceModeLabels: Record<ServiceRequestInput["serviceMode"], string> = {
  "expert-visit": "Expert visits my address",
  "collection-request": "Request a collection",
  "office-dropoff": "I will arrange an office drop-off",
};

function formatPreferredDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value + "T12:00:00Z"));
}

export function RequestScreen() {
  const { ready, storageError, retryStorage, submitRequest } = useDemoCases();
  const [values, setValues] = useState(emptyRequest);
  const [errors, setErrors] = useState<RequestErrors>({});
  const [formError, setFormError] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);
  const [step, setStep] = useState<"form" | "review" | "complete">("form");
  const [receipt, setReceipt] = useState<{ caseId: string; reference: string } | null>(null);
  const [today, setToday] = useState("");
  const [focusTarget, setFocusTarget] = useState<keyof ServiceRequestInput | null>(null);
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    queueMicrotask(() => setToday(serviceDateFromIso(new Date().toISOString())));
  }, []);

  useEffect(() => {
    if (step === "review") {
      reviewHeadingRef.current?.focus();
      return;
    }

    if (focusTarget) {
      document.getElementById(focusTarget)?.focus();
      queueMicrotask(() => setFocusTarget(null));
    }
  }, [focusTarget, step]);

  function setValue<Field extends keyof ServiceRequestInput>(field: Field, value: ServiceRequestInput[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function setServiceMode(value: ServiceRequestInput["serviceMode"]) {
    setValue("serviceMode", value);
    if (value === "office-dropoff") {
      setErrors((current) => {
        if (!current.visitAddress) return current;
        const next = { ...current };
        delete next.visitAddress;
        return next;
      });
    }
  }

  function describedBy(field: keyof ServiceRequestInput, hint = false) {
    const ids = [hint ? field + "-hint" : "", errors[field] ? field + "-error" : ""].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step === "form") {
      const nextErrors = validateServiceRequest(values, serviceDateFromIso(new Date().toISOString()));
      setErrors(nextErrors);
      setFormError("");
      if (Object.keys(nextErrors).length === 0) {
        setStep("review");
      } else {
        setFocusTarget(requestOrder.find((field) => nextErrors[field]) ?? null);
      }
      return;
    }

    if (step !== "review") return;

    try {
      const result = submitRequest(values);
      setErrors({});
      setFormError("");
      setSaveFailed(false);
      setReceipt(result);
      setStep("complete");
    } catch (caught) {
      if (caught instanceof RequestValidationError) {
        setErrors(caught.errors);
        setStep("form");
        setFocusTarget(requestOrder.find((field) => caught.errors[field]) ?? null);
      } else {
        setFormError("This sample request could not be saved. Your entries are still here. Check browser storage, then try again.");
        setSaveFailed(true);
      }
    }
  }

  function edit(field: keyof ServiceRequestInput) {
    setFocusTarget(field);
    setStep("form");
  }

  function handleStorageRetry() {
    setFormError("");
    setSaveFailed(false);
    retryStorage();
  }

  const errorFields = requestOrder.filter((field) => errors[field]);

  return (
    <div className={styles.page}>
      <PublicHeader />

      <div className={styles.main}>
        <div className={styles.layout}>
          <aside className={styles.intro} aria-labelledby="request-title">
            <h1 id="request-title">Request an expert visit</h1>
            <p className={styles.lede}>Tell us what you’ve noticed. Your coordinator will arrange the next step.</p>
            <p className={styles.demoNotice}>Demo · Use sample details to explore. Saved only in this browser. No real visit is booked.</p>

            <figure className={styles.figure}>
              <Image
                src="/images/landing-assessment-branded.png"
                alt="Concept image of a technician reviewing a vehicle during an expert assessment"
                width={1584}
                height={992}
                sizes="(max-width: 56rem) calc(100vw - 2rem), 34vw"
                priority
              />
              <figcaption>Concept image · an expert assessment</figcaption>
            </figure>

            <div className={styles.localNote}>
              <h2>Kerman requests</h2>
              <p>A coordinator confirms whether your requested visit can be arranged.</p>
              <p>Choose a preferred time in Kerman local time. It is a preference, not an available appointment slot.</p>
            </div>
          </aside>

          <section
            className={styles.requestRegion}
            aria-labelledby={step === "review" ? "review-title" : step === "complete" ? "receipt-title" : "form-title"}
          >
            {storageError ? (
              <div className={styles.errorBanner} role="alert">
                <p>{storageError}</p>
                <button className={styles.secondaryButton} type="button" onClick={handleStorageRetry}>Retry browser storage</button>
              </div>
            ) : null}

            {!ready ? <p className={styles.loadingStatus} role="status">Preparing your sample request…</p> : null}

            {step === "complete" && receipt ? (
              <section className={styles.receipt} role="status" aria-labelledby="receipt-title">
                <h2 id="receipt-title">Sample request created</h2>
                <h3 className={styles.reference}>Reference {receipt.reference}</h3>
                <p>Your request is pending staff confirmation. No appointment is confirmed and no charge has been made.</p>
                <Link className={styles.primaryButton} href={`/case?caseId=${encodeURIComponent(receipt.caseId)}`}>Follow your repair case</Link>
              </section>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {step === "form" ? (
                  <>
                    <div className={styles.formHeading}>
                      <h2 id="form-title">Tell us about your car</h2>
                      <p>All fields are required unless stated otherwise.</p>
                    </div>

                    {errorFields.length > 0 ? (
                      <div className={styles.errorSummary} role="alert" aria-labelledby="error-summary-title" tabIndex={-1}>
                        <h3 id="error-summary-title">There is a problem</h3>
                        <p>Review these fields before continuing:</p>
                        <ul>
                          {errorFields.map((field) => (
                            <li key={field}>
                              <a href={"#" + field}>
                                {field === "visitAddress"
                                  ? values.serviceMode === "collection-request" ? "Requested collection address" : "Expert-visit address"
                                  : fieldLabels[field]}: {errors[field]}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {formError ? <p className={styles.formError} role="alert">{formError}</p> : null}

                    <fieldset className={styles.fieldset}>
                      <legend>Your car</legend>
                      <div className={styles.fieldGrid}>
                        <Field label="Vehicle make" name="make" error={errors.make}>
                          <input id="make" autoComplete="off" maxLength={80} required value={values.make} onChange={(event) => setValue("make", event.target.value)} aria-invalid={Boolean(errors.make)} aria-describedby={describedBy("make")} />
                        </Field>
                        <Field label="Model" name="model" error={errors.model}>
                          <input id="model" autoComplete="off" maxLength={80} required value={values.model} onChange={(event) => setValue("model", event.target.value)} aria-invalid={Boolean(errors.model)} aria-describedby={describedBy("model")} />
                        </Field>
                        <Field label="Year" name="year" error={errors.year}>
                          <input id="year" inputMode="numeric" autoComplete="off" maxLength={4} required value={values.year} onChange={(event) => setValue("year", event.target.value)} aria-invalid={Boolean(errors.year)} aria-describedby={describedBy("year")} />
                        </Field>
                      </div>
                    </fieldset>

                    <fieldset className={styles.fieldset}>
                      <legend>The visit</legend>
                      <div className={styles.fieldGrid}>
                        <Field label="Visit type" name="serviceMode">
                          <select id="serviceMode" required value={values.serviceMode} onChange={(event) => setServiceMode(event.target.value as ServiceRequestInput["serviceMode"])}>
                            <option value="expert-visit">Expert visits my address</option>
                            <option value="collection-request">Request a collection</option>
                            <option value="office-dropoff">I will arrange an office drop-off</option>
                          </select>
                        </Field>
                        <Field label="Preferred date" name="preferredDate" error={errors.preferredDate}>
                          <input id="preferredDate" type="date" min={today || undefined} required value={values.preferredDate} onChange={(event) => setValue("preferredDate", event.target.value)} aria-invalid={Boolean(errors.preferredDate)} aria-describedby={describedBy("preferredDate")} />
                        </Field>
                        <Field label="Preferred time" name="preferredTime" error={errors.preferredTime} hint="Kerman local time; staff confirms availability.">
                          <input id="preferredTime" type="time" step={60} required value={values.preferredTime} onChange={(event) => setValue("preferredTime", event.target.value)} aria-invalid={Boolean(errors.preferredTime)} aria-describedby={describedBy("preferredTime", true)} />
                        </Field>
                        {values.serviceMode !== "office-dropoff" ? (
                          <div className={styles.wideField}>
                            <Field label={values.serviceMode === "collection-request" ? "Requested collection address" : "Expert-visit address"} name="visitAddress" error={errors.visitAddress}>
                              <textarea id="visitAddress" maxLength={240} required value={values.visitAddress} onChange={(event) => setValue("visitAddress", event.target.value)} aria-invalid={Boolean(errors.visitAddress)} aria-describedby={describedBy("visitAddress")} />
                            </Field>
                          </div>
                        ) : null}
                        <div className={styles.wideField}>
                          <Field label="Describe the symptoms" name="symptoms" error={errors.symptoms} hint="Include when it happens and anything that has changed recently.">
                            <textarea id="symptoms" maxLength={1000} required value={values.symptoms} onChange={(event) => setValue("symptoms", event.target.value)} aria-invalid={Boolean(errors.symptoms)} aria-describedby={describedBy("symptoms", true)} />
                          </Field>
                        </div>
                      </div>
                    </fieldset>

                    <fieldset className={styles.fieldset}>
                      <legend>Your details</legend>
                      <div className={styles.fieldGrid}>
                        <Field label="Contact name" name="contactName" error={errors.contactName}>
                          <input id="contactName" autoComplete="name" maxLength={100} required value={values.contactName} onChange={(event) => setValue("contactName", event.target.value)} aria-invalid={Boolean(errors.contactName)} aria-describedby={describedBy("contactName")} />
                        </Field>
                        <Field label="Mobile number" name="mobile" error={errors.mobile}>
                          <input id="mobile" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} required value={values.mobile} onChange={(event) => setValue("mobile", event.target.value)} aria-invalid={Boolean(errors.mobile)} aria-describedby={describedBy("mobile")} />
                        </Field>
                      </div>
                    </fieldset>

                    <div className={styles.costNote}>
                      <h3>Approval and costs</h3>
                      <p>Assessment fees are agreed before the visit, even if you decide against repairs. Transport, further investigation and repair each need separate approval. No charge is made by this request.</p>
                    </div>

                    <div className={styles.actions}>
                      <button className={styles.primaryButton} type="submit" disabled={!ready || Boolean(storageError)}>Review request</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.formHeading}>
                      <h2 id="review-title" ref={reviewHeadingRef} tabIndex={-1}>Review your request</h2>
                      <p>Check the details before creating a sample request. This review creates no record.</p>
                    </div>

                    {formError ? (
                      <div className={styles.formError} role="alert">
                        <p>{formError}</p>
                        {saveFailed || storageError ? <button className={styles.secondaryButton} type="button" onClick={handleStorageRetry}>Retry browser storage</button> : null}
                      </div>
                    ) : null}

                    <ReviewGroup title="Your car" onEdit={() => edit("make")}>
                      <Answer label="Vehicle make" value={values.make} />
                      <Answer label="Model" value={values.model} />
                      <Answer label="Year" value={values.year} />
                    </ReviewGroup>

                    <ReviewGroup title="The visit" onEdit={() => edit("serviceMode")}>
                      <Answer label="Visit type" value={serviceModeLabels[values.serviceMode]} />
                      <Answer label="Preferred date" value={formatPreferredDate(values.preferredDate)} />
                      <Answer label="Preferred time" value={values.preferredTime + " · Kerman local time"} />
                      {values.serviceMode !== "office-dropoff" ? <Answer label={values.serviceMode === "collection-request" ? "Requested collection address" : "Expert-visit address"} value={values.visitAddress} /> : null}
                      <Answer label="Describe the symptoms" value={values.symptoms} />
                    </ReviewGroup>

                    <ReviewGroup title="Your details" onEdit={() => edit("contactName")}>
                      <Answer label="Contact name" value={values.contactName} />
                      <Answer label="Mobile number" value={values.mobile} />
                    </ReviewGroup>

                    <p className={styles.reviewNotice}>No charge or appointment is confirmed by this request. The assessment fee is disclosed for approval before a visit and remains payable if the completed assessment is followed by a decision to stop. Transport, investigation, and repair require separate approval.</p>
                    <div className={styles.actions}>
                      <button className={styles.primaryButton} type="submit" disabled={!ready || Boolean(storageError)}>Create sample request</button>
                    </div>
                  </>
                )}
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: keyof ServiceRequestInput;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label}</label>
      {children}
      {hint ? <span className={styles.hint} id={name + "-hint"}>{hint}</span> : null}
      {error ? <span className={styles.fieldError} id={name + "-error"}>{error}</span> : null}
    </div>
  );
}

function ReviewGroup({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <section className={styles.reviewGroup} aria-label={title}>
      <div className={styles.reviewHeading}>
        <h3>{title}</h3>
        <button className={styles.editButton} type="button" onClick={onEdit} aria-label={"Edit " + title}>Edit</button>
      </div>
      <dl>{children}</dl>
    </section>
  );
}

function Answer({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.answer}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
