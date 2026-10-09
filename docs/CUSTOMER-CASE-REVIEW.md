# Customer dossier review — issue #22

User approved Option C on 2026-10-09. The implementation extends the existing cases shell to `/cases/[caseId]`: identity and status, visible section destinations, exact estimate, payments and saved case records. The approved composition is recorded in `CUSTOMER-CASE-BRIEF.md`; saved sample data remains authoritative.

## Bugs and review findings resolved

- The customer route retained the legacy green application shell. It now shares the current cases navigation, Alexandria typography, cobalt, gold and cool-paper surfaces.
- The staff link could open a different sample case. It now carries the viewed case ID, covered by a navigation regression.
- The customer screen offered a call-reminder action that could write a future staff reminder immediately. Removed that customer control; recorded reminder history and domain behavior remain intact. A regression asserts the control is absent.
- Overview lacked its promised estimate link. The next action and link now appear before symptoms on phones; the sole approval control remains beside the itemized scope.
- Narrow-table headers were 9px and amounts wrapped. Headers are now 11px and body text 12px, monetary amounts remain unbroken, and illustrative USD is visibly disclosed.
- The payment badge repeated “simulated”; its label now reads “Simulated · payments.”
- Stale copy described already shipped records and repair execution as future work. It now describes the current saved workflow.
- The customer view now exposes the existing guarded final-payment action when the domain reports an outstanding final balance, and retains final-payment and credit-allocation history.

## Verification

- Production build and strict TypeScript check passed; Next's build skips type checking, so the separate check is required.
- All 39 domain/storage unit tests passed.
- All 19 distinct E2E tests passed across the final 18-pass suite run and the corrected 2-test custody rerun. Tests cover exact-version approval, failed/canceled/successful advance, decline and refresh persistence, investigation and transport payment separation, custody, quality and return gates, daily summaries, missing cases, storage recovery, corrupt data and home behavior.
- Playwright CLI checked customer widths 320, 390, 768, 1024, 1440 and 1920 without page overflow, one approval control, four real keyboard-focusable section links, and pending/completed/missing states. Home, cases, request and staff also fit 390 and 1440. No uncaught page errors were observed.
- Desktop and mobile captures are in `../output/playwright/`; the independent finish review identified the corrections above and rechecked their final captures.
- The design detector ran once. Its 80 color/type/radius entries were advisory; DESIGN.md and its sidecar now document this scoped extension. It was not rerun as a substitute for visual review.

## Recommendations and limits

- The existing staff header Customer case link follows the latest case rather than a different case selected in the staff list. The custody test retains the original customer URL when switching between two requests. Follow up in the staff workspace work; the customer-to-staff link fixed here carries the viewed case ID.
- Prioritize a product decision about first-viewport density on very narrow phones if additional case fields are added; keep the current decision before historical records and keep approval beside its scope.
- The local browser console also reported an existing missing favicon and unused-preload warnings. These did not cause page errors and are separate cleanup work.
- Repository-wide lint has no errors. Existing review helpers and another task's nested worktree produce warnings; none are customer-page changes.
- This is browser-local simulated identity, payments and SMS. No real payment/provider integration, booking, authentication, customer contact, merge or production release was performed.
- Local Chromium evidence does not establish Safari/Firefox behavior, screen-reader behavior or real-provider settlement. The final-balance UI is guarded by the existing domain; the browser suite principally exercises fully prepaid repair flows.

## Final results

Finish verdict: ready for PR. The independent reviewer passed all four UI corrections; its test hold is resolved by the final workflow checks. Production build, strict typecheck, 39 unit tests, 19 distinct E2E tests and scoped source/test lint pass. The full repository lint reported no errors and nine unrelated helper/nested-worktree warnings. The test-only local config used a directly served production build at port 3137; it is not part of the PR. Automatic PR preview status is reported on the PR after creation.
