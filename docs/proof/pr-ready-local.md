# Landing and visit request PR verification

Date: 2026-10-22
Branch: codex/visit-request-page
Base: origin/main

## Scope

- Red/black photographic scrollytelling homepage at / with public navigation and an ending Request a visit action.
- Matching /case/new form, editable review, and pending browser-local sample receipt.
- Header ignition sequence using the first ten seconds of the supplied recording, five cumulative red symbols, and quiet-ending cleanup.
- Existing downstream demo workflows and case context preserved.

The separately modified case-index, customer-dossier and staff-workspace CSS files are excluded. Rejected comps, standalone prototypes, local backups and temporary worktrees remain local.

## Verification

Verified from an isolated snapshot of the staged Git tree, excluding unrelated local CSS and untracked working artifacts:

- Production build and strict typecheck passed.
- All 39 unit tests passed.
- Full Chromium suite: 62 passed, zero retries. Includes request review/persistence, downstream workflows, keyboard navigation, nine responsive viewports, reduced motion, media synchronization, mute/unmute, audio failure and quiet-ending cleanup.
- Full ESLint: zero errors and four pre-existing warnings in legacy review helpers.
- Independent final source review: no blocking findings.

The complete suite exposed an obsolete homepage assertion and a test that paused audio and attempted a programmatic resume. The homepage assertion now follows the public demo link; the audio test now observes uninterrupted real playback and verifies that mute/unmute preserves its clock. The final full run passed.

A production-like local build was verified. A deployed Preview and production environment have not been verified.

## Limits

This is a browser-local demonstration. No real booking, availability, payments, SMS or identity verification is introduced. No merge or production deployment is performed by this task.
