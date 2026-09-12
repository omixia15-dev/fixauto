export const DEMO_SCHEMA_VERSION = 2 as const;

export type CurrencyCode = "USD";
export type PaymentPurpose = "assessment" | "investigation";
export type PaymentOutcome = "simulated-success" | "simulated-failed" | "simulated-canceled";

export type SimulatedPayment = {
  id: string;
  purpose: PaymentPurpose;
  label: string;
  amountCents: number;
  currency: CurrencyCode;
  outcome: PaymentOutcome;
  attemptedAt: string;
};

export type SimulatedSms = {
  id: string;
  situation: string;
  nextAction: string;
  expectedTiming: string;
  simulated: true;
};

export type ServiceMode = "expert-visit" | "office-dropoff";

export type ServiceRequest = {
  source: "web" | "sample";
  serviceMode: ServiceMode;
  symptoms: string;
  preferredDate: string;
  preferredTime: string;
  visitAddress: string;
  createdAt: string;
  confirmedAppointment: null | {
    date: string;
    time: string;
    coordinator: string;
    confirmedAt: string;
  };
};

export type Assessment = {
  scope: string;
  feeCents: number;
  currency: CurrencyCode;
  authorizedAt: string | null;
  authorizer: string | null;
  performedAt: string | null;
  expertName: string | null;
  findings: string | null;
  needsInvestigation: boolean | null;
  feeEarned: boolean;
  furtherServiceDeclinedAt: string | null;
  investigation: {
    scope: string;
    feeCents: number;
    currency: CurrencyCode;
    authorizedAt: string | null;
    authorizer: string | null;
  };
};

export type SampleCase = {
  id: string;
  reference: string;
  customer: { name: string; mobile: string };
  vehicle: { make: string; model: string; year: number };
  request: ServiceRequest;
  assessment: Assessment;
  sharedNote: string;
  payments: SimulatedPayment[];
  smsLog: SimulatedSms[];
};

export type DemoData = {
  schemaVersion: typeof DEMO_SCHEMA_VERSION;
  cases: SampleCase[];
};

export type ServiceRequestInput = {
  contactName: string;
  mobile: string;
  make: string;
  model: string;
  year: string;
  symptoms: string;
  preferredDate: string;
  preferredTime: string;
  serviceMode: ServiceMode;
  visitAddress: string;
};

export type RequestField = keyof ServiceRequestInput;
export type RequestErrors = Partial<Record<RequestField, string>>;

export class RequestValidationError extends Error {
  readonly errors: RequestErrors;

  constructor(errors: RequestErrors) {
    super("Please correct the highlighted request fields.");
    this.errors = errors;
  }
}

export type CasePhase =
  | "pending-staff-confirmation"
  | "assessment-authorization-required"
  | "assessment-payment-required"
  | "assessment-ready"
  | "assessment-complete"
  | "investigation-authorization-required"
  | "investigation-payment-required"
  | "investigation-funded"
  | "further-service-declined";

const mobilePattern = /^[+\d][\d\s()-]{6,19}$/;

export function validateServiceRequest(input: ServiceRequestInput, today: string): RequestErrors {
  const errors: RequestErrors = {};
  const year = Number(input.year);
  const maximumYear = Number(today.slice(0, 4)) + 1;

  if (input.contactName.trim().length < 2) errors.contactName = "Enter the customer name.";
  if (!mobilePattern.test(input.mobile.trim())) errors.mobile = "Enter a valid sample mobile number.";
  if (input.make.trim().length < 2) errors.make = "Enter the vehicle make.";
  if (input.model.trim().length < 1) errors.model = "Enter the vehicle model.";
  if (!Number.isInteger(year) || year < 1980 || year > maximumYear) {
    errors.year = `Enter a model year from 1980 to ${maximumYear}.`;
  }
  if (input.symptoms.trim().length < 10) errors.symptoms = "Describe the symptoms in at least 10 characters.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.preferredDate) || input.preferredDate < today) {
    errors.preferredDate = "Choose today or a future date.";
  }
  if (!/^\d{2}:\d{2}$/.test(input.preferredTime)) errors.preferredTime = "Choose a preferred time.";
  if (input.serviceMode === "expert-visit" && input.visitAddress.trim().length < 5) {
    errors.visitAddress = "Enter the address for the expert visit.";
  }
  return errors;
}

export function createPendingAssessment(): Assessment {
  return {
    scope: "Expert visit to review reported symptoms and recommend the next diagnostic step.",
    feeCents: 4500,
    currency: "USD",
    authorizedAt: null,
    authorizer: null,
    performedAt: null,
    expertName: null,
    findings: null,
    needsInvestigation: null,
    feeEarned: false,
    furtherServiceDeclinedAt: null,
    investigation: {
      scope: "Deeper workshop investigation after the initial expert visit.",
      feeCents: 8500,
      currency: "USD",
      authorizedAt: null,
      authorizer: null,
    },
  };
}

export function submitServiceRequest(
  data: DemoData,
  input: ServiceRequestInput,
  identity: { caseId: string; reference: string },
  now: string,
  today: string,
): { data: DemoData; sampleCase: SampleCase } {
  const errors = validateServiceRequest(input, today);
  if (Object.keys(errors).length > 0) throw new RequestValidationError(errors);
  if (data.cases.some((item) => item.id === identity.caseId || item.reference === identity.reference)) {
    throw new Error("That sample case identity already exists.");
  }

  const sampleCase: SampleCase = {
    id: identity.caseId,
    reference: identity.reference,
    customer: { name: input.contactName.trim(), mobile: input.mobile.trim() },
    vehicle: { make: input.make.trim(), model: input.model.trim(), year: Number(input.year) },
    request: {
      source: "web",
      serviceMode: input.serviceMode,
      symptoms: input.symptoms.trim(),
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      visitAddress: input.serviceMode === "expert-visit" ? input.visitAddress.trim() : "",
      createdAt: now,
      confirmedAppointment: null,
    },
    assessment: createPendingAssessment(),
    sharedNote: "New web request awaiting staff review.",
    payments: [],
    smsLog: [],
  };
  return { data: { ...data, cases: [...data.cases, sampleCase] }, sampleCase };
}

export function findCase(data: DemoData, caseId: string): SampleCase | undefined {
  return data.cases.find((sampleCase) => sampleCase.id === caseId);
}

export function hasSuccessfulPayment(sampleCase: SampleCase, purpose: PaymentPurpose): boolean {
  return sampleCase.payments.some(
    (payment) => payment.purpose === purpose && payment.outcome === "simulated-success",
  );
}

export function getCasePhase(sampleCase: SampleCase): CasePhase {
  const assessment = sampleCase.assessment;
  if (assessment.furtherServiceDeclinedAt) return "further-service-declined";
  if (assessment.performedAt) {
    if (assessment.needsInvestigation) {
      if (!assessment.investigation.authorizedAt) return "investigation-authorization-required";
      return hasSuccessfulPayment(sampleCase, "investigation")
        ? "investigation-funded"
        : "investigation-payment-required";
    }
    return "assessment-complete";
  }
  if (!sampleCase.request.confirmedAppointment) return "pending-staff-confirmation";
  if (!assessment.authorizedAt) return "assessment-authorization-required";
  return hasSuccessfulPayment(sampleCase, "assessment")
    ? "assessment-ready"
    : "assessment-payment-required";
}

function updateCase(data: DemoData, caseId: string, update: (item: SampleCase) => SampleCase): DemoData {
  if (!findCase(data, caseId)) throw new Error("The sample case could not be found.");
  return {
    ...data,
    cases: data.cases.map((item) => item.id === caseId ? update(item) : item),
  };
}

export function confirmRequestedAppointment(
  data: DemoData,
  caseId: string,
  coordinator: string,
  now: string,
): DemoData {
  return updateCase(data, caseId, (item) => {
    if (item.request.confirmedAppointment) throw new Error("The appointment is already confirmed.");
    if (coordinator.trim().length < 2) throw new Error("Assign a sample coordinator.");
    return {
      ...item,
      request: {
        ...item.request,
        confirmedAppointment: {
          date: item.request.preferredDate,
          time: item.request.preferredTime,
          coordinator: coordinator.trim(),
          confirmedAt: now,
        },
      },
    };
  });
}

export function authorizeAssessment(data: DemoData, caseId: string, authorizer: string, now: string): DemoData {
  return updateCase(data, caseId, (item) => {
    if (!item.request.confirmedAppointment) throw new Error("Staff must confirm the appointment first.");
    if (item.assessment.authorizedAt) throw new Error("The assessment is already authorized.");
    return { ...item, assessment: { ...item.assessment, authorizedAt: now, authorizer } };
  });
}

export function recordPaymentAttempt(data: DemoData, caseId: string, payment: SimulatedPayment): DemoData {
  return updateCase(data, caseId, (item) => {
    const isAssessment = payment.purpose === "assessment";
    const authorization = isAssessment
      ? item.assessment.authorizedAt
      : item.assessment.investigation.authorizedAt;
    const expectedCharge = isAssessment ? item.assessment : item.assessment.investigation;
    if (!authorization) throw new Error(`${isAssessment ? "Assessment" : "Investigation"} authorization is required first.`);
    if (payment.amountCents !== expectedCharge.feeCents || payment.currency !== expectedCharge.currency) {
      throw new Error("The sample charge must match the disclosed scope and fee.");
    }
    if (hasSuccessfulPayment(item, payment.purpose)) throw new Error("This sample charge is already paid.");
    if (item.payments.some((attempt) => attempt.id === payment.id)) throw new Error("That payment attempt already exists.");
    return { ...item, payments: [...item.payments, payment] };
  });
}

export function recordInitialAssessment(
  data: DemoData,
  caseId: string,
  input: { expertName: string; findings: string; needsInvestigation: boolean },
  now: string,
): DemoData {
  return updateCase(data, caseId, (item) => {
    if (getCasePhase(item) !== "assessment-ready") {
      throw new Error("Assessment authorization and successful payment are required before the visit.");
    }
    if (input.expertName.trim().length < 2) throw new Error("Enter the sample expert name.");
    if (input.findings.trim().length < 10) throw new Error("Enter at least 10 characters of findings.");
    return {
      ...item,
      assessment: {
        ...item.assessment,
        performedAt: now,
        expertName: input.expertName.trim(),
        findings: input.findings.trim(),
        needsInvestigation: input.needsInvestigation,
        feeEarned: true,
      },
    };
  });
}

export function authorizeDeeperInvestigation(
  data: DemoData,
  caseId: string,
  authorizer: string,
  now: string,
): DemoData {
  return updateCase(data, caseId, (item) => {
    if (!item.assessment.performedAt || item.assessment.needsInvestigation !== true) {
      throw new Error("The completed assessment must recommend deeper investigation first.");
    }
    if (item.assessment.investigation.authorizedAt) throw new Error("Investigation is already authorized.");
    return {
      ...item,
      assessment: {
        ...item.assessment,
        investigation: { ...item.assessment.investigation, authorizedAt: now, authorizer },
      },
    };
  });
}

export function declineFurtherService(data: DemoData, caseId: string, now: string): DemoData {
  return updateCase(data, caseId, (item) => {
    if (!item.assessment.performedAt || !item.assessment.feeEarned) {
      throw new Error("The initial assessment must be recorded before further service can be declined.");
    }
    if (item.assessment.furtherServiceDeclinedAt) throw new Error("Further service is already declined.");
    if (hasSuccessfulPayment(item, "investigation")) {
      throw new Error("A funded investigation cannot be closed in the D2 sample workflow.");
    }
    return { ...item, assessment: { ...item.assessment, furtherServiceDeclinedAt: now } };
  });
}

export function updateSharedNote(data: DemoData, caseId: string, sharedNote: string): DemoData {
  const normalizedNote = sharedNote.trim();
  if (normalizedNote.length === 0 || normalizedNote.length > 160) {
    throw new Error("The sample note must contain 1 to 160 characters.");
  }
  return updateCase(data, caseId, (item) => ({ ...item, sharedNote: normalizedNote }));
}
