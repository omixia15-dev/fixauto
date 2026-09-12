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

export const initialDemoData: DemoData = {
  schemaVersion: DEMO_SCHEMA_VERSION,
  cases: [
    {
      id: "case-atlas-001",
      reference: "FXA-1001",
      customer: {
        name: "Mina Rahimi",
        mobile: "+98 900 000 0101",
      },
      vehicle: {
        make: "Toyota",
        model: "Camry",
        year: 2020,
      },
      request: {
        symptoms: "A warning light appears after the engine warms up.",
        preferredAppointment: "Sunday, 10:00",
        visitAddress: "Sample address, Kerman",
      },
      status: "request-received",
      statusLabel: "Request received — awaiting staff confirmation",
      nextAction: "Staff reviews the requested appointment.",
      expectedTiming: "During the next staffed period",
      sharedNote: "Customer prefers a morning expert visit.",
      illustrativeAssessmentFeeCents: 4500,
      currency: "USD",
      payments: [
        {
          id: "payment-sample-001",
          purpose: "Illustrative assessment fee",
          amountCents: 4500,
          currency: "USD",
          outcome: "simulated-pending",
        },
      ],
      smsLog: [
        {
          id: "sms-sample-001",
          situation: "The sample request has been received.",
          nextAction: "Staff will confirm an appointment.",
          expectedTiming: "During the next staffed period",
          simulated: true,
        },
      ],
    },
  ],
};

export function cloneInitialDemoData(): DemoData {
  return JSON.parse(JSON.stringify(initialDemoData)) as DemoData;
}

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

