# Case screen brief

Approved 2026-10-09: Option A, split-view workbench.
Approved comp: [case-option-a.png](../.impeccable/mocks/case-option-a.png)
Alternatives: [case-option-b.png](../.impeccable/mocks/case-option-b.png), [case-option-c.png](../.impeccable/mocks/case-option-c.png)

## Scope and visual direction
The home page links to the customer overview at /case; its gold action opens /case/new, which reuses the existing request form. The overview shows five synthetic cases, search and selection, status, symptoms, next step, activity, and loading, empty, error, and success states. It links to the existing detailed case at /cases/[caseId] and staff demo at /staff.

Apply the approved Fixauto Journey atlas identity to these two new customer surfaces: cobalt navigation, gold primary action, navy text, pale work surfaces, and Alexandria type. Keep the established green presentation of /cases/[caseId] and /staff. DESIGN.md now exists as the identity reference; this brief records only the approved extension to the new routes.

The flow is home → inspect a sample → request help → receive a sample reference → follow the case. A submitted request remains pending staff appointment confirmation. The English/USD demo uses same-browser persistence; it has no real account, booking, payment, SMS, or provider integration.

## Seeded sample labels
| Reference | Vehicle | Year |
| --- | --- | ---: |
| FXA-1001 | Toyota Camry | 2020 |
| FXA-1002 | Hyundai Tucson | 2023 |
| FXA-1003 | Kia Sportage | 2022 |
| FXA-1004 | Nissan Qashqai | 2021 |
| FXA-1005 | Mazda 3 | 2020 |

These records, dates, customer details, events, and status histories are fictional demo data. Status is presented from the sample domain record; customers do not set it. The sedan art is a generated, generic illustration, not a customer vehicle; its provenance is in [case-sedan-provenance.json](../.impeccable/case-sedan-provenance.json).

## Approval and verification
The approved comp is a preview, not the implemented screen. Local review captures are in [docs/proof/cases-page-local.md](proof/cases-page-local.md) and .impeccable/review/: desktop.png, mobile.png, empty.png, error.png, loading.png, success.png, request-success.png, request-mobile.png, and legacy-error.png.

Four material findings from independent review were addressed: duplicate notice, conflicting storage label, confirmed-status tone, and reset write-test. The independent reviewer verified that all four targeted findings are resolved; local user approval remains pending. Impeccable phase tracking was unavailable because the Windows UNC launcher reported cache_directory_failed; direct local QA evidence is recorded separately.
