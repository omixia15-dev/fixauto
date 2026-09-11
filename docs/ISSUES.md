# Demonstration backlog

Local work items derived from the confirmed plan. No external issues or PRs have been created. Implementation is a later task; this request covers documentation and the knowledge graph.

Use the class loop: issue → plan → Skeptic → code → proof → PR review. A simulated permission check is only UI/workflow proof; real authorization is a separate paid-launch task.

## D1 — Sample case foundation

Story: As a student, I want to revisit the same sample case from customer and staff views so I can explain the complete service journey.

Acceptance criteria:

1. All three screens use the same case record; changes appear when switching views in the same browser.
2. Cases survive refresh; a clearly labeled reset restores sample data without touching real systems.
3. Interface is English; all sample money explicitly USD; interface strings and currency are separate from workflow rules.
4. Simulated identities, payment outcomes and SMS logs are clearly labeled; no real messages or charges occur.
5. Responsive layouts support the three [wireframes](WIREFRAMES.md) and keyboard operation.

Dependency: implementation plan and environment check. Proposed storage: browser-local sample records, not multi-device synchronization.

## D2 — Request and initial assessment

Story: As a customer, I want to request an expert visit and understand its charge before committing.

Acceptance criteria:

1. Request includes contact, make/model/year, symptoms, preferred time and visit address, without initial document upload/account requirement.
2. Missing required values show field-specific messages and preserve input; submission is pending staff confirmation.
3. Simulated identity and assessment authorization/payment precede expert visit; failed payment does not mark paid.
4. Staff records initial assessment and whether deeper separately approved workshop investigation is needed.
5. Declining further work preserves assessment and payment history; assessment fee remains owed under agreed scope.

Dependency: D1. Demo fees must be labeled illustrative, not actual pilot prices.

## D3 — Custody and emergency intake

Story: As a coordinator, I want to record transport and custody so each vehicle has an accountable receiver.

Acceptance criteria:

1. Transport/storage scope and charges require approval and successful simulated payment before dispatch.
2. Thursday/Friday new-customer exception clearly states private parking and Saturday assessment; diagnosis payment remains separate.
3. Receiver assignment and vehicle-condition/key handover are recorded; family receiver role cannot approve repair spending.
4. One active car, including parked cars, prevents a second simulated collection until return frees the slot.
5. Driving/towing decision records qualified input when needed; unresolved uncertainty takes the tow path.

Dependency: D1–D2.

## D4 — Estimate and repair approval

Story: As a customer, I want to approve the exact repair scope and cost before Fixauto commits funds.

Acceptance criteria:

1. Estimate separates parts, labor and management fee; parts include brand, condition and warranty.
2. Approval references the exact estimate version; changed parts or extra costs invalidate approval for the revised work.
3. Failed advance payment or a declined/unanswered estimate does not permit approved/funded repair progression.
4. A 24-hour unanswered-estimate reminder can be demonstrated without waiting a real day; it does not trigger fees or approval.
5. Rejection retains history and supports an illustrative refund of unspent funds after only authorized incurred costs.

Dependency: D1–D3.

## D5 — Quality, settlement and return

Story: As a customer, I want proof of completed work and clear records when my vehicle is returned.

Acceptance criteria:

1. Failed quality check keeps case open with reassessment; pass is required for completed-repair path.
2. Final simulated payment success gates release; failed payment leaves outstanding balance.
3. Invoice/warranty records identify approved work; sample warranty terms are clearly illustrative.
4. Return identifies owner/authorized recipient and records condition, mileage and keys; receipt does not waive complaint handling.
5. Complaint reopens review history; second specialist assessment records prior approval for any charge.

Dependency: D4.

## D6 — Daily summary and scenario proof

Story: As a coordinator, I want short useful daily summaries and reproducible scenarios so I can demonstrate what Fixauto promises.

Acceptance criteria:

1. Simulated SMS log contains situation, next action and expected timing, including nonworking days in custody.
2. Summaries are distinct from consent and do not authorize repairs.
3. A complete request-to-return sample journey works across customer/staff views and survives refresh.
4. Rejected estimate, failed payment, revised approval and failed quality check are all demonstrated with expected outcomes recorded.
5. Build and browser checks pass; review confirms expected files only, no unrelated deletion or secrets, and the implementation matches its agreed plan.

Dependency: D1–D5. Publish or merge only within subsequent user authorization.
