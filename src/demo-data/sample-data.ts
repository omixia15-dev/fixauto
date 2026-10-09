import {
  approveEstimate,
  authorizeAssessment,
  confirmRequestedAppointment,
  createEmptyEstimateState,
  createPendingAssessment,
  createPendingTransport,
  DEMO_SCHEMA_VERSION,
  getCurrentEstimate,
  publishEstimate,
  recordInitialAssessment,
  recordPaymentAttempt,
  recordPerformedWork,
  recordQualityCheck,
  recordReturn,
  recordSettlement,
  type DemoData,
  type EstimateLineInput,
  type SampleCase,
} from "../domain/sample-case.ts";

const sampleEstimateLines = (caseId: string, partDescription: string): EstimateLineInput[] => [
  {
    id: caseId + "-part",
    category: "part",
    description: partDescription,
    quantity: 1,
    unitPriceCents: 20000,
    part: { brand: "Illustrative sample brand", condition: "new", warranty: "Illustrative sample term" },
  },
  { id: caseId + "-labor", category: "labor", description: "Replacement labor", quantity: 1, unitPriceCents: 15000 },
  { id: caseId + "-coordination", category: "management-fee", description: "Coordination fee", quantity: 1, unitPriceCents: 2500 },
];

type SampleSeedInput = {
  id: string;
  reference: string;
  customerName: string;
  mobile: string;
  make: string;
  model: string;
  year: number;
  symptoms: string;
  preferredDate: string;
  preferredTime: string;
  createdAt: string;
  sharedNote: string;
};

function createSampleCase(input: SampleSeedInput): SampleCase {
  const serviceMode = "office-dropoff" as const;
  return {
    id: input.id,
    reference: input.reference,
    customer: { name: input.customerName, mobile: input.mobile },
    vehicle: { make: input.make, model: input.model, year: input.year },
    request: {
      source: "sample",
      serviceMode,
      symptoms: input.symptoms,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      visitAddress: "",
      createdAt: input.createdAt,
      confirmedAppointment: null,
    },
    assessment: createPendingAssessment(),
    transport: createPendingTransport(
      { schemaVersion: DEMO_SCHEMA_VERSION, cases: [] },
      { mobile: input.mobile, preferredDate: input.preferredDate, serviceMode },
    ),
    ...createEmptyEstimateState(),
    sharedNote: input.sharedNote,
    payments: [],
    smsLog: [],
  };
}

function confirmSampleAppointment(data: DemoData, caseId: string, confirmedAt: string): DemoData {
  return confirmRequestedAppointment(data, caseId, "Sample coordinator", confirmedAt);
}

type AssessmentTimes = {
  confirmedAt: string;
  authorizedAt: string;
  paidAt: string;
  performedAt: string;
};

function completeSampleAssessment(data: DemoData, caseId: string, times: AssessmentTimes): DemoData {
  data = confirmSampleAppointment(data, caseId, times.confirmedAt);
  data = authorizeAssessment(data, caseId, "Simulated customer", times.authorizedAt);
  data = recordPaymentAttempt(data, caseId, {
    id: caseId + "-assessment-payment",
    purpose: "assessment",
    label: "Illustrative assessment fee",
    amountCents: 4500,
    currency: "USD",
    outcome: "simulated-success",
    attemptedAt: times.paidAt,
    estimateVersionId: null,
  });
  return recordInitialAssessment(data, caseId, {
    expertName: "Sample assessment expert",
    findings: "No deeper investigation is required for this illustrative sample.",
    needsInvestigation: false,
  }, times.performedAt);
}

function publishSampleEstimate(data: DemoData, caseId: string, partDescription: string, publishedAt: string): DemoData {
  return publishEstimate(data, caseId, {
    expectedTiming: "3 business days (illustrative)",
    lines: sampleEstimateLines(caseId, partDescription),
  }, "Sample coordinator", publishedAt);
}

type RepairTimes = AssessmentTimes & {
  estimatePublishedAt: string;
  estimateApprovedAt: string;
  advancePaidAt: string;
};

function approveAndFundSampleEstimate(data: DemoData, caseId: string, times: RepairTimes): DemoData {
  const estimate = getCurrentEstimate(data.cases.find((item) => item.id === caseId)!);
  if (!estimate) throw new Error("The sample estimate was not published.");
  data = approveEstimate(data, caseId, estimate.id, "Simulated customer", times.estimateApprovedAt);
  return recordPaymentAttempt(data, caseId, {
    id: caseId + "-repair-advance",
    purpose: "repair-advance",
    label: "Illustrative repair advance",
    amountCents: estimate.totalCents,
    currency: estimate.currency,
    outcome: "simulated-success",
    attemptedAt: times.advancePaidAt,
    estimateVersionId: estimate.id,
  });
}

function normalizeSampleIds(data: DemoData): DemoData {
  return {
    ...data,
    cases: data.cases.map((sampleCase) => ({
      ...sampleCase,
      estimateDecisions: sampleCase.estimateDecisions.map((item, index) => ({ ...item, id: sampleCase.id + "-decision-" + (index + 1) })),
      performedWork: sampleCase.performedWork.map((item, index) => ({ ...item, id: sampleCase.id + "-work-" + (index + 1) })),
      qualityChecks: sampleCase.qualityChecks.map((item, index) => ({ ...item, id: sampleCase.id + "-quality-" + (index + 1) })),
      settlements: sampleCase.settlements.map((item, index) => ({ ...item, id: sampleCase.id + "-settlement-" + (index + 1) })),
      returns: sampleCase.returns.map((item, index) => ({ ...item, id: sampleCase.id + "-return-" + (index + 1) })),
    })),
  };
}

function buildInitialDemoData(): DemoData {
  const cases: SampleCase[] = [
    {
      id: "case-atlas-001",
      reference: "FXA-1001",
      customer: { name: "Mina Rahimi", mobile: "+98 900 000 0101" },
      vehicle: { make: "Toyota", model: "Camry", year: 2020 },
      request: {
        source: "sample",
        serviceMode: "expert-visit",
        symptoms: "A warning light appears after the engine warms up.",
        preferredDate: "2027-01-10",
        preferredTime: "10:00",
        visitAddress: "Sample address, Kerman",
        createdAt: "2026-09-12T09:00:00.000Z",
        confirmedAppointment: null,
      },
      assessment: createPendingAssessment(),
      transport: createPendingTransport({ schemaVersion: DEMO_SCHEMA_VERSION, cases: [] }, {
        mobile: "+98 900 000 0101",
        preferredDate: "2027-01-10",
        serviceMode: "expert-visit",
      }),
      ...createEmptyEstimateState(),
      sharedNote: "Customer prefers a morning expert visit.",
      payments: [],
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
    createSampleCase({
      id: "case-hyundai-002",
      reference: "FXA-1002",
      customerName: "Sara Ahmadi",
      mobile: "+98 900 000 0102",
      make: "Hyundai",
      model: "Tucson",
      year: 2023,
      symptoms: "The air conditioner cools intermittently during longer drives.",
      preferredDate: "2026-10-14",
      preferredTime: "11:00",
      createdAt: "2026-10-08T08:00:00.000Z",
      sharedNote: "Appointment confirmed for office drop-off.",
    }),
    createSampleCase({
      id: "case-kia-003",
      reference: "FXA-1003",
      customerName: "Arash Nouri",
      mobile: "+98 900 000 0103",
      make: "Kia",
      model: "Sportage",
      year: 2022,
      symptoms: "The steering wheel vibrates during moderate braking.",
      preferredDate: "2026-10-06",
      preferredTime: "09:30",
      createdAt: "2026-10-02T07:30:00.000Z",
      sharedNote: "Illustrative estimate ready for customer review.",
    }),
    createSampleCase({
      id: "case-nissan-004",
      reference: "FXA-1004",
      customerName: "Niloofar Karimi",
      mobile: "+98 900 000 0104",
      make: "Nissan",
      model: "Qashqai",
      year: 2021,
      symptoms: "A knocking sound comes from the front suspension on uneven roads.",
      preferredDate: "2026-09-25",
      preferredTime: "10:30",
      createdAt: "2026-09-23T07:30:00.000Z",
      sharedNote: "Approved and funded sample repair is ready for coordination.",
    }),
    createSampleCase({
      id: "case-mazda-005",
      reference: "FXA-1005",
      customerName: "Kaveh Rostami",
      mobile: "+98 900 000 0105",
      make: "Mazda",
      model: "3",
      year: 2020,
      symptoms: "The engine belt squeals briefly when starting in the morning.",
      preferredDate: "2026-09-13",
      preferredTime: "09:00",
      createdAt: "2026-09-11T07:30:00.000Z",
      sharedNote: "Illustrative repair completed and vehicle returned.",
    }),
  ];

  let data: DemoData = { schemaVersion: DEMO_SCHEMA_VERSION, cases };
  data = confirmSampleAppointment(data, "case-hyundai-002", "2026-10-09T08:00:00.000Z");

  data = completeSampleAssessment(data, "case-kia-003", {
    confirmedAt: "2026-10-03T08:00:00.000Z",
    authorizedAt: "2026-10-03T08:05:00.000Z",
    paidAt: "2026-10-03T08:10:00.000Z",
    performedAt: "2026-10-06T08:00:00.000Z",
  });
  data = publishSampleEstimate(data, "case-kia-003", "Front brake pad set", "2026-10-06T10:00:00.000Z");

  const nissanTimes: RepairTimes = {
    confirmedAt: "2026-09-24T08:00:00.000Z",
    authorizedAt: "2026-09-24T08:05:00.000Z",
    paidAt: "2026-09-24T08:10:00.000Z",
    performedAt: "2026-09-25T08:00:00.000Z",
    estimatePublishedAt: "2026-09-25T10:00:00.000Z",
    estimateApprovedAt: "2026-09-26T08:00:00.000Z",
    advancePaidAt: "2026-09-26T08:05:00.000Z",
  };
  data = completeSampleAssessment(data, "case-nissan-004", nissanTimes);
  data = publishSampleEstimate(data, "case-nissan-004", "Front suspension stabilizer link", nissanTimes.estimatePublishedAt);
  data = approveAndFundSampleEstimate(data, "case-nissan-004", nissanTimes);

  const mazdaTimes: RepairTimes & { work: string; quality: string; settlement: string; returnedAt: string } = {
    confirmedAt: "2026-09-12T08:00:00.000Z",
    authorizedAt: "2026-09-12T08:05:00.000Z",
    paidAt: "2026-09-12T08:10:00.000Z",
    performedAt: "2026-09-13T08:00:00.000Z",
    estimatePublishedAt: "2026-09-13T10:00:00.000Z",
    estimateApprovedAt: "2026-09-14T08:00:00.000Z",
    advancePaidAt: "2026-09-14T08:05:00.000Z",
    work: "2026-09-15T08:00:00.000Z",
    quality: "2026-09-16T08:00:00.000Z",
    settlement: "2026-09-17T08:00:00.000Z",
    returnedAt: "2026-09-17T09:00:00.000Z",
  };
  data = completeSampleAssessment(data, "case-mazda-005", mazdaTimes);
  data = publishSampleEstimate(data, "case-mazda-005", "Drive belt tensioner", mazdaTimes.estimatePublishedAt);
  data = approveAndFundSampleEstimate(data, "case-mazda-005", mazdaTimes);
  const mazdaEstimate = getCurrentEstimate(data.cases.find((item) => item.id === "case-mazda-005")!)!;
  data = recordPerformedWork(data, "case-mazda-005", mazdaEstimate.id, "The illustrative belt tensioner repair was completed.", "Sample specialist", mazdaTimes.work);
  data = recordQualityCheck(data, "case-mazda-005", mazdaEstimate.id, {
    specialist: "Sample quality reviewer",
    result: "passed",
    findings: "The illustrative repair passed the sample quality check.",
  }, mazdaTimes.quality);
  data = recordSettlement(data, "case-mazda-005", mazdaEstimate.id, "Sample coordinator", mazdaTimes.settlement);
  data = recordReturn(data, "case-mazda-005", {
    recipientName: "Kaveh Rostami",
    recipientAuthority: "owner",
    authorizationEvidence: null,
    condition: "Vehicle returned in illustrative sample condition.",
    mileage: 68300,
    keys: "Two sample keys returned",
    coordinator: "Sample coordinator",
  }, mazdaTimes.returnedAt);

  return normalizeSampleIds(data);
}

export const initialDemoData = buildInitialDemoData();

export function cloneInitialDemoData(): DemoData {
  return JSON.parse(JSON.stringify(initialDemoData)) as DemoData;
}
