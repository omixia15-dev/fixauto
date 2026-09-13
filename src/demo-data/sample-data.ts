import {
  createPendingAssessment,
  createPendingTransport,
  DEMO_SCHEMA_VERSION,
  type DemoData,
} from "../domain/sample-case.ts";

export const initialDemoData: DemoData = {
  schemaVersion: DEMO_SCHEMA_VERSION,
  cases: [
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
  ],
};

export function cloneInitialDemoData(): DemoData {
  return JSON.parse(JSON.stringify(initialDemoData)) as DemoData;
}
