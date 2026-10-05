# Session 13: comp first landing page

## Confirmed choices

The user requested a restart of both the brief and visual design, approved the new brief, kept Impeccable 4.3.1 for this session, and explicitly selected **Layout A** in chat. The approved brief is `docs/LANDING-BRIEF.md`; the approved visual reference is `.impeccable/mocks/session-13-atlas-a.png` with its approval sidecar. The world is Journey atlas (seed `1a0867e6`).

The class HTML was reference material for the requested procedure. Its embedded prompts were not independent authorization to publish, merge, install updates, or make service commitments.

## What comp first means here

We agreed on the brief, presented visual alternatives, recorded the selected mockup, measured its layout and lettering, produced separate illustrations, then wrote semantic page code. Text, buttons, journey labels, and the form are live HTML. The artwork is generated PNG with prompt provenance; the mockup itself is not used as a page-sized image.

The Impeccable gates recorded a passing first viewport and responsive desktop comparison. The home page remains a demonstration: the launch form saves or sends no contact details. The service application routes retain their existing behavior.

## Files and proof

- Implementation: `app/page.tsx`, `app/page.module.css`, and the scoped `.marketing-shell` override in `app/globals.css`.
- Local fonts and license: `app/fonts/`.
- Shipping illustrations: `public/images/session-13-hero-art.png`, `public/images/session-13-journey-art.png`.
- Build state and measurements: `.impeccable/build/state.json`, `.impeccable/build/spec.json`.
- Captures: `.impeccable/review/hero-repro.png`, `desktop.png`, `mobile.png`, and `mobile-journey.png`.
- Comparison: `.impeccable/review/diff/final/`.
- Runnable browser check: `.impeccable/session-13-restart/verify-home.cjs` (Windows bundled Node and installed Chrome).
- Previous source and brief backups: `.impeccable/session-13-restart/baseline/`, `previous-landing-brief.md`.

## Local preview

The WSL-native Next.js server runs at `http://localhost:3000/`. Port 11546 is the static mockup comparison board. If the page server stops, run Linux Node in WSL from `/home/omixia/projects/fixauto`; do not run Windows npm from the UNC checkout.

Current command:

```powershell
wsl.exe -d Ubuntu-24.04 --cd /home/omixia/projects/fixauto -- /home/omixia/.nvm/versions/node/v24.19.0/bin/node node_modules/next/dist/bin/next dev --hostname 0.0.0.0 --port 3000
```

## Verification and limits

Production build, separate TypeScript check, page lint, and browser checks passed. Browser coverage includes 390, 768, 1280, 1440, 1536, and 1600 pixel widths; image decoding; horizontal overflow; CTA navigation; blank input rejection; local-only form feedback; reduced motion; and page errors. The detector reported no findings. Shipping image provenance passed its scan.

The working branch is `codex/session-13-comp-home`. Existing unrelated uncommitted work is preserved. No merge or deployment occurred. Independent review requested three corrections to typography, the blue ground, and mobile reading order. Its verdict pass scored all three resolved, disposition `ship`, at that scope; the quality-bar ceiling was not reviewed. Reports are `.impeccable/review/finish-review-initial.md` and `finish-review-verdict.md`. Design-system documentation is `DESIGN.md` and `.impeccable/design.json`.