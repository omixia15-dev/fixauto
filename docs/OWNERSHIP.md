# Ownership and permissions

Status: business authorization decisions partly accepted; technical permissions below are proposed. Staff-role recommendations in Q58 remain unanswered.

## Accepted business requirements

- Initial service request requires no account.
- Verified phone access precedes diagnostic charges or collection authorization.
- Vehicle ownership evidence matters; acceptable documents and retention are pending Q53.
- A representative needs recorded owner authorization and a named spending approver.
- Each repair approval binds a specific estimate; all increases need fresh approval.

## Proposed permission matrix

| Actor | Proposed access |
| --- | --- |
| Visitor | Submit initial request; no private case browsing |
| Verified customer | Read and authorize own cases within verified vehicle/representative authority |
| Authorized representative | Only actions expressly granted for relevant vehicle/case |
| Coordinator | Manage assigned cases; exact role limits pending Q58 |
| Driver | Minimal transport/handover details; proposal pending Q58 |
| Workshop | Vehicle details and approved scope needed for work; manual sharing initially proposed, pending Q58 |

## Draft permission proofs

- Allowed: a verified authorized customer approves their current estimate version.
- Denied: a different customer accesses the case by changing an ID.
- Denied: a representative exceeds the recorded spending authority.
- Denied: a browser-supplied payment-success value releases a vehicle without verified payment.
- Denied: approval of an earlier estimate silently authorizes a higher revised total.

These are draft tests for future implementation. No RLS policies, identity checks or payment controls have been built or tested. Verify legal/document requirements separately rather than treating this planning document as legal advice or an established policy.
