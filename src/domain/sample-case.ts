export const DEMO_SCHEMA_VERSION = 4 as const;

export type CurrencyCode = "USD";
export type PaymentPurpose = "assessment" | "investigation" | "transport-storage" | "repair-advance";
export type PaymentOutcome = "simulated-success" | "simulated-failed" | "simulated-canceled";

export type SimulatedPayment = {
  id: string;
  purpose: PaymentPurpose;
  label: string;
  amountCents: number;
  currency: CurrencyCode;
  outcome: PaymentOutcome;
  attemptedAt: string;
  estimateVersionId: string | null;
};

export type EstimateLineCategory = "part" | "labor" | "management-fee";
export type PartCondition = "new" | "used" | "remanufactured";

export type EstimateLine = {
  id: string;
  category: EstimateLineCategory;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  currency: CurrencyCode;
  part?: { brand: string; condition: PartCondition; warranty: string };
};

export type RepairEstimateVersion = {
  id: string;
  version: number;
  expectedTiming: string;
  lines: EstimateLine[];
  totalCents: number;
  currency: CurrencyCode;
  publishedAt: string;
  publishedBy: string;
};

export type EstimateDecision = {
  id: string;
  estimateVersionId: string;
  outcome: "approved" | "declined";
  authorizer: string;
  reason: string | null;
  decidedAt: string;
};

export type EstimateReminder = { id: string; estimateVersionId: string; reminderAt: string; simulated: true };
export type AdvanceCreditAllocation = {
  id: string;
  sourcePaymentId: string;
  estimateVersionId: string;
  amountCents: number;
  currency: CurrencyCode;
  allocatedAt: string;
  allocatedBy: string;
};
export type AuthorizedIncurredCost = {
  id: string;
  estimateVersionId: string;
  description: string;
  amountCents: number;
  currency: CurrencyCode;
  authorizedBy: string;
  recordedAt: string;
};
export type EstimateRefund = {
  id: string;
  estimateVersionId: string;
  fundedCents: number;
  authorizedIncurredCents: number;
  unspentCents: number;
  currency: CurrencyCode;
  processedAt: string;
  simulated: true;
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
  estimates: RepairEstimateVersion[];
  estimateDecisions: EstimateDecision[];
  estimateReminders: EstimateReminder[];
  advanceCreditAllocations: AdvanceCreditAllocation[];
  authorizedIncurredCosts: AuthorizedIncurredCost[];
  estimateRefunds: EstimateRefund[];
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
  | "custody-return-required"
  | "estimate-required"
  | "estimate-approval-required"
  | "estimate-unanswered"
  | "estimate-payment-required"
  | "repair-ready"
  | "estimate-declined";

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

export function createEmptyEstimateState() {
  return {
    estimates: [] as RepairEstimateVersion[],
    estimateDecisions: [] as EstimateDecision[],
    estimateReminders: [] as EstimateReminder[],
    advanceCreditAllocations: [] as AdvanceCreditAllocation[],
    authorizedIncurredCosts: [] as AuthorizedIncurredCost[],
    estimateRefunds: [] as EstimateRefund[],
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
    ...createEmptyEstimateState(),
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
    case "repair-advance":
      throw new Error("Repair advance uses the current estimate version instead of a fixed charge.");
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

export function getCurrentEstimate(sampleCase: SampleCase): RepairEstimateVersion | undefined {
  return sampleCase.estimates.at(-1);
}

export function getEstimateDecision(sampleCase: SampleCase, estimateVersionId: string): EstimateDecision | undefined {
  return sampleCase.estimateDecisions.findLast((decision) => decision.estimateVersionId === estimateVersionId);
}

export function getSuccessfulAdvanceTotal(sampleCase: SampleCase, estimateVersionId: string): number {
  return sampleCase.payments
    .filter((payment) => payment.purpose === "repair-advance" && payment.estimateVersionId === estimateVersionId && payment.outcome === "simulated-success")
    .reduce((total, payment) => total + payment.amountCents, 0);
}

export function getAvailableAdvanceCredit(sampleCase: SampleCase): number {
  const funded = sampleCase.payments
    .filter((payment) => payment.purpose === "repair-advance" && payment.outcome === "simulated-success")
    .reduce((total, payment) => total + payment.amountCents, 0);
  const allocated = sampleCase.advanceCreditAllocations.reduce((total, allocation) => total + allocation.amountCents, 0);
  const refunded = sampleCase.estimateRefunds.reduce((total, refund) => total + refund.unspentCents, 0);
  return Math.max(0, funded - allocated - refunded);
}

export function getOutstandingAdvance(sampleCase: SampleCase, estimateVersionId: string): number {
  const estimate = sampleCase.estimates.find((item) => item.id === estimateVersionId);
  if (!estimate) return 0;
  const allocated = sampleCase.advanceCreditAllocations
    .filter((allocation) => allocation.estimateVersionId === estimateVersionId)
    .reduce((total, allocation) => total + allocation.amountCents, 0);
  return Math.max(0, estimate.totalCents - getSuccessfulAdvanceTotal(sampleCase, estimateVersionId) - allocated);
}

export function isCurrentEstimateFunded(sampleCase: SampleCase): boolean {
  const estimate = getCurrentEstimate(sampleCase);
  return Boolean(estimate && getOutstandingAdvance(sampleCase, estimate.id) === 0);
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
    if (transport.kind !== "not-required" && !transport.returnedAt) return "custody-return-required";
  }
  if (!sampleCase.request.confirmedAppointment) return "pending-staff-confirmation";
  if (!assessment.authorizedAt) return "assessment-authorization-required";
  if (!hasSuccessfulPayment(sampleCase, "assessment")) return "assessment-payment-required";
  if (!assessment.performedAt) return "assessment-ready";
  const currentEstimate = getCurrentEstimate(sampleCase);
  if (!currentEstimate) return "estimate-required";
  const decision = getEstimateDecision(sampleCase, currentEstimate.id);
  if (decision?.outcome === "declined") return "estimate-declined";
  if (decision?.outcome === "approved") return isCurrentEstimateFunded(sampleCase) ? "repair-ready" : "estimate-payment-required";
  if (sampleCase.estimateReminders.some((reminder) => reminder.estimateVersionId === currentEstimate.id)) return "estimate-unanswered";
  return "estimate-approval-required";
}

export type EstimateLineInput = Omit<EstimateLine, "totalCents" | "currency">;

function estimateById(sampleCase: SampleCase, estimateVersionId: string): RepairEstimateVersion {
  const estimate = sampleCase.estimates.find((item) => item.id === estimateVersionId);
  if (!estimate) throw new Error("The estimate version could not be found.");
  return estimate;
}

function requireCurrentEstimate(sampleCase: SampleCase, estimateVersionId: string): RepairEstimateVersion {
  const estimate = getCurrentEstimate(sampleCase);
  if (!estimate || estimate.id !== estimateVersionId) throw new Error("Only the current estimate version can be changed or approved.");
  return estimate;
}

function normalizeEstimateLines(lines: EstimateLineInput[]): EstimateLine[] {
  if (lines.length < 3) throw new Error("An estimate needs parts, labor, and management-fee lines.");
  const categories = new Set(lines.map((line) => line.category));
  if (!["part", "labor", "management-fee"].every((category) => categories.has(category as EstimateLineCategory))) {
    throw new Error("An estimate needs separate parts, labor, and management-fee lines.");
  }
  return lines.map((line) => {
    if (!line.id.trim() || !line.description.trim() || !Number.isInteger(line.quantity) || line.quantity <= 0 || !Number.isInteger(line.unitPriceCents) || line.unitPriceCents < 0) {
      throw new Error("Estimate lines need a description, positive quantity, and non-negative integer price.");
    }
    if (line.category === "part" && (!line.part || line.part.brand.trim().length < 2 || !line.part.warranty.trim())) {
      throw new Error("Each part needs a brand, condition, and warranty.");
    }
    if (line.category !== "part" && line.part) throw new Error("Only part lines may contain part details.");
    const totalCents = line.quantity * line.unitPriceCents;
    if (!Number.isSafeInteger(totalCents)) throw new Error("Estimate line total is out of range.");
    return {
      ...line,
      id: line.id.trim(),
      description: line.description.trim(),
      unitPriceCents: line.unitPriceCents,
      totalCents,
      currency: "USD" as const,
      part: line.part ? { ...line.part, brand: line.part.brand.trim(), warranty: line.part.warranty.trim() } : undefined,
    };
  });
}

export function publishEstimate(
  data: DemoData,
  caseId: string,
  input: { expectedTiming: string; lines: EstimateLineInput[] },
  publisher: string,
  now: string,
): DemoData {
  return updateCase(data, caseId, (item) => {
    if (!item.assessment.performedAt || item.assessment.needsInvestigation !== false) throw new Error("A completed expert-first assessment without pending investigation is required before publishing an estimate.");
    if (item.transport.kind !== "not-required" && !item.transport.returnedAt) throw new Error("The vehicle must be returned from custody before publishing an estimate.");
    if (publisher.trim().length < 2 || input.expectedTiming.trim().length < 2) throw new Error("Enter an estimate publisher and expected timing.");
    const lines = normalizeEstimateLines(input.lines);
    return {
      ...item,
      estimates: [...item.estimates, {
        id: `estimate-${item.estimates.length + 1}-${caseId}`,
        version: item.estimates.length + 1,
        expectedTiming: input.expectedTiming.trim(),
        lines,
        totalCents: lines.reduce((total, line) => total + line.totalCents, 0),
        currency: "USD",
        publishedAt: now,
        publishedBy: publisher.trim(),
      }],
    };
  });
}

export function approveEstimate(data: DemoData, caseId: string, estimateVersionId: string, authorizer: string, now: string): DemoData {
  return updateCase(data, caseId, (item) => {
    requireCurrentEstimate(item, estimateVersionId);
    if (authorizer.trim().length < 2) throw new Error("Enter the simulated estimate authorizer.");
    if (getEstimateDecision(item, estimateVersionId)) throw new Error("This estimate already has an approval or decline decision.");
    return { ...item, estimateDecisions: [...item.estimateDecisions, { id: `estimate-decision-${crypto.randomUUID()}`, estimateVersionId, outcome: "approved", authorizer: authorizer.trim(), reason: null, decidedAt: now }] };
  });
}

export function declineEstimate(data: DemoData, caseId: string, estimateVersionId: string, reason: string, authorizer: string, now: string): DemoData {
  return updateCase(data, caseId, (item) => {
    requireCurrentEstimate(item, estimateVersionId);
    if (authorizer.trim().length < 2 || reason.trim().length < 2) throw new Error("Enter the simulated authorizer and decline reason.");
    if (getEstimateDecision(item, estimateVersionId)?.outcome === "declined") throw new Error("This estimate is already declined.");
    return { ...item, estimateDecisions: [...item.estimateDecisions, { id: `estimate-decision-${crypto.randomUUID()}`, estimateVersionId, outcome: "declined", authorizer: authorizer.trim(), reason: reason.trim(), decidedAt: now }] };
  });
}

export function recordEstimateReminder(data: DemoData, caseId: string, estimateVersionId: string, reminderAt: string): DemoData {
  return updateCase(data, caseId, (item) => {
    requireCurrentEstimate(item, estimateVersionId);
    if (getEstimateDecision(item, estimateVersionId)) throw new Error("A decided estimate does not need an unanswered reminder.");
    if (item.estimateReminders.some((reminder) => reminder.estimateVersionId === estimateVersionId)) throw new Error("The simulated 24-hour reminder is already recorded.");
    const estimate = getCurrentEstimate(item)!;
    if (new Date(reminderAt).getTime() < new Date(estimate.publishedAt).getTime() + 24 * 60 * 60 * 1000) throw new Error("The simulated reminder must be at least 24 hours after publication.");
    return { ...item, estimateReminders: [...item.estimateReminders, { id: `estimate-reminder-${crypto.randomUUID()}`, estimateVersionId, reminderAt, simulated: true }] };
  });
}

export function applyAdvanceCredit(data: DemoData, caseId: string, estimateVersionId: string, amountCents: number, authorizer: string, now: string): DemoData {
  return updateCase(data, caseId, (item) => {
    const estimate = requireCurrentEstimate(item, estimateVersionId);
    if (getEstimateDecision(item, estimateVersionId)?.outcome !== "approved") throw new Error("Fresh approval is required before applying prior advance credit.");
    if (!Number.isInteger(amountCents) || amountCents <= 0 || amountCents > getAvailableAdvanceCredit(item) || amountCents > getOutstandingAdvance(item, estimate.id)) throw new Error("Credit allocation exceeds available unallocated funds or the current outstanding advance.");
    const sourcePayment = item.payments.find((payment) => payment.purpose === "repair-advance" && payment.outcome === "simulated-success" && payment.estimateVersionId !== estimate.id);
    if (!sourcePayment) throw new Error("No prior unallocated advance credit is available.");
    return { ...item, advanceCreditAllocations: [...item.advanceCreditAllocations, { id: `credit-${crypto.randomUUID()}`, sourcePaymentId: sourcePayment.id, estimateVersionId, amountCents, currency: "USD", allocatedAt: now, allocatedBy: authorizer.trim() }] };
  });
}

export function recordAuthorizedIncurredCost(data: DemoData, caseId: string, estimateVersionId: string, input: { description: string; amountCents: number; authorizedBy: string }, now: string): DemoData {
  return updateCase(data, caseId, (item) => {
    const estimate = estimateById(item, estimateVersionId);
    if (getCurrentEstimate(item)?.id !== estimate.id || !isCurrentEstimateFunded(item) || !["approved", "declined"].includes(getEstimateDecision(item, estimateVersionId)?.outcome ?? "")) throw new Error("A funded current estimate is required before recording incurred cost.");
    const funded = estimate.totalCents;
    const incurred = item.authorizedIncurredCosts.filter((cost) => cost.estimateVersionId === estimateVersionId).reduce((total, cost) => total + cost.amountCents, 0);
    if (input.description.trim().length < 2 || input.authorizedBy.trim().length < 2 || !Number.isInteger(input.amountCents) || input.amountCents < 0 || incurred + input.amountCents > funded) throw new Error("Authorized incurred cost exceeds the funded estimate or is invalid.");
    return { ...item, authorizedIncurredCosts: [...item.authorizedIncurredCosts, { id: `cost-${crypto.randomUUID()}`, estimateVersionId, description: input.description.trim(), amountCents: input.amountCents, currency: "USD", authorizedBy: input.authorizedBy.trim(), recordedAt: now }] };
  });
}

export function refundUnspentAdvance(data: DemoData, caseId: string, estimateVersionId: string, now: string): DemoData {
  return updateCase(data, caseId, (item) => {
    estimateById(item, estimateVersionId);
    if (getEstimateDecision(item, estimateVersionId)?.outcome !== "declined") throw new Error("A declined estimate is required before refunding unspent advance.");
    if (item.estimateRefunds.some((refund) => refund.estimateVersionId === estimateVersionId)) throw new Error("The simulated refund is already recorded.");
    const fundedCents = getSuccessfulAdvanceTotal(item, estimateVersionId) + item.advanceCreditAllocations.filter((allocation) => allocation.estimateVersionId === estimateVersionId).reduce((total, allocation) => total + allocation.amountCents, 0);
    const authorizedIncurredCents = item.authorizedIncurredCosts.filter((cost) => cost.estimateVersionId === estimateVersionId).reduce((total, cost) => total + cost.amountCents, 0);
    return { ...item, estimateRefunds: [...item.estimateRefunds, { id: `refund-${crypto.randomUUID()}`, estimateVersionId, fundedCents, authorizedIncurredCents, unspentCents: Math.max(0, fundedCents - authorizedIncurredCents), currency: "USD", processedAt: now, simulated: true }] };
  });
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
    if (payment.purpose === "repair-advance") {
      const estimate = getCurrentEstimate(item);
      if (!estimate || payment.estimateVersionId !== estimate.id) throw new Error("Repair advance must name the current estimate version.");
      if (getEstimateDecision(item, estimate.id)?.outcome !== "approved") throw new Error("Current estimate approval is required before repair funding.");
      const expectedAmount = getOutstandingAdvance(item, estimate.id);
      if (expectedAmount <= 0 || payment.amountCents !== expectedAmount || payment.currency !== estimate.currency) throw new Error("Repair advance must match the current estimate amount still due.");
      if (item.payments.some((attempt) => attempt.id === payment.id)) throw new Error("That payment attempt already exists.");
      return { ...item, payments: [...item.payments, payment] };
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
