import { cloneInitialDemoData } from "../demo-data/sample-data.ts";
import {
  createPendingAssessment,
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

function isPayment(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    (value.purpose === "assessment" || value.purpose === "investigation") &&
    typeof value.label === "string" &&
    typeof value.amountCents === "number" &&
    value.currency === "USD" &&
    (value.outcome === "simulated-success" || value.outcome === "simulated-failed" || value.outcome === "simulated-canceled") &&
    typeof value.attemptedAt === "string"
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
    value.payments.every(isPayment) &&
    Array.isArray(value.smsLog) &&
    value.smsLog.every(isSms)
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
      sharedNote: typeof legacy.sharedNote === "string" ? legacy.sharedNote : "Migrated D1 sample case.",
      payments: [],
      smsLog: Array.isArray(legacy.smsLog) ? legacy.smsLog as SampleCase["smsLog"] : [],
    }];
  });

  return migratedCases.length > 0
    ? { schemaVersion: DEMO_SCHEMA_VERSION, cases: migratedCases }
    : null;
}

function parseStored(stored: string): DemoData | null {
  try {
    const parsed: unknown = JSON.parse(stored);
    return isDemoData(parsed) ? parsed : migrateVersionOne(parsed);
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
