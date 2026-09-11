# Product brief

Status: current discovery snapshot; see [decisions](DECISIONS.md) for provenance and [resume checkpoint](GRILL-ME.md) for unresolved questions.

## Eight class questions

| Question | Current answer |
| --- | --- |
| Name | Fixauto |
| User | Initial outreach: women in Kerman who are doctors, makeup artists, or lawyers, own expensive cars, and want help managing maintenance. Other busy owners may be future customers. |
| Problem | Owners lack time, confidence, or trusted contacts to identify faults, choose technicians, source parts, and supervise repairs. Demand remains untested. |
| Solution | A managed service using partner workshops, with diagnosis, approved costs, collection, repair coordination, quality checks, return, and limited warranty. |
| Main action | Request help, authorize diagnosis, then approve a repair estimate. The service must complete the journey through return. |
| MVP | Five software capability groups in [MVP](MVP.md), with manual operational coordination. |
| Non-goals | Live tracking, automated workshop assignment, a broad marketplace, subscriptions, major marketing before pilot evidence, and unrestricted repair coverage. |
| Success | Two-month pilot: five completed paid jobs, costs and time recorded for each, no unauthorized spending, and at least four customers willing to return. Measure direct job economics. |

## Value proposition

For busy car owners in Kerman, Fixauto reduces the effort of diagnosis, finding technicians, sourcing parts, and supervising repairs by providing one accountable coordinator, transparent approved pricing, managed transport, and a written repair warranty.

Safe transport and warranty are intended promises; their insurance and partner backing are still unverified. Targeting women does not establish that women have less automotive knowledge. Interviews should test each customer's actual needs.

## Service scope and resources

- Managed service using external trusted shops, not an open matching marketplace.
- Owner-reported resources: trusted repair shops, a parts supplier, two people knowledgeable about cars, one or possibly two transport helpers, and an owned location without rent. Personnel overlap, staffing commitments, and technical competence remain unclear.
- Candidate vehicle groups: IKCO, SAIPA, Hyundai, Kia, Nissan, Toyota, Mazda. This is not a confirmed launch list. Start with makes supported by the strongest partners; exact models remain open.
- Cars under manufacturer warranty should go to authorized workshops. The promise for this separate coordination service remains to be defined.
- Start with bounded, diagnosable work; defer major engine/transmission rebuilds, collision restoration, and uncertain parts cases. Exact supported repair categories await workshop confirmation.
- Provisional area: Kerman municipal limits. No verified distance or travel-time assumptions.
- Workshop/diagnostic windows: 09:00–14:00 and 16:30–21:30, local time. Towing availability is reported as round the clock. Fixauto routine hours: Saturday–Wednesday 09:00–13:00 and 17:00–20:00, with urgent active-case support on call.
- Thursday/Friday emergency towing serves new customers, to the user's own private parking, with service procedure starting Saturday. User, brother-in-law or father is assigned to receive car/keys and record condition/key handover. Approved transport/storage charges are paid before dispatch; diagnosis charged separately before it starts. Parked cars count toward the single active-car limit until returned. Readiness, coverage and actual prices remain unverified/undecided.
- Customers receive a concise useful SMS summary every day the car is in custody, including nonworking days: current situation, next action and expected timing. Provider and exact message/link design remain open.
- Unanswered estimates trigger a follow-up call after 24 hours; work remains paused without automatic approval or new charges.

## Initial assessment

Expert visits customer first to assess and select destination, minimizing movements. Fixed disclosed assessment fee applies even if further work declined; deeper investigation and transport separately authorized/priced. Qualified specialist informs driving/towing criteria; unresolved uncertainty means tow. Thursday/Friday collection goes directly to parking, with assessment Saturday and customer informed before dispatch (Q84–Q86). Original office drop-off remains a manually scheduled alternative.

## First-version language and currency

English/USD demonstration with simulated payments first; Persian and verified local payments before Kerman paid launch (Q78). Universal means reusable design for future adaptation, not international operations now (Q79). Separate interface text from business rules, retain currency with amounts, and prepare for later RTL layout (Q80). No automatic currency conversion. Real-launch currency choice between rial/toman and provider units remains open.

## Parts, return and dispute rules

- Specialist recommends parts; customer approves specified brand, condition, price and warranty. Substitution requires renewed approval even when cheaper.
- Return goes to owner or expressly authorized recipient, with recipient/condition/mileage/keys recorded; receipt is distinct from warranty-complaint resolution.
- Owner reviews disputed results using original symptoms, approved work and quality-check evidence; arrange another qualified assessment when needed, with charges agreed before incurred.

## Domain relationships

| From | Relationship | To |
| --- | --- | --- |
| Customer | requests | Service case |
| Vehicle owner | authorizes | Representative |
| Service case | concerns | Vehicle |
| Coordinator | manages | Service case |
| Specialist workshop | diagnoses and repairs | Vehicle within a case |
| Service case | has | Diagnostic authorization, estimate versions, payments, handovers, quality checks |
| Customer or authorized representative | approves | Specific estimate version |
| Supplier | supplies | Approved parts |
| Service case | concludes with | Final invoice, return, written warranty |
| Warranty complaint | refers back to | Original service case |

## Assumptions to test

Reachable customers will pay; partner work is reliable; costs can support a management fee; insurance is obtainable for the actual custody arrangements; partner warranty terms support Fixauto's promise; the owned location is suitable. None is proven by the interview.
