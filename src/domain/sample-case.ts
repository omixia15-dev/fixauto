export const DEMO_SCHEMA_VERSION = 1 as const;

export type CurrencyCode = "USD";

export type SimulatedPayment = {
  id: string;
  purpose: string;
  amountCents: number;
  currency: CurrencyCode;
  outcome: "simulated-success" | "simulated-failed" | "simulated-pending";
};

export type SimulatedSms = {
  id: string;
  situation: string;
  nextAction: string;
  expectedTiming: string;
  simulated: true;
};

export type SampleCase = {
  id: string;
  reference: string;
  customer: {
    name: string;
    mobile: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
  request: {
    symptoms: string;
    preferredAppointment: string;
    visitAddress: string;
  };
  status: "request-received";
  statusLabel: string;
  nextAction: string;
  expectedTiming: string;
  sharedNote: string;
  illustrativeAssessmentFeeCents: number;
  currency: CurrencyCode;
  payments: SimulatedPayment[];
  smsLog: SimulatedSms[];
};

export type DemoData = {
  schemaVersion: typeof DEMO_SCHEMA_VERSION;
  cases: SampleCase[];
};

export function findCase(data: DemoData, caseId: string): SampleCase | undefined {
  return data.cases.find((sampleCase) => sampleCase.id === caseId);
}

export function updateSharedNote(
  data: DemoData,
  caseId: string,
  sharedNote: string,
): DemoData {
  const normalizedNote = sharedNote.trim();

  if (normalizedNote.length === 0 || normalizedNote.length > 160) {
    throw new Error("The sample note must contain 1 to 160 characters.");
  }

  if (!findCase(data, caseId)) {
    throw new Error("The sample case could not be found.");
  }

  return {
    ...data,
    cases: data.cases.map((sampleCase) =>
      sampleCase.id === caseId
        ? { ...sampleCase, sharedNote: normalizedNote }
        : sampleCase,
    ),
  };
}
