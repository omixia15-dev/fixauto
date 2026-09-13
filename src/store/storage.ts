import { cloneInitialDemoData } from "../demo-data/sample-data.ts";
import {
  createPendingAssessment,
  createPendingTransport,
  createEmptyEstimateState,
  DEMO_SCHEMA_VERSION,
  type DemoData,
  type SampleCase,
} from "../domain/sample-case.ts";

export const DEMO_STORAGE_KEY = "fixauto.demo.sample-cases";
export const LEGACY_STORAGE_KEY = "fixauto.demo.sample-cases.v1";

export type StorageAdapter = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isPayment(value: unknown, requireEstimateVersion = true): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    (value.purpose === "assessment" || value.purpose === "investigation" || value.purpose === "transport-storage" || value.purpose === "repair-advance") &&
    typeof value.label === "string" &&
    typeof value.amountCents === "number" &&
    value.currency === "USD" &&
    (value.outcome === "simulated-success" || value.outcome === "simulated-failed" || value.outcome === "simulated-canceled") &&
    typeof value.attemptedAt === "string" &&
    (!requireEstimateVersion || value.estimateVersionId === null || typeof value.estimateVersionId === "string")
  );
}

function isLegacyPayment(value: unknown): boolean {
  return isPayment(value, false);
}

function isEstimate(value: unknown): boolean {
  if (!isRecord(value) || !Array.isArray(value.lines)) return false;
  return typeof value.id === "string" && typeof value.version === "number" && typeof value.expectedTiming === "string" && typeof value.totalCents === "number" && value.currency === "USD" && typeof value.publishedAt === "string" && typeof value.publishedBy === "string" && value.lines.every((line) => {
    if (!isRecord(line)) return false;
    const validPart = line.part === undefined || (isRecord(line.part) && typeof line.part.brand === "string" && (line.part.condition === "new" || line.part.condition === "used" || line.part.condition === "remanufactured") && typeof line.part.warranty === "string");
    return typeof line.id === "string" && (line.category === "part" || line.category === "labor" || line.category === "management-fee") && typeof line.description === "string" && typeof line.quantity === "number" && typeof line.unitPriceCents === "number" && typeof line.totalCents === "number" && line.currency === "USD" && validPart;
  });
}

function isEstimateDecision(value: unknown): boolean {
  return isRecord(value) && typeof value.id === "string" && typeof value.estimateVersionId === "string" && (value.outcome === "approved" || value.outcome === "declined") && typeof value.authorizer === "string" && (value.reason === null || typeof value.reason === "string") && typeof value.decidedAt === "string";
}

function isEstimateReminder(value: unknown): boolean {
  return isRecord(value) && typeof value.id === "string" && typeof value.estimateVersionId === "string" && typeof value.reminderAt === "string" && value.simulated === true;
}

function isAdvanceCreditAllocation(value: unknown): boolean {
  return isRecord(value) && typeof value.id === "string" && typeof value.estimateVersionId === "string" && typeof value.amountCents === "number" && value.currency === "USD" && typeof value.allocatedAt === "string";
}

function isAuthorizedIncurredCost(value: unknown): boolean {
  return isRecord(value) && typeof value.id === "string" && typeof value.estimateVersionId === "string" && typeof value.description === "string" && typeof value.amountCents === "number" && value.currency === "USD" && typeof value.authorizedBy === "string" && typeof value.recordedAt === "string";
}

function isEstimateRefund(value: unknown): boolean {
  return isRecord(value) && typeof value.id === "string" && typeof value.estimateVersionId === "string" && typeof value.fundedCents === "number" && typeof value.authorizedIncurredCents === "number" && typeof value.unspentCents === "number" && value.currency === "USD" && typeof value.processedAt === "string" && value.simulated === true;
}

function isD5Record(value: unknown): boolean {
  return isRecord(value) && typeof value.id === "string" && typeof value.estimateVersionId === "string";
}

function isTransport(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.qualifiedDecision) && value.qualifiedDecision !== null || !isRecord(value.receiver) && value.receiver !== null || !isRecord(value.handover) && value.handover !== null) return false;
  const decision = value.qualifiedDecision;
  const receiver = value.receiver;
  const handover = value.handover;
  const validDecision = decision === null || (
    typeof decision.qualifiedInputName === "string" &&
    (decision.suitability === "drive-suitable" || decision.suitability === "tow-required" || decision.suitability === "uncertain") &&
    (decision.path === "drive" || decision.path === "tow") &&
    typeof decision.rationale === "string" &&
    typeof decision.recordedAt === "string"
  );
  const validReceiver = receiver === null || (
    typeof receiver.name === "string" &&
    (receiver.relation === "customer" || receiver.relation === "brother-in-law" || receiver.relation === "father") &&
    receiver.authority === "custody-only" &&
    typeof receiver.assignedAt === "string" &&
    typeof receiver.assignedBy === "string"
  );
  const validHandover = handover === null || (
    typeof handover.receiverName === "string" &&
    typeof handover.condition === "string" &&
    typeof handover.mileage === "number" &&
    typeof handover.keys === "string" &&
    typeof handover.destination === "string" &&
    typeof handover.receivedAt === "string"
  );
  return (
    (value.kind === "not-required" || value.kind === "standard-collection" || value.kind === "private-parking-exception") &&
    typeof value.scope === "string" &&
    typeof value.destination === "string" &&
    typeof value.transportFeeCents === "number" &&
    typeof value.storageFeeCents === "number" &&
    value.currency === "USD" &&
    isNullableString(value.authorizedAt) &&
    isNullableString(value.authorizer) &&
    validDecision && validReceiver && validHandover &&
    isNullableString(value.dispatchedAt) &&
    isNullableString(value.returnedAt) &&
    isNullableString(value.assessmentEarliestDate) &&
    (value.activity === "idle" || value.activity === "custody")
  );
}

function isSms(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.situation === "string" &&
    typeof value.nextAction === "string" &&
    typeof value.expectedTiming === "string" &&
    value.simulated === true
  );
}

function isSampleCase(value: unknown): value is SampleCase {
  if (!isRecord(value) || !isRecord(value.customer) || !isRecord(value.vehicle)) return false;
  if (!isRecord(value.request) || !isRecord(value.assessment)) return false;
  if (!isRecord(value.assessment.investigation)) return false;
  if (!isTransport(value.transport)) return false;
  const confirmation = value.request.confirmedAppointment;
  const validConfirmation = confirmation === null || (
    isRecord(confirmation) &&
    typeof confirmation.date === "string" &&
    typeof confirmation.time === "string" &&
    typeof confirmation.coordinator === "string" &&
    typeof confirmation.confirmedAt === "string"
  );
  return (
    typeof value.id === "string" &&
    typeof value.reference === "string" &&
    typeof value.customer.name === "string" &&
    typeof value.customer.mobile === "string" &&
    typeof value.vehicle.make === "string" &&
    typeof value.vehicle.model === "string" &&
    typeof value.vehicle.year === "number" &&
    (value.request.source === "web" || value.request.source === "sample") &&
    (value.request.serviceMode === "expert-visit" || value.request.serviceMode === "collection-request" || value.request.serviceMode === "office-dropoff") &&
    typeof value.request.preferredDate === "string" &&
    typeof value.request.preferredTime === "string" &&
    typeof value.request.symptoms === "string" &&
    typeof value.request.visitAddress === "string" &&
    typeof value.request.createdAt === "string" &&
    validConfirmation &&
    typeof value.assessment.scope === "string" &&
    typeof value.assessment.feeCents === "number" &&
    value.assessment.currency === "USD" &&
    isNullableString(value.assessment.authorizedAt) &&
    isNullableString(value.assessment.authorizer) &&
    isNullableString(value.assessment.performedAt) &&
    isNullableString(value.assessment.expertName) &&
    isNullableString(value.assessment.findings) &&
    (value.assessment.needsInvestigation === null || typeof value.assessment.needsInvestigation === "boolean") &&
    typeof value.assessment.feeEarned === "boolean" &&
    isNullableString(value.assessment.furtherServiceDeclinedAt) &&
    typeof value.assessment.investigation.scope === "string" &&
    typeof value.assessment.investigation.feeCents === "number" &&
    value.assessment.investigation.currency === "USD" &&
    isNullableString(value.assessment.investigation.authorizedAt) &&
    isNullableString(value.assessment.investigation.authorizer) &&
    typeof value.sharedNote === "string" &&
    Array.isArray(value.payments) &&
    value.payments.every((payment) => isPayment(payment)) &&
    Array.isArray(value.smsLog) &&
    value.smsLog.every(isSms)
    && Array.isArray(value.estimates) && value.estimates.every(isEstimate)
    && Array.isArray(value.estimateDecisions) && value.estimateDecisions.every(isEstimateDecision)
    && Array.isArray(value.estimateReminders) && value.estimateReminders.every(isEstimateReminder)
    && Array.isArray(value.advanceCreditAllocations) && value.advanceCreditAllocations.every(isAdvanceCreditAllocation)
    && Array.isArray(value.authorizedIncurredCosts) && value.authorizedIncurredCosts.every(isAuthorizedIncurredCost)
    && Array.isArray(value.estimateRefunds) && value.estimateRefunds.every(isEstimateRefund)
    && Array.isArray(value.performedWork) && value.performedWork.every(isD5Record)
    && Array.isArray(value.qualityChecks) && value.qualityChecks.every(isD5Record)
    && Array.isArray(value.settlements) && value.settlements.every(isD5Record)
    && Array.isArray(value.finalPayments) && value.finalPayments.every(isD5Record)
    && Array.isArray(value.invoices) && value.invoices.every(isD5Record)
    && Array.isArray(value.warranties) && value.warranties.every(isD5Record)
    && Array.isArray(value.returns) && value.returns.every(isD5Record)
    && Array.isArray(value.complaints) && value.complaints.every(isD5Record)
  );
}

function isDemoData(value: unknown): value is DemoData {
  if (!isRecord(value)) return false;
  return (
    value.schemaVersion === DEMO_SCHEMA_VERSION &&
    Array.isArray(value.cases) &&
    value.cases.length > 0 &&
    value.cases.every(isSampleCase)
  );
}

function migrateVersionOne(value: unknown): DemoData | null {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.cases)) return null;

  const migratedCases = value.cases.flatMap((legacy): SampleCase[] => {
    if (!isRecord(legacy) || !isRecord(legacy.customer) || !isRecord(legacy.vehicle)) return [];
    if (!isRecord(legacy.request)) return [];
    if (
      typeof legacy.id !== "string" ||
      typeof legacy.reference !== "string" ||
      typeof legacy.customer.name !== "string" ||
      typeof legacy.customer.mobile !== "string" ||
      typeof legacy.vehicle.make !== "string" ||
      typeof legacy.vehicle.model !== "string" ||
      typeof legacy.vehicle.year !== "number" ||
      typeof legacy.request.symptoms !== "string"
    ) return [];

    return [{
      id: legacy.id,
      reference: legacy.reference,
      customer: { name: legacy.customer.name, mobile: legacy.customer.mobile },
      vehicle: { make: legacy.vehicle.make, model: legacy.vehicle.model, year: legacy.vehicle.year },
      request: {
        source: "sample",
        serviceMode: "expert-visit",
        symptoms: legacy.request.symptoms,
        preferredDate: "2027-01-10",
        preferredTime: "10:00",
        visitAddress: typeof legacy.request.visitAddress === "string"
          ? legacy.request.visitAddress
          : "Sample address, Kerman",
        createdAt: "2026-09-12T09:00:00.000Z",
        confirmedAppointment: null,
      },
      assessment: createPendingAssessment(),
      transport: createPendingTransport({ schemaVersion: DEMO_SCHEMA_VERSION, cases: [] }, {
        mobile: legacy.customer.mobile,
        preferredDate: "2027-01-10",
        serviceMode: "expert-visit",
      }),
      ...createEmptyEstimateState(),
      sharedNote: typeof legacy.sharedNote === "string" ? legacy.sharedNote : "Migrated D1 sample case.",
      payments: [],
      smsLog: Array.isArray(legacy.smsLog) ? legacy.smsLog as SampleCase["smsLog"] : [],
    }];
  });

  return migratedCases.length > 0
    ? { schemaVersion: DEMO_SCHEMA_VERSION, cases: migratedCases }
    : null;
}

function migrateVersionTwo(value: unknown): DemoData | null {
  if (!isRecord(value) || value.schemaVersion !== 2 || !Array.isArray(value.cases)) return null;
  const migratedCases = value.cases.flatMap((legacy): SampleCase[] => {
    if (!isRecord(legacy) || !isRecord(legacy.request)) return [];
    if (!isRecord(legacy.customer) || !isRecord(legacy.vehicle) || !isRecord(legacy.assessment)) return [];
    if (!isRecord(legacy.assessment.investigation)) return [];
    if (typeof legacy.id !== "string" || typeof legacy.reference !== "string" || typeof legacy.customer.name !== "string" || typeof legacy.customer.mobile !== "string" || typeof legacy.vehicle.make !== "string" || typeof legacy.vehicle.model !== "string" || typeof legacy.vehicle.year !== "number") return [];
    if (!Array.isArray(legacy.payments) || !legacy.payments.every(isLegacyPayment) || !Array.isArray(legacy.smsLog) || !legacy.smsLog.every(isSms)) return [];
    const mode = legacy.request.serviceMode === "collection-request" || legacy.request.serviceMode === "office-dropoff" ? legacy.request.serviceMode : "expert-visit";
    const input = {
      mobile: legacy.customer.mobile,
      preferredDate: typeof legacy.request.preferredDate === "string" ? legacy.request.preferredDate : "2027-01-10",
      serviceMode: mode,
    } as const;
    return [{ ...legacy, request: { ...legacy.request, serviceMode: mode }, transport: createPendingTransport({ schemaVersion: DEMO_SCHEMA_VERSION, cases: [] }, input), ...createEmptyEstimateState(), payments: legacy.payments.map((payment) => ({ ...payment, estimateVersionId: null })) } as SampleCase];
  });
  return migratedCases.length > 0 ? { schemaVersion: DEMO_SCHEMA_VERSION, cases: migratedCases } : null;
}

function migrateVersionThree(value: unknown): DemoData | null {
  if (!isRecord(value) || value.schemaVersion !== 3 || !Array.isArray(value.cases)) return null;
  const migratedCases = value.cases.flatMap((legacy): SampleCase[] => {
    if (!isRecord(legacy) || !isRecord(legacy.transport) || !Array.isArray(legacy.payments) || !legacy.payments.every(isLegacyPayment)) return [];
    if (!isTransport(legacy.transport)) return [];
    return [{ ...legacy, ...createEmptyEstimateState(), payments: legacy.payments.map((payment) => ({ ...payment, estimateVersionId: null })) } as SampleCase];
  });
  return migratedCases.length > 0 ? { schemaVersion: DEMO_SCHEMA_VERSION, cases: migratedCases } : null;
}

function migrateVersionFour(value: unknown): DemoData | null {
  if (!isRecord(value) || value.schemaVersion !== 4 || !Array.isArray(value.cases)) return null;
  const migratedCases = value.cases.flatMap((legacy): SampleCase[] => {
    if (!isRecord(legacy) || !isSampleCase({ ...legacy, performedWork: [], qualityChecks: [], settlements: [], finalPayments: [], invoices: [], warranties: [], returns: [], complaints: [] })) return [];
    return [{ ...(legacy as Record<string, unknown>), performedWork: [], qualityChecks: [], settlements: [], finalPayments: [], invoices: [], warranties: [], returns: [], complaints: [] } as unknown as SampleCase];
  });
  return migratedCases.length > 0 ? { schemaVersion: DEMO_SCHEMA_VERSION, cases: migratedCases } : null;
}

function parseStored(stored: string): DemoData | null {
  try {
    const parsed: unknown = JSON.parse(stored);
    return isDemoData(parsed) ? parsed : migrateVersionFour(parsed) ?? migrateVersionThree(parsed) ?? migrateVersionTwo(parsed) ?? migrateVersionOne(parsed);
  } catch {
    return null;
  }
}

export function loadDemoData(storage: StorageAdapter): DemoData {
  const current = storage.getItem(DEMO_STORAGE_KEY);
  if (current) return parseStored(current) ?? cloneInitialDemoData();
  const legacy = storage.getItem(LEGACY_STORAGE_KEY);
  return legacy ? parseStored(legacy) ?? cloneInitialDemoData() : cloneInitialDemoData();
}

export function saveDemoData(storage: StorageAdapter, data: DemoData): void {
  storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
}

export function resetDemoData(storage: StorageAdapter): DemoData {
  const freshData = cloneInitialDemoData();
  storage.removeItem(DEMO_STORAGE_KEY);
  storage.removeItem(LEGACY_STORAGE_KEY);
  saveDemoData(storage, freshData);
  return freshData;
}
