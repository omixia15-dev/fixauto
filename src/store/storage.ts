import { cloneInitialDemoData } from "../demo-data/sample-data.ts";
import { DEMO_SCHEMA_VERSION, type DemoData } from "../domain/sample-case.ts";

export const DEMO_STORAGE_KEY = "fixauto.demo.sample-cases.v1";

export type StorageAdapter = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function isDemoData(value: unknown): value is DemoData {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<DemoData>;
  if (!(
    candidate.schemaVersion === DEMO_SCHEMA_VERSION &&
    Array.isArray(candidate.cases) &&
    candidate.cases.length > 0
  )) return false;

  return candidate.cases.every((sampleCase) =>
    Boolean(
      sampleCase &&
      typeof sampleCase.id === "string" &&
      typeof sampleCase.reference === "string" &&
      typeof sampleCase.customer?.name === "string" &&
      typeof sampleCase.vehicle?.make === "string" &&
      typeof sampleCase.request?.symptoms === "string" &&
      typeof sampleCase.sharedNote === "string" &&
      sampleCase.currency === "USD" &&
      Array.isArray(sampleCase.payments) &&
      Array.isArray(sampleCase.smsLog),
    ),
  );
}

export function loadDemoData(storage: StorageAdapter): DemoData {
  const stored = storage.getItem(DEMO_STORAGE_KEY);
  if (!stored) return cloneInitialDemoData();

  try {
    const parsed: unknown = JSON.parse(stored);
    return isDemoData(parsed) ? parsed : cloneInitialDemoData();
  } catch {
    return cloneInitialDemoData();
  }
}

export function saveDemoData(storage: StorageAdapter, data: DemoData): void {
  storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
}

export function resetDemoData(storage: StorageAdapter): DemoData {
  const freshData = cloneInitialDemoData();
  storage.removeItem(DEMO_STORAGE_KEY);
  saveDemoData(storage, freshData);
  return freshData;
}
