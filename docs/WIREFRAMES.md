# Three screen wireframes

Low-fidelity layout specifications for the confirmed demonstration. This is planning, not built UI. English and illustrative USD first; later localization should support Persian/RTL without changing case rules.

## 1. Service request

```text
FIXAUTO                               [Demo / sample data]
Let us manage your car repair
How it works: assessment → approval → repair → return

Contact name       Mobile number
Car make           Model              Year
Describe the symptoms [                              ]
Preferred appointment / visit location
[Request expert visit]

Confirmation: request received, awaiting staff confirmation
Emergency Thu/Fri collection: manually arranged, work Saturday
```

Field errors appear beside fields and preserve entered values. Ownership card inspection happens later; no initial upload. A request is not a confirmed appointment. The original office drop-off option can be handled by staff; routine primary journey is the expert visit.

## 2. Customer case page

```text
FIXAUTO                         Case reference · Demo customer
Current situation / next action / expected timing

Action needed: [Review assessment charge / estimate / payment]
Assessment and diagnosis summary
Itemized estimate vN: parts / workshop / Fixauto fee / total USD
[Approve this version] [Decline]

Updates                 Payment history
Invoice / warranty      Return record / report a problem
```

Show only the action appropriate to the current stage. Approval names the exact estimate version. Simulated payment outcomes are obvious; failure preserves the outstanding action. Revised costs/parts require another approval. This is a case summary, not live GPS tracking.

## 3. Staff workspace

```text
FIXAUTO / STAFF                       [Simulated staff role]
Active case capacity: 0 or 1 / 1
Case list                             Selected case
 - pending request                    Customer / car / coordinator
 - active                             Next required action
 - returned                           Assessment / workshop / estimate
                                      Transport / receiver / handovers
                                      Payments / quality / return
                                      Daily SMS log / complaint history
```

Separate sections for assessment, estimate revision and quality proof. Keep custody receiver distinct from spending approver. Thursday/Friday parking has a named receiver and occupies capacity. Show the reason when a prerequisite blocks progression rather than silently advancing.

## Interaction principles

- Preserve drafts when validation or simulated payment fails.
- Separate success claims from attempted actions; show confirmed sample outcomes.
- Keep daily summaries brief and distinguish them from requests for consent.
- Sample values and simulated roles remain visible; no claim of real provider integration.
- Desktop/mobile and keyboard operation are part of demo proof.

See [ISSUES](ISSUES.md) for testable outcomes and [PLAN](PLAN.md) for scope.
