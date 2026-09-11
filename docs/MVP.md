# MVP working specification

Status: capability scope accepted; details and acceptance criteria below are drafts for grilling, not Ready implementation issues. See [decisions](DECISIONS.md).

## Service journey

Request → verified customer → diagnostic authorization/payment → collection or visit → specialist diagnosis → estimate approval and advance → parts/repair coordination → quality check → final settlement → return and warranty.

Revised work loops back to explicit estimate approval. Declined diagnosis/repair, cancellation, failed quality checks, payment failures, and warranty complaints require their own paths. Several of these policies remain unresolved.

## Maximum five capability groups

1. **Request service:** Contact, vehicle, symptoms, preferred appointment; staff can record phone or office requests. Submission is a request, not automatic appointment confirmation.
2. **Authorize diagnosis:** Verified phone access, ownership/representative checks, diagnostic scope and charges, authorization and initial gateway payment. Document requirements remain open.
3. **Approve repairs:** Versioned itemized estimate, approve/reject, repair advance, fresh approval for every increase. Persist the exact version authorized.
4. **Settle and receive records:** Final gateway payment, invoice, warranty and release record. Gateway verification, refunds and quality-failure policies still need decisions.
5. **Manage cases:** Named coordinator, manual assignments and updates, handovers, payment/approval records and quality-check evidence. Staff permissions remain pending.

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

Blocked by authentication, ownership evidence, gateway and cancellation decisions (Q53–Q55).

### 3. Approve a repair estimate

Story: As an authorized customer, I want to approve an itemized estimate so Fixauto spends only what I authorized.

- Parts, workshop costs and Fixauto fee are separately visible.
- Approval identifies the exact estimate version and authorized person.
- Changed scope or increased total requires new approval.
- A different customer cannot read or approve the estimate.

Blocked by fee structure details and payment/authorization design.

## Implementation and proof

After discovery confirmation: refine each issue to 3–5 testable criteria, plan and challenge assumptions, build on a branch, prove the criteria and permissions on Preview, review the diff/build, and verify Production after authorized merge. No issues have been created externally.

Class demonstration stack is a candidate, not a finalized choice. Gateway and phone-verification feasibility need checking before committing to architecture.
