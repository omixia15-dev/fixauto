# MVP working specification

Status: confirmed through Q87 and subsequent user approval. See [PLAN](PLAN.md), [local backlog](ISSUES.md) and [wireframes](WIREFRAMES.md). The service application is not implemented.

## Service journey

Request → verified customer → initial assessment authorization/payment (fixed fee, amount pending) → expert visits customer → selects appropriate destination → separately authorized transport/investigation where needed → specialist diagnosis → estimate approval and advance → parts/repair coordination → quality check → final settlement → return and warranty.

Expert-first reduces unnecessary transport. Fixed assessment fee disclosed before visit, payable even if further service declined. Qualified specialist informs transport criteria; unresolved suitability uncertainty means tow. Thursday/Friday towing bypasses visit until Saturday with advance disclosure (Q84–Q86). Original office drop-off remains a manually scheduled alternative.

Revised work loops back to explicit estimate approval. Accepted cancellation policy refunds unspent funds, deducting only disclosed authorized incurred costs. Failed quality checks keep the case open under its coordinator for reassessment and delay communication; technical checklists require specialist validation. If the customer is unreachable, pause unapproved work, notify and follow up; silence is not approval. Payment/refund mechanics and waiting/storage limits remain unresolved.

Thursday/Friday towing for new customers goes to the user's private parking, with work starting Saturday. Assign user, brother-in-law or father as receiver and record condition/key handover; family handover role does not authorize repairs/spending. Transport/storage charges are separately approved and paid before dispatch; diagnosis paid before it starts. A parked car counts toward one-active-car pilot capacity until returned. Actual prices and provider setup remain open. Concise summaries are sent via SMS every day in custody; exact message/link design pending. Unanswered estimates trigger a call after 24 hours, without automatic authorization or charges. Vehicle-card handling is inspection only, not mandatory photo upload.

## English/USD first

English/USD demonstration with simulated payments first; Persian and verified local payments for the Kerman paid launch later (Q78–Q80). Software should be reusable and localization-ready: separate interface text and business rules, explicit currency per amount, future RTL layout. No international service launch or automatic currency conversion. Real gateway remains unselected; selecting one is not required to simulate payment in the demo.

Service promises describe the real pilot; demonstration does not prove operational readiness, insurance, partner agreements or integrations. Q87 accepts sample customers, clearly labeled simulated sign-in/payments/SMS and shared customer/staff cases surviving refresh. Specific persistence architecture is proposed in PLAN.md.

## Maximum five capability groups

1. **Request service:** Contact name/mobile, vehicle make/model/year, symptoms, preferred appointment; staff can record phone or office requests. Submission is a request, not automatic appointment confirmation. Address needed for selected visit/collection, ownership inspection later without initial document upload.
2. **Authorize diagnosis:** Verified phone access, ownership/representative checks, diagnostic scope and charges, authorization and initial gateway payment. Document requirements remain open.
3. **Approve repairs:** Versioned itemized estimate, approve/reject, repair advance, fresh approval for every increase. Persist the exact version authorized.
4. **Settle and receive records:** Final gateway payment, invoice, warranty and release record. Refund and quality-failure business policies accepted; provider verification and refund processing details pending.
5. **Manage cases:** Named coordinator, manual assignments and updates, handovers, payment/approval records and quality-check evidence. Role-limited sharing accepted Q58; technical enforcement pending.

## Accepted three-screen demonstration

1. Service request: vehicle problem and appointment request.
2. Customer case page: diagnosis, estimate approvals, simulated payments, updates, invoice and warranty records.
3. Staff workspace: cases, assignments, handovers, estimates and quality checks.

Accepted proof covers successful journey, rejected estimate, failed payment, revised approval and failed quality check (Q83). Simulated identity/payments/SMS and refresh persistence accepted Q87; simulated controls do not prove production security.

## Draft first work items

### 1. Request a diagnosis

Story: As a busy car owner, I want to request help without creating an account so Fixauto can arrange an appropriate appointment.

- A valid request creates one case and displays a case reference.
- Missing essential contact/vehicle/symptom information is explained without losing input.
- Requested time is visibly pending staff confirmation.
- Submitted private information is not publicly readable.

### 2. Authorize and pay for diagnosis

Story: As a customer, I want to see and accept diagnostic charges before paying or handing over my car.

- Verified customer access is required for authorization.
- Accepted scope, charges and authorization evidence remain associated with the case.
- A failed or canceled payment does not mark charges paid.
- Ownership/representative requirements are satisfied before collection.

Demo uses sample identity and simulated payments; real provider setup does not block it. Vehicle-card handling is inspection only. Actual verification procedure, gateway setup and real refund processing remain paid-launch gates.

### 3. Approve a repair estimate

Story: As an authorized customer, I want to approve an itemized estimate so Fixauto spends only what I authorized.

- Parts, workshop costs and Fixauto fee are separately visible.
- Approval identifies the exact estimate version and authorized person.
- Changed scope or increased total requires new approval.
- Parts identify brand, condition, price and warranty; any substitution requires renewed approval, even if cheaper (Q74).
- A different customer cannot read or approve the estimate.

Use clearly illustrative USD values for the demo. Real fees, provider setup and enforced authorization remain paid-launch gates.

## Accepted return and dispute requirements

Release to owner or expressly authorized recipient with recipient, condition, mileage and keys recorded. The owner reviews disputes against original symptoms, approved work and quality-check evidence, arranging another qualified specialist when needed; assessment charges agreed before incurred. Detailed verification and complaint flows still need design.

## Implementation and proof

After discovery confirmation: refine each issue to 3–5 testable criteria, plan and challenge assumptions, build on a branch, prove the criteria and permissions on Preview, review the diff/build, and verify Production after authorized merge. No issues have been created externally.

Class demonstration stack is a candidate, not a finalized choice. Gateway and phone-verification feasibility need checking before committing to architecture.
