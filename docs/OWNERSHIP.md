# Ownership and permissions

Status: business role boundaries accepted through Q87 and final confirmation. Demo identity/role selection is simulated; production enforcement is unimplemented. Family receiver authority is separate from spending approval.

## Accepted business requirements

- Initial service request requires no account.
- Verified phone access precedes diagnostic charges or collection authorization.
- Vehicle card is the user's intended ownership evidence (Q53), inspected only for now with no retained photo (Q60); verification procedure and representative evidence remain open.
- A representative needs recorded owner authorization and a named spending approver.
- Each repair approval binds a specific estimate; all increases need fresh approval.
- A named family receiver may accept vehicle/keys and record handover; this grants no repair or spending approval authority (Q73).
- Return recipient is owner or someone expressly authorized by owner; record recipient, condition, mileage and keys (Q75). Handover receipt is separate from resolving warranty complaints.

## Proposed permission matrix

| Actor | Proposed access |
| --- | --- |
| Visitor | Submit initial request; no private case browsing |
| Verified customer | Read and authorize own cases within verified vehicle/representative authority |
| Authorized representative | Only actions expressly granted for relevant vehicle/case |
| Coordinator | Necessary case information to manage the case; business boundary accepted Q58 |
| Driver | Minimal transport/handover details; accepted Q58 |
| Workshop | Relevant vehicle details and approved work; accepted Q58, separate accounts deferred |

## Draft permission proofs

- Allowed: a verified authorized customer approves their current estimate version.
- Denied: a different customer accesses the case by changing an ID.
- Denied: a representative exceeds the recorded spending authority.
- Denied: a browser-supplied payment-success value releases a vehicle without verified payment.
- Denied: approval of an earlier estimate silently authorizes a higher revised total.

These are draft tests for future implementation. No RLS policies, identity checks or payment controls have been built or tested. Verify legal/document requirements separately rather than treating this planning document as legal advice or an established policy.
