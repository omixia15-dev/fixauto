"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { CaseSummary } from "../components/case-summary";
import { SimulationBadge } from "../components/simulation-badge";
import {
  RequestValidationError,
  type RequestErrors,
  type ServiceRequestInput,
} from "../domain/sample-case";
import { useDemoCases } from "../store/demo-case-provider";

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

export function RequestScreen() {
  const { data, ready, submitRequest } = useDemoCases();
  const [values, setValues] = useState(emptyRequest);
  const [errors, setErrors] = useState<RequestErrors>({});
  const [receipt, setReceipt] = useState<{ caseId: string; reference: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function setValue<Field extends keyof ServiceRequestInput>(field: Field, value: ServiceRequestInput[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = submitRequest(values);
      setErrors({});
      setReceipt(result);
    } catch (caught) {
      if (caught instanceof RequestValidationError) {
        setErrors(caught.errors);
        queueMicrotask(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      }
    }
  }

  const error = (field: keyof ServiceRequestInput) => errors[field];
  const inputProps = (field: keyof ServiceRequestInput) => ({
    "aria-invalid": Boolean(error(field)),
    "aria-describedby": error(field) ? `${field}-error` : undefined,
  });

  return (
    <div className="page-stack" aria-busy={!ready}>
      <section className="hero">
        <div>
          <SimulationBadge>service request</SimulationBadge>
          <p className="eyebrow">Managed car repair</p>
          <h1>Let us manage your car repair</h1>
          <p className="lede">Request an expert visit without creating an account or uploading documents.</p>
        </div>
        <ol className="journey" aria-label="Service journey">
          <li>Assessment</li><li>Approval</li><li>Repair</li><li>Return</li>
        </ol>
      </section>

      {receipt ? (
        <section className="card success-card" role="status" aria-labelledby="receipt-title">
          <p className="eyebrow">Sample request received</p>
          <h2 id="receipt-title">Reference {receipt.reference}</h2>
          <p>Your requested appointment is pending staff confirmation. No visit or charge has occurred.</p>
          <Link className="button" href={`/cases/${receipt.caseId}`}>Open customer case</Link>
        </section>
      ) : null}

      <form ref={formRef} className="card request-form" onSubmit={handleSubmit} noValidate>
        <div className="section-heading">
          <div><p className="eyebrow">Sample data only</p><h2>Request an expert visit</h2></div>
          <span className="status-pill">Staff confirmation required</span>
        </div>
        <p className="helper-text">Every value is fictional. Submitting this form does not create a real booking.</p>
        <div className="form-grid">
          <Field label="Contact name" name="contactName" error={error("contactName")}>
            <input id="contactName" value={values.contactName} onChange={(event) => setValue("contactName", event.target.value)} {...inputProps("contactName")} />
          </Field>
          <Field label="Mobile number" name="mobile" error={error("mobile")}>
            <input id="mobile" inputMode="tel" value={values.mobile} onChange={(event) => setValue("mobile", event.target.value)} {...inputProps("mobile")} />
          </Field>
          <Field label="Vehicle make" name="make" error={error("make")}>
            <input id="make" value={values.make} onChange={(event) => setValue("make", event.target.value)} {...inputProps("make")} />
          </Field>
          <Field label="Model" name="model" error={error("model")}>
            <input id="model" value={values.model} onChange={(event) => setValue("model", event.target.value)} {...inputProps("model")} />
          </Field>
          <Field label="Year" name="year" error={error("year")}>
            <input id="year" inputMode="numeric" value={values.year} onChange={(event) => setValue("year", event.target.value)} {...inputProps("year")} />
          </Field>
          <Field label="Preferred date" name="preferredDate" error={error("preferredDate")}>
            <input id="preferredDate" type="date" value={values.preferredDate} onChange={(event) => setValue("preferredDate", event.target.value)} {...inputProps("preferredDate")} />
          </Field>
          <Field label="Preferred time" name="preferredTime" error={error("preferredTime")}>
            <input id="preferredTime" type="time" value={values.preferredTime} onChange={(event) => setValue("preferredTime", event.target.value)} {...inputProps("preferredTime")} />
          </Field>
          <Field label="Visit type" name="serviceMode">
            <select id="serviceMode" value={values.serviceMode} onChange={(event) => setValue("serviceMode", event.target.value as ServiceRequestInput["serviceMode"])}>
              <option value="expert-visit">Expert visits my address</option>
              <option value="office-dropoff">I will arrange an office drop-off</option>
            </select>
          </Field>
          <div className="full-field">
            <Field label="Describe the symptoms" name="symptoms" error={error("symptoms")}>
              <textarea id="symptoms" value={values.symptoms} onChange={(event) => setValue("symptoms", event.target.value)} {...inputProps("symptoms")} />
            </Field>
          </div>
          {values.serviceMode === "expert-visit" ? (
            <div className="full-field">
              <Field label="Expert-visit address" name="visitAddress" error={error("visitAddress")}>
                <textarea id="visitAddress" value={values.visitAddress} onChange={(event) => setValue("visitAddress", event.target.value)} {...inputProps("visitAddress")} />
              </Field>
            </div>
          ) : null}
        </div>
        <button className="button" type="submit">Create sample request</button>
      </form>

      <section aria-labelledby="existing-sample-title">
        <p className="eyebrow">Existing reset sample</p>
        <h2 id="existing-sample-title">Shared case foundation</h2>
        <CaseSummary sampleCase={data.cases[0]} />
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: keyof ServiceRequestInput;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {error ? <span id={`${name}-error`} className="field-error">{error}</span> : null}
    </div>
  );
}
