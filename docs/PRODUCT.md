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
- Workshop/diagnostic windows: 09:00–14:00 and 16:30–21:30, local time. Towing availability is reported as round the clock. Fixauto's five operating days and staffed response hours remain open.

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
