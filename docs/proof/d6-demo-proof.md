# D6 reproducible demo proof

This document describes the checked-in, same-browser simulation. Observed local validation is recorded in `docs/DEMO-PROOF.md`; this remains evidence for the demo workflow, not a production or Preview deployment claim.

## Reproduce

1. Run `npm run dev` and open the service request screen.
2. Create an expert-visit request, open the customer case, then switch to Staff workspace.
3. Confirm the appointment; on Customer case authorize and successfully pay the assessment; on Staff workspace record an assessment with no deeper investigation.
4. Publish estimate v1; on Customer case record a failed or canceled advance, verify the case remains blocked, then approve and successfully fund it.
5. Publish estimate v2 from Staff workspace. Refresh both routes and verify v2 requires fresh approval; v1 approval/funding remains history only. Record a simulated unanswered reminder and verify it does not authorize work.
6. Record performed work, a failed quality check, corrective work, and a passing reassessment. Record settlement and the owner/authorized-recipient return. Issue the illustrative invoice and warranty; these remain sample records.
7. Use a collection-request case to occupy the one-car capacity, then create a second collection case and verify dispatch is blocked until the first vehicle is returned.
8. Use the Staff workspace daily-summary form on a non-working day while a vehicle is held. Verify the same simulated SMS entry appears on the Customer case. Refresh; the entry remains. Use Reset sample data; generated cases and summaries are removed.

## Automated evidence

- `tests/estimate-repair.test.ts`: failed/revised/unanswered estimate and exact-version funding gates.
- `tests/quality-return.test.ts`: failed quality, reassessment, settlement, return, invoice/warranty records, and zero-balance payment guard.
- `tests/request-assessment.test.ts` and `tests/transport-custody.test.ts`: prior assessment, payment, custody, and occupied-capacity safeguards.
- `tests/storage.test.ts`: v1–v5 migration into schema v6 while preserving stored history.
- `tests/daily-summary.test.ts`: append-only state isolation, non-working-day acceptance, and invalid-date rejection.
- `e2e/d1-foundation.spec.ts`, `e2e/d2-request-assessment.spec.ts`, `e2e/d3-custody.spec.ts`, `e2e/d4-estimate.spec.ts`, `e2e/d5-quality-return.spec.ts`: browser persistence and workflow scenarios.
- `e2e/d6-summary.spec.ts`: shared staff/customer rendering, refresh persistence, and reset removal for a simulated summary.

Validation commands: `npm test`, `npm run typecheck`, `npm run lint`, and `npm run test:e2e`.

No real SMS provider, payment gateway, booking, analytics, deployment, or production authorization is used.
