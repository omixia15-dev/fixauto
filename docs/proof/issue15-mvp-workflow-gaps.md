# Issue #15 implementation proof

This is a local, simulated proof of the six Issue #15 workflow gaps. It is not a production deployment or a real payment, SMS, custody, or insurance record.

## Reproduction order

1. Reset sample data. Create two expert-visit requests; leave the second pending, confirm the first, and verify the active slot is `1/1`. The second confirmation is rejected until the first case is released.
2. For a collection case, complete handover, assessment, estimate approval, funding, work, failed quality, corrective work, passing quality, settlement, and final return without an assessment-only return. Capacity remains occupied until the final return metadata is recorded.
3. For a deeper investigation, authorize and pay its separate scope, record expert findings, then publish the estimate. The recommendation, authorization, payment, and findings remain visible in history.
4. Approve a fresh estimate and use the explicit “Apply available credit” action. The applied amount and remaining balance are shown; only the remaining balance can be paid. Authorized incurred costs and refunds reduce reusable credit.
5. Reset and refresh the browser between steps. Daily summary dates are generated in `Asia/Tehran`, including the UTC midnight boundary.

## Automated evidence

- `tests/issue15-workflow.test.ts`: expert confirmation reservation, paid investigation completion, and credit conservation.
- `tests/storage.test.ts`: v2 migration preserves earlier-customer context for Thursday collection exceptions.
- `tests/service-date.test.ts` and `e2e/d6-summary.spec.ts`: Tehran date boundary.
- Existing D4/D5 tests cover immutable estimate funding, failed quality/rework, settlement, and return metadata.

Validation commands and observed results on the issue branch:

```
npm test       # 9 test files passed
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

All records are simulated sample data; no external provider or live payment is called.
