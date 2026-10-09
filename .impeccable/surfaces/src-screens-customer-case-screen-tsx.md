---
version: 1
slug: "src-screens-customer-case-screen-tsx"
primary_target: "src/screens/customer-case-screen.tsx"
related_targets: ["app/cases/[caseId]/layout.tsx","src/screens/customer-case-screen.module.css"]
---

# Customer case dossier — issue #22

Mode: Operate. User approved the plan and selected Option C on 2026-10-09.
Target: `/cases/[caseId]`; approved composition: `.impeccable/mocks/customer-option-c.png`.

The customer reads the current case, reviews disclosed scope, records simulated consent/payment, and accesses saved records. Inherit the current home/cases identity and the existing cases shell. Keep all approval, payment, custody, quality and persistence rules. The overview links to the full scope; the single approval action remains beside the estimate. Section links navigate visible content, with no invented editing, menus or account features. Use real saved sample data; mock dates and extra controls are provisional. Reuse the existing sedan and label it illustrative.

## Direction contract

THESIS: A case dossier makes the current decision and supporting evidence easy to find, replacing the undifferentiated legacy stack.

OWN-WORLD: Alexandria, cobalt navigation, pale cool ground, white document panels, navy text and gold decisions; inherit `/case` components.

STORY: Identify the vehicle and status, review the exact estimate and timing, act, then read payment and case records.

FIRST VIEWPORT: Wide identity header, section links, main overview/document column and narrower facts/next-step column. On phones, current state leads a single reading column. Only the estimate section authorizes its version.

FORM: User-pinned Option C, case dossier; key `issue-22-customer-workspace`. Operate guidance makes this semantic code-led UI; the approved desktop/mobile comp is the composition reference. Reuse the established illustration rather than generating a new vehicle.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Acceptance

- Match current cases/home palette, typography and navigation at desktop and phone widths.
- All sections have real destinations and readable loading, missing-case, storage-error and action-error states.
- Preserve exact-version approval, declined work, failed/canceled payment, investigation and transport separation, quality gates and refresh persistence.
- Keep all records and simulation limitations visible; remove stale claims that shipped records are future work.
- Prove the flows with unit checks and Playwright, capture desktop/mobile and report bugs/recommendations in the PR.

No production merge, real payments, bookings or operational launch are authorized by this work.
