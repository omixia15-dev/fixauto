# Fixauto

Fixauto is a planned managed car-repair service in Kerman, Iran. It helps busy car owners arrange diagnosis, approve transparent repair costs, and delegate transport, parts sourcing, repair coordination, quality checks, and return to one accountable service.

**Status:** grilling Q1–Q87 is complete and the user confirmed the plan. Documentation and the interactive knowledge graph are available. The browser-only English/USD demonstration now covers the D1 foundation, D2 request-to-assessment, and D3 simulated custody workflow. D4–D6 and all paid-launch prerequisites remain open.

**Open [Fixauto Knowledge Graph](<docs/Fixauto Knowledge Graph.html>)** in your browser. Zoom, pan, select nodes, search and download SVG views; it works offline.

## Resume

The [interview archive](docs/GRILL-ME.md) preserves the answers. “Continue fixauto grill me” can reopen only new questions or the paid-launch branch; it should not restart settled discovery. The [confirmed plan](docs/PLAN.md) is the current scope.

## Class document map

- [Product brief and domain relationships](docs/PRODUCT.md)
- [MVP scope and draft acceptance criteria](docs/MVP.md)
- [Roadmap and outstanding evidence](docs/ROADMAP.md)
- [Decision register, traced to interview answers](docs/DECISIONS.md)
- [Proposed data model](docs/DATA-MODEL.md)
- [Ownership and permissions](docs/OWNERSHIP.md)
- [Domain glossary](CONTEXT.md)
- [Agent working instructions](AGENTS.md)
- [Confirmed plan](docs/PLAN.md)
- [Local implementation backlog](docs/ISSUES.md)
- [Three screen wireframes](docs/WIREFRAMES.md)
- [Paid-launch evidence gates](docs/LAUNCH-CHECKLIST.md)
- [Knowledge graph guide](docs/KNOWLEDGE-GRAPH.md)

The planning follows Vibies sessions 1–10: user/problem/MVP, domain map, issues and acceptance criteria, plan and Skeptic review, branch-based implementation, proof on Preview, and Production verification. Source decks are at `/mnt/c/Users/vr7sk/OneDrive/Desktop/Vibies Sessions` (Windows: `C:\Users\vr7sk\OneDrive\Desktop\Vibies Sessions`). The confirmed demo stack is Next.js, React, and TypeScript with browser-local sample persistence. A production backend, hosting decision, and payment provider remain separate paid-launch work.

## Development

The D1 foundation provides the service-request shell, customer case, and staff workspace over fictional cases saved in the same browser. D2 adds validated request creation, staff appointment confirmation, simulated customer authorization and payment outcomes, an expert-first assessment record, and separately funded deeper investigation. D3 adds simulated transport/storage approval, qualified drive-or-tow input, custody-only receiver handover, one-car capacity, and a Saturday gate for the Thursday/Friday private-parking exception. It is not the completed service workflow and makes no real booking, payment, identity, SMS, custody, or authorization claim.

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Playwright requires its Chromium browser and Linux system dependencies. Paid-launch readiness still requires the separately documented evidence.

The recorded D1 runtime is Node 24.19.0 (see `.nvmrc`).
