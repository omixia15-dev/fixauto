export const DEMO_SCHEMA_VERSION = 3 as const;

export type CurrencyCode = "USD";
export type PaymentPurpose = "assessment" | "investigation" | "transport-storage";
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

export type ServiceMode = "expert-visit" | "collection-request" | "office-dropoff";

export type TransportPlanKind = "not-required" | "standard-collection" | "private-parking-exception";
export type TransportPath = "drive" | "tow";
export type VehicleActivity = "idle" | "custody";

export type QualifiedTransportDecision = {
  qualifiedInputName: string;
  suitability: "drive-suitable" | "tow-required" | "uncertain";
  path: TransportPath;
  rationale: string;
  recordedAt: string;
};

export type CustodyReceiver = {
  name: string;
  relation: "customer" | "brother-in-law" | "father";
  authority: "custody-only";
  assignedAt: string;
  assignedBy: string;
};

export type CustodyHandover = {
  receiverName: string;
  condition: string;
  mileage: number;
  keys: string;
  destination: string;
  receivedAt: string;
};

export type TransportPlan = {
  kind: TransportPlanKind;
  scope: string;
  destination: string;
  transportFeeCents: number;
  storageFeeCents: number;
  currency: CurrencyCode;
  authorizedAt: string | null;
  authorizer: string | null;
  qualifiedDecision: QualifiedTransportDecision | null;
  receiver: CustodyReceiver | null;
  dispatchedAt: string | null;
  handover: CustodyHandover | null;
  returnedAt: string | null;
  assessmentEarliestDate: string | null;
  activity: VehicleActivity;
};

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
  transport: TransportPlan;
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

export type TransportPlanningInput = Pick<ServiceRequestInput, "mobile" | "preferredDate" | "serviceMode">;

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
  | "further-service-declined"
  | "transport-authorization-required"
  | "transport-payment-required"
  | "transport-decision-required"
  | "transport-receiver-required"
  | "transport-ready"
  | "custody-handover-required"
  | "custody-return-required";

const mobilePattern = /^[+\d][\d\s()-]{6,19}$/;

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isValidTime(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minute] = value.split(":").map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function dateDayOfWeek(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function addDays(value: string, days: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function tehranDateFromIso(value: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function isNewCustomer(data: DemoData, mobile: string): boolean {
  return !data.cases.some((item) => item.customer.mobile === mobile.trim());
}

function isPrivateParkingException(data: DemoData, input: TransportPlanningInput): boolean {
  if (input.serviceMode !== "collection-request" || !isNewCustomer(data, input.mobile)) return false;
  const day = dateDayOfWeek(input.preferredDate);
  return day === 4 || day === 5;
}

export function createPendingTransport(
  data: DemoData,
  input: TransportPlanningInput,
): TransportPlan {
  if (input.serviceMode === "office-dropoff" || input.serviceMode === "expert-visit") {
    return {
      kind: "not-required",
      scope: "No Fixauto transport requested in this sample.",
      destination: "",
      transportFeeCents: 0,
      storageFeeCents: 0,
      currency: "USD",
      authorizedAt: null,
      authorizer: null,
      qualifiedDecision: null,
      receiver: null,
      dispatchedAt: null,
      handover: null,
      returnedAt: null,
      assessmentEarliestDate: null,
      activity: "idle",
    };
  }
  const exception = isPrivateParkingException(data, input);
  return {
    kind: exception ? "private-parking-exception" : "standard-collection",
    scope: exception
      ? "Tow to designated Fixauto private parking for a Saturday assessment; transport and storage are illustrative."
      : "Simulated vehicle collection to the confirmed destination; transport and storage are illustrative.",
    destination: exception ? "Designated Fixauto private parking" : "Simulated Fixauto destination",
    transportFeeCents: 12000,
    storageFeeCents: 3500,
    currency: "USD",
    authorizedAt: null,
    authorizer: null,
    qualifiedDecision: null,
    receiver: null,
    dispatchedAt: null,
    handover: null,
    returnedAt: null,
    assessmentEarliestDate: exception
      ? addDays(input.preferredDate, dateDayOfWeek(input.preferredDate) === 4 ? 2 : 1)
      : null,
    activity: "idle",
  };
}

export function validateServiceRequest(input: ServiceRequestInput, today: string): RequestErrors {
  const errors: RequestErrors = {};
  const year = Number(input.year);
  const maximumYear = Number(today.slice(0, 4)) + 1;

  if (input.contactName.trim().length < 2) errors.contactName = "Enter the customer name.";
  const mobile = input.mobile.trim();
  const digitCount = mobile.replace(/\D/g, "").length;
  if (!mobilePattern.test(mobile) || digitCount < 7 || digitCount > 15) {
    errors.mobile = "Enter a valid sample mobile number.";
  }
  if (input.make.trim().length < 2) errors.make = "Enter the vehicle make.";
  if (input.model.trim().length < 1) errors.model = "Enter the vehicle model.";
  if (!Number.isInteger(year) || year < 1980 || year > maximumYear) {
    errors.year = `Enter a model year from 1980 to ${maximumYear}.`;
  }
  if (input.symptoms.trim().length < 10) errors.symptoms = "Describe the symptoms in at least 10 characters.";
  if (!isValidDate(input.preferredDate) || input.preferredDate < today) {
    errors.preferredDate = "Choose today or a future date.";
  }
  if (!isValidTime(input.preferredTime)) errors.preferredTime = "Choose a preferred time.";
  if (input.serviceMode !== "office-dropoff" && input.visitAddress.trim().length < 5) {
    errors.visitAddress = input.serviceMode === "collection-request"
      ? "Enter the requested collection address."
      : "Enter the address for the expert visit.";
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
      visitAddress: input.serviceMode === "office-dropoff" ? "" : input.visitAddress.trim(),
      createdAt: now,
      confirmedAppointment: null,
    },
    assessment: createPendingAssessment(),
    transport: createPendingTransport(data, input),
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

function getPaymentRequirement(sampleCase: SampleCase, purpose: PaymentPurpose) {
  switch (purpose) {
    case "transport-storage":
      return {
        label: "Illustrative transport and storage fees",
        scope: sampleCase.transport.scope,
        amountCents: sampleCase.transport.transportFeeCents + sampleCase.transport.storageFeeCents,
        currency: sampleCase.transport.currency,
        authorizedAt: sampleCase.transport.authorizedAt,
      };
    case "assessment":
      return {
        label: "Illustrative assessment fee",
        scope: sampleCase.assessment.scope,
        amountCents: sampleCase.assessment.feeCents,
        currency: sampleCase.assessment.currency,
        authorizedAt: sampleCase.assessment.authorizedAt,
      };
    case "investigation":
      return {
        label: "Illustrative deeper-investigation fee",
        scope: sampleCase.assessment.investigation.scope,
        amountCents: sampleCase.assessment.investigation.feeCents,
        currency: sampleCase.assessment.investigation.currency,
        authorizedAt: sampleCase.assessment.investigation.authorizedAt,
      };
  }
}

export function getDisclosedCharge(sampleCase: SampleCase, purpose: PaymentPurpose) {
  const charge = getPaymentRequirement(sampleCase, purpose);
  return { label: charge.label, scope: charge.scope, amountCents: charge.amountCents, currency: charge.currency };
}

export function occupiesActiveSlot(sampleCase: SampleCase): boolean {
  return sampleCase.transport.activity !== "idle" && !sampleCase.transport.returnedAt;
}

export function getActiveCarCount(data: DemoData): number {
  return data.cases.filter(occupiesActiveSlot).length;
}

export function getActiveOccupant(data: DemoData, excludingCaseId?: string): SampleCase | undefined {
  return data.cases.find((item) => item.id !== excludingCaseId && occupiesActiveSlot(item));
}

export function getCasePhase(sampleCase: SampleCase): CasePhase {
  const assessment = sampleCase.assessment;
  if (assessment.furtherServiceDeclinedAt) return "further-service-declined";
  const transport = sampleCase.transport;
  if (transport.kind !== "not-required" && !transport.returnedAt) {
    if (!sampleCase.request.confirmedAppointment) return "pending-staff-confirmation";
    if (!transport.authorizedAt) return "transport-authorization-required";
    if (!hasSuccessfulPayment(sampleCase, "transport-storage")) return "transport-payment-required";
    if (!transport.qualifiedDecision) return "transport-decision-required";
    if (!transport.receiver) return "transport-receiver-required";
    if (!transport.dispatchedAt) return "transport-ready";
    if (!transport.handover) return "custody-handover-required";
  }
  if (assessment.performedAt) {
    if (assessment.needsInvestigation) {
      if (!assessment.investigation.authorizedAt) return "investigation-authorization-required";
      if (!hasSuccessfulPayment(sampleCase, "investigation")) return "investigation-payment-required";
      return transport.kind !== "not-required" && !transport.returnedAt
        ? "custody-return-required"
        : "investigation-funded";
    }
    return transport.kind !== "not-required" && !transport.returnedAt ? "custody-return-required" : "assessment-complete";
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
    if (item.assessment.furtherServiceDeclinedAt) {
      throw new Error("Further service was declined; no new payment attempt can be recorded.");
    }
    const requirement = getPaymentRequirement(item, payment.purpose);
    const paymentName = payment.purpose === "transport-storage" ? "Transport and storage" : payment.purpose === "assessment" ? "Assessment" : "Investigation";
    if (!requirement.authorizedAt) throw new Error(`${paymentName} authorization is required first.`);
    if (payment.amountCents !== requirement.amountCents || payment.currency !== requirement.currency) {
      throw new Error("The sample charge must match the disclosed scope and fee.");
    }
    if (hasSuccessfulPayment(item, payment.purpose)) throw new Error("This sample charge is already paid.");
    if (item.payments.some((attempt) => attempt.id === payment.id)) throw new Error("That payment attempt already exists.");
    return { ...item, payments: [...item.payments, payment] };
  });
}

export function authorizeTransportStorage(data: DemoData, caseId: string, authorizer: string, now: string): DemoData {
  return updateCase(data, caseId, (item) => {
    if (item.transport.kind === "not-required") throw new Error("This sample case does not request Fixauto transport.");
    if (!item.request.confirmedAppointment) throw new Error("Staff must confirm the appointment first.");
    if (item.transport.authorizedAt) throw new Error("Transport and storage are already authorized.");
    if (authorizer.trim().length < 2) throw new Error("Assign a simulated transport authorizer.");
    return { ...item, transport: { ...item.transport, authorizedAt: now, authorizer: authorizer.trim() } };
  });
}

export function recordQualifiedTransportDecision(
  data: DemoData,
  caseId: string,
  input: Omit<QualifiedTransportDecision, "path" | "recordedAt">,
  now: string,
): DemoData {
  return updateCase(data, caseId, (item) => {
    if (item.transport.kind === "not-required") throw new Error("This sample case does not request Fixauto transport.");
    if (!item.transport.authorizedAt || !hasSuccessfulPayment(item, "transport-storage")) {
      throw new Error("Transport and storage authorization and payment are required first.");
    }
    if (input.qualifiedInputName.trim().length < 2) throw new Error("Enter the qualified sample input name.");
    if (input.rationale.trim().length < 10) throw new Error("Explain the sample drive-or-tow decision.");
    const path: TransportPath = item.transport.kind === "private-parking-exception" || input.suitability !== "drive-suitable" ? "tow" : "drive";
    return {
      ...item,
      transport: {
        ...item.transport,
        qualifiedDecision: { ...input, path, recordedAt: now, qualifiedInputName: input.qualifiedInputName.trim(), rationale: input.rationale.trim() },
      },
    };
  });
}

export function assignCustodyReceiver(
  data: DemoData,
  caseId: string,
  input: { name: string; relation: CustodyReceiver["relation"] },
  assignedBy: string,
  now: string,
): DemoData {
  return updateCase(data, caseId, (item) => {
    if (item.transport.kind === "not-required") throw new Error("This sample case does not require custody.");
    if (!item.transport.authorizedAt || !hasSuccessfulPayment(item, "transport-storage")) throw new Error("Transport and storage payment is required first.");
    if (!item.transport.qualifiedDecision) throw new Error("Record qualified transport input first.");
    if (item.transport.receiver) throw new Error("A custody receiver is already assigned.");
    if (input.name.trim().length < 2 || assignedBy.trim().length < 2) throw new Error("Enter the sample receiver and assigning coordinator.");
    return {
      ...item,
      transport: {
        ...item.transport,
        receiver: { name: input.name.trim(), relation: input.relation, authority: "custody-only", assignedAt: now, assignedBy: assignedBy.trim() },
      },
    };
  });
}

export function dispatchVehicle(data: DemoData, caseId: string, now: string): DemoData {
  return updateCase(data, caseId, (item) => {
    if (item.transport.kind === "not-required") throw new Error("This sample case does not require custody.");
    if (!item.transport.authorizedAt || !hasSuccessfulPayment(item, "transport-storage")) throw new Error("Transport and storage payment is required before dispatch.");
    if (!item.transport.qualifiedDecision || !item.transport.receiver) throw new Error("Qualified transport input and a custody receiver are required before dispatch.");
    if (item.transport.dispatchedAt) throw new Error("This sample vehicle has already been dispatched.");
    const occupant = getActiveOccupant(data, caseId);
    if (occupant) throw new Error(`Active-car capacity is full; ${occupant.reference} still occupies the slot.`);
    return { ...item, transport: { ...item.transport, dispatchedAt: now, activity: "custody" } };
  });
}

export function recordCustodyHandover(
  data: DemoData,
  caseId: string,
  input: Omit<CustodyHandover, "receivedAt">,
  now: string,
): DemoData {
  return updateCase(data, caseId, (item) => {
    if (!item.transport.dispatchedAt) throw new Error("Dispatch the sample vehicle before recording custody handover.");
    if (item.transport.handover) throw new Error("Custody handover is already recorded.");
    if (!item.transport.receiver || input.receiverName.trim() !== item.transport.receiver.name) {
      throw new Error("Custody handover receiver must match the assigned receiver.");
    }
    if (input.receiverName.trim().length < 2 || input.condition.trim().length < 5 || input.keys.trim().length < 2) throw new Error("Record receiver, condition, and keys before handover.");
    if (!Number.isFinite(input.mileage) || input.mileage < 0) throw new Error("Enter a non-negative sample mileage.");
    return { ...item, transport: { ...item.transport, handover: { ...input, receiverName: input.receiverName.trim(), condition: input.condition.trim(), keys: input.keys.trim(), destination: input.destination.trim(), receivedAt: now } } };
  });
}

export function recordVehicleReturned(data: DemoData, caseId: string, now: string): DemoData {
  return updateCase(data, caseId, (item) => {
    if (!item.transport.handover) throw new Error("Record custody handover before return.");
    if (item.transport.returnedAt) throw new Error("This sample vehicle is already returned.");
    return { ...item, transport: { ...item.transport, returnedAt: now, activity: "idle" } };
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
    if (item.transport.assessmentEarliestDate && tehranDateFromIso(now) < item.transport.assessmentEarliestDate) {
      throw new Error(`The private-parking assessment cannot begin before ${item.transport.assessmentEarliestDate}.`);
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
    if (item.assessment.furtherServiceDeclinedAt) {
      throw new Error("Further service was declined; investigation cannot be authorized.");
    }
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
    if (item.transport.activity === "custody" && !item.transport.returnedAt) {
      throw new Error("Record the simulated vehicle return before declining further service.");
    }
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
