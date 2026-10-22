# Fixauto photographic landing and visit request

The live homepage at / implements the approved minimal red-and-black visual direction. The request route at /case/new uses the same typography, palette and public navigation. Earlier comps and standalone prototypes are local design history, not runtime dependencies.

## Homepage

Four photographic scenes introduce the handover, assessment, estimate approval and return to daily life. A native disclosure preserves the complete eight-step journey. The ending includes the sentence Your car has a problem above Request a visit, which opens /case/new.

Use the active plates in public/images/: landing-hero-branded.png, landing-assessment-branded.png, landing-approval.png, landing-return.png and landing-request.png. Their adjacent JSON files record the generation prompts. All people and premises are fictional concept imagery. The approved return-to-day image is the woman relaxed at her desk, distinct from the opening handover.

Text and controls are HTML. Desktop images hold during natural scrolling; phones stack copy and deliberately cropped photos. Reduced motion removes image transitions and sticky positioning. Keep fee/assessment, separately approved transport/investigation and fresh-estimate approval details available without crowding the main story.

## Header ignition sequence

Five transparent dashboard symbols reveal cumulatively left to right in a centered header row; every symbol is red. The first ten seconds of the supplied recording are saved at public/audio/ignition-first-10s.wav. Actual playback currentTime drives the cues at 2.70, 3.91, 5.11, 6.31 and 7.50 seconds. Pointer movement/touch starts a silent equivalent; explicit sound enable starts the recording and lights together. Earlier lights remain visible after later ones appear.

The header remains visible during scrolling. Entering Back to your day cuts audio and disables the sound button with a quiet-ending label. Visual progression may finish silently. The wrench cursor retains the supplied reference direction.

## Visit request

Vehicle, symptoms, preferred time, service mode/address and contact details lead to editable check answers before creation of a pending browser-local sample case. Review does not save a case. Storage failures preserve answers and offer retry. The receipt links to the existing case dossier. No real appointment, price, authorization, payment, identity check or message is created.

## Implementation and evidence

- app/page.tsx and app/page.module.css
- src/components/public-header.tsx, warning-lights.tsx and use-warning-interaction.ts
- src/screens/request-screen.tsx and request-screen.module.css
- docs/VISIT-REQUEST-BRIEF.md
- docs/proof/warning-experience-local.md
- docs/proof/pr-ready-local.md

The legacy case index, customer dossier and staff workspace retain their existing design. Deployment and production verification are separate from local implementation.
