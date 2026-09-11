# Data model — provisional design

This translates [product relationships](PRODUCT.md) into a reviewable class exercise. These are proposed tables and types, not an approved schema or migration. No database exists.

## First storable branch

Proposed `service_cases`:

| Column | Proposed type | Meaning |
| --- | --- | --- |
| id | uuid, primary key | Stable case identity |
| customer_id | uuid, nullable foreign key | Verified customer after linking an initial account-free request |
| vehicle_id | uuid, foreign key | Vehicle receiving service |
| symptoms | text | Customer-reported problem, not a confirmed diagnosis |
| created_at | timestamptz | Request creation time |

One customer can have many cases, so `service_cases.customer_id` is a foreign key to the proposed customer record. Linking an unauthenticated request must require verified authority; a supplied phone number or case ID alone is not proof. Exact identity design is pending.

## Candidate supporting records

| Record | Relationship / purpose |
| --- | --- |
| Vehicles | One vehicle can have many cases; ownership evidence rules pending |
| Representative authorizations | Connect vehicle owner, representative and permitted actions |
| Diagnostic authorizations | Case, scope/charges version, authorizer and time |
| Estimate versions and line items | Many immutable proposed versions per case; itemized costs and fees |
| Approvals | Link authorized actor to specific estimate version |
| Payments | Case, purpose, amount, provider reference and verified payment state |
| Handovers | Case, custody parties, time, condition, mileage and keys |
| Quality checks | Case, checker, checklist version, result and supporting evidence |
| Invoices and warranties | Case and issued terms; warranty coverage remains pending |
| Warranty complaints | Many complaints can refer back to original case |

## Open design decisions

Authentication provider; document uploads and retention; staff roles; case states and transitions; audit retention; payment/refund reconciliation; money representation and gateway currency conversion. Budget figures are in toman: do not assume a gateway also uses toman. These implementation details must be verified during planning.

See [ownership](OWNERSHIP.md) for authorization boundaries. The product's word “ownership” includes vehicle authority, which is different from database record access.
