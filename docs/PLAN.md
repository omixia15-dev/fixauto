# Fixauto consolidated plan

Status: Q1–Q87 reconciled and user confirmation received in “as our grill me process is finished.” Documentation and graph authorized/completed; service-app implementation is a subsequent task. Business choices are accepted; technical choices below are the baseline implementation approach. This plan supersedes stale unresolved statuses in historical interview sections.

## Product brief

Fixauto helps busy car owners in Kerman delegate repair management to one accountable coordinator. Initial outreach focuses on women doctors, makeup artists and lawyers; demand has not yet been validated.

The service covers initial assessment, choosing specialist workshops, approved parts and repair work, transport, quality checks, return and a limited written warranty. Partner competence, coverage and warranty backing still need evidence.

Revenue: a fixed initial assessment fee and transparent management charge alongside parts/workshop costs. Exact fees, percentage, minimum/cap and transport charges await actual cost examples. Assessment remains payable even if further service is declined.

## Normal service journey

1. Request help without an account: contact name/mobile, make/model/year, symptoms and preferred appointment; location for a visit or collection.
2. Verify customer, disclose scope/assessment fee and obtain authorization/payment before visit. Inspect vehicle card at handover; retain no photo for now. Representatives require recorded owner authority.
3. Expert visits first, assesses symptoms and selects appropriate destination to reduce vehicle movements. Deeper workshop investigation is separately approved when required.
4. Decide driving/towing using qualified specialist input; unresolved suitability uncertainty means tow. Obtain separate transport authorization and payment before dispatch.
5. Provide itemized estimate: parts brand/condition/price/warranty, labor, management fee and expected timing. Customer approves version and funds committed costs.
6. Coordinate repair manually. All substitutions and additional spending require fresh approval. After an unanswered estimate, call at 24 hours; silence never authorizes work or adds charges.
7. Use specialist-validated quality checks. A failure keeps case open under coordinator, with reassessment and delay communication.
8. Confirm final settlement, issue invoice/warranty, return to owner or expressly authorized recipient and record condition/mileage/keys. Receipt is separate from warranty resolution.
9. Reopen complaints under the coordinator; owner reviews disputes and arranges second qualified assessment when needed, with any assessment charges agreed beforehand.

Refund principle: return unspent balance, deducting only disclosed/authorized incurred costs. Nonreturnable purchases disclosed before commitment. Processing timelines and unresolved disputes are paid-launch details still open.

Original office drop-off remains a manually scheduled alternative; the primary demo journey is expert-first.

## Thursday–Friday exception

New customers may be collected by tow truck to the user's private parking for assessment Saturday. Inform customer in advance; separate transport/storage authorization and payment before dispatch, assessment payment before assessment.

Assign user, brother-in-law or father as receiver; record condition and keys. Receiving a vehicle gives no repair/spending approval authority. Parked vehicles count toward capacity. Parking suitability and insurance remain unverified.

## Pilot operations

- Saturday–Wednesday: 09:00–13:00 and 17:00–20:00 local time. Active-case urgent support on call; no promised response interval yet.
- Workshop windows separately reported as 09:00–14:00 and 16:30–21:30.
- Daily concise SMS while holding a vehicle, including nonworking days: situation, next action, expected timing. Approval separate from summaries.
- One active car including parked cars for first three paid jobs, then reassess.
- Two-month provisional budget ceiling 300m toman; 100m salaries over two months. Own premises; no rent. Other allocations undecided.
- First paid customer target early October 2026, subject to readiness; elapsed time is not readiness evidence.
- Five paid jobs, all costs/time recorded, zero unauthorized spending, at least four customers willing to return; measure direct job economics. Start through existing contacts before major marketing.

## First build: English/USD demonstration

Accepted: reusable app, Kerman-only operations; English/USD first, Persian and verified local payments before paid launch. Separate strings and business rules, explicit currency per amount, future RTL layout; no automatic currency conversion.

Use sample customers, clearly labeled simulated sign-in/payments/SMS and saved cases that survive refresh. This proves workflow, not production authentication, SMS delivery or payment processing. No real customer documents or charges.

### Three main screens

| Screen | Capabilities |
| --- | --- |
| Service request | Vehicle problem, contact and visit/appointment request |
| Customer case page | Assessment/diagnosis, estimate versions and approvals, simulated payments, summaries, invoice and warranty |
| Staff workspace | Case progression, coordinator/receiver assignment, assessment, transport/handover, parts/estimates, quality checks, return/complaints |

### Five capability groups

Request service; authorize/pay for assessment; approve/fund repairs; settle/access records; manually manage cases. Live tracking and partner self-service accounts excluded.

### Proof required

- Happy journey progresses across customer/staff views and survives refresh.
- Declining an estimate does not begin repair.
- Failed simulated payment does not mark paid or enable a payment-dependent action.
- Changed estimate or substituted part requires renewed approval.
- Failed quality check prevents completed/passed status until reassessment succeeds.
- Parked emergency case occupies capacity; receiver and handover recorded.
- Sample invoice/estimate amounts use explicit USD; actual pilot budget stays in toman.
- Simulations clearly labeled; no real SMS, charges or vehicle bookings claimed.

### Implementation baseline

- Next.js/React/TypeScript, following the class framework; responsive desktop/mobile layouts.
- For this demonstration, browser-persisted sample cases shared between customer/staff views on the same browser/device. This meets refresh persistence but is not multi-device synchronization. Use a storage boundary that can later be backed by a database.
- Simulated customer/staff role selection, payment outcomes and an SMS log. Keep adapters separate for later real providers. Demonstrated role behavior is not production access control.
- No external deployment without user direction. Preview/build/diff checks follow the class workflow when implementation is authorized.

## Draft work order

1. Foundation: three screen wireframes, sample case model, localization-ready presentation and persistence.
2. Request and assessment: intake, authorization, simulated payment, expert-first and Thursday/Friday exception.
3. Estimate and repair: itemization, approval versions, advances, revisions and declined/unanswered paths.
4. Quality and return: checks, settlement, records, authorized handover and complaint scenario.
5. Prove accepted scenarios, review diff/build and prepare demonstration handoff.

The [local backlog](ISSUES.md) refines these into stories, dependencies and proof; [wireframes](WIREFRAMES.md) describe the three layouts. Use plan → Skeptic → code → proof → reviewed PR workflow. No external issues/PRs created yet.

## Skeptic review

| Assumption or risk | How to challenge it | Consequence |
| --- | --- | --- |
| Shared-browser demo is mistaken for production | Refresh and role-switch sample cases; verify simulation labels and absence of real provider calls | Demo must be labeled; real security/integrations remain launch gates |
| Approval survives changed parts/costs | Revise an approved estimate and try to proceed without reapproval | Demo must block revised work until fresh approval |
| Parking is treated as free capacity | Hold Thursday/Friday car, then request second collection | Demo must count custody as active capacity |
| Partners/coverage assumed ready | Obtain written scoped commitments and provider evidence | Blocks paid launch, not the sample demonstration |
| Customers will pay enough | Price real sample jobs and interview reachable customers | Business validation pending; sample USD is not a verified fee schedule |

## Separate paid-launch gates

Actual supported models/repair categories and specialist commitments; transport and parking coverage/readiness; enforceable service/warranty/representative terms; prices and margins; refunds/storage/dispute procedures; Persian and chosen local unit; verified identity, real gateway/SMS; server persistence and enforced permissions; private data retention and operational staffing. Manufacturer-warranty cars route to authorized workshops, with Fixauto's coordination promise still to define.

These are intentionally deferred from demo implementation, not settled or waived. Continue that branch before real bookings/custody/payments.
