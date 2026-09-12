import {
  DEMO_SCHEMA_VERSION,
  type DemoData,
} from "../domain/sample-case.ts";

// Fictional English presentation data. Workflow rules do not depend on this copy.
export const initialDemoData: DemoData = {
  schemaVersion: DEMO_SCHEMA_VERSION,
  cases: [
    {
      id: "case-atlas-001",
      reference: "FXA-1001",
      customer: { name: "Mina Rahimi", mobile: "+98 900 000 0101" },
      vehicle: { make: "Toyota", model: "Camry", year: 2020 },
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
