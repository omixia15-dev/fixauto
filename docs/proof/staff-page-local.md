# Staff page local proof — issue #23

Approved direction: Option C, selected on 2026-10-09. Branch codex/staff-redesign starts from main. Existing customer-page work remains in the original checkout.

## Checks

- Production build and independent strict typecheck passed.
- Unit tests: 39 passed.
- Complete Playwright suite: 20 passed, including six staff-specific tests and D1–D6 workflow coverage.
- Scoped ESLint: zero findings. Full lint: zero errors and four existing review-helper warnings.
- Impeccable Linux detector: zero findings.
- Desktop 1440px and mobile 390px full-page captures reviewed. Browser tests also cover 320px and 768px. Final capture had no horizontal overflow or page errors.

The default local Playwright server runner stalled. The suite used a dedicated production server and committed alternate config:

```sh
npm run build
npm run start -- --port 3143 --hostname 0.0.0.0
npx playwright test --config .impeccable/review/staff-e2e.config.ts --workers 4
```

## Review evidence

[Approved C comp](../../.impeccable/mocks/staff-option-c.png), [desktop capture](../../.impeccable/review/staff-desktop.png), [mobile capture](../../.impeccable/review/staff-mobile.png).

Independent review identified three visible corrections, applied before the final rebuild: highlight Staff workspace in navigation, avoid claiming an appointment hold in the default summary, and show the pending appointment milestone in activity. Final tests and captures use that rebuilt version.

The native selector and editable summary preserve staff behavior where the generated comp depicts search and read-only tiles. Domain, store, payment, consent, capacity, quality and release rules are unchanged.

## Limits

No automated Impeccable comp-phase state or pixel-diff certificate was generated after the Windows launcher failure. Manual visual evidence and the successful Linux detector are available. Production deployment and merging are left to the user. Existing favicon/preload console warnings remain; no page errors occurred in the final capture.
## Conflict resolution — 2026-10-10

Merged main at `0dca1d3` into the staff branch after approval. Reconciled six conflict files: DESIGN.md, AppShell, and D1/D2/D3/D6 tests. AppShell recognizes both customer and staff workspaces. Documentation preserves both approved compositions. Tests use the current customer dossier and staff controls while retaining authorization, capacity, reset, persistence and non-working-day coverage; auto-merged D4/D5 and staff-specific tests were also reviewed.

Production build, strict typecheck, 39 unit tests and all 29 E2E tests passed. Full lint had zero errors; review-helper warnings remain. Two D3 tests were rerun after adding explicit pre-transport capacity and pre-repair return assertions.

Final browser captures waited for font and image loading. Both surfaces showed no horizontal overflow, old global navigation or page errors at 390px and 1440px. The E2E suite also checks 320px and 768px.

- [Staff mobile](../../.impeccable/review/merge-staff-390.png)
- [Staff desktop](../../.impeccable/review/merge-staff-1440.png)
- [Customer mobile](../../.impeccable/review/merge-customer-390.png)
- [Customer desktop](../../.impeccable/review/merge-customer-1440.png)

Existing Vercel login protection and absent automated comp-diff evidence are unchanged. This resolution does not merge the PR into main.
