---
name: Fixauto - Back to your day
description: Minimal photographic landing direction with preserved application styling
colors:
  request-border: "#696763"
  request-border-hover: "#aaa7a1"
  request-error-border: "#ff8b90"
  request-error-text: "#ff9ca0"
  canvas: "#090909"
  surface: "#111111"
  paper: "#f5f3ef"
  muted: "#c8c6c1"
  action-red: "#d71922"
  action-red-hover: "#b8161f"
  focus-red: "#ff5b62"
  divider: "#383735"
  white: "#ffffff"
  media-ground: "#171615"
  footer-muted: "#a8a6a1"
  selection-red: "#9e171c"
  scrollbar-thumb: "#5a292b"
  cobalt: "#1749b9"
  action-gold: "#e8b848"
  action-hover: "#f4cb64"
  approval-gold: "#ffdc82"
  mineral-ground: "#e7eeee"
  quiet-ground: "#edf3f1"
  navy-ink: "#11253f"
  route-label: "#d2e2e9"
  panel: "#f9fcfb"
  legacy-divider: "#c6d4d5"
  case-ground: "#edf3f6"
  case-muted: "#52647d"
  case-divider: "#d7e1e9"
  case-soft-blue: "#edf3ff"
  case-panel: "#ffffff"
  case-action-border: "#d7a82f"
typography:
  display:
    fontFamily: "Alexandria, Arial, sans-serif"
    fontSize: "clamp(2.6rem, 5.4vw, 6rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Alexandria, Arial, sans-serif"
    fontSize: "clamp(2.35rem, 4vw, 3.4rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Alexandria, Arial, sans-serif"
    fontSize: "clamp(1.08rem, 1.45vw, 1.3rem)"
    fontWeight: 400
    lineHeight: 1.62
  detail:
    fontFamily: "Alexandria, Arial, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Alexandria, Arial, sans-serif"
    fontSize: "0.96rem"
    fontWeight: 600
  wordmark:
    fontFamily: "Alexandria, Arial, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
rounded:
  control: "0.35rem"
  focus: "2px"
spacing:
  page-gutter: "clamp(1.25rem, 5.8vw, 5.5rem)"
  mobile-gutter: "1.25rem"
  narrow-gutter: "1rem"
  action-gap: "2rem"
  details-gap: "1.8rem"
components:
  button-primary:
    backgroundColor: "{colors.action-red}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0.9rem 1.2rem"
  button-primary-hover:
    backgroundColor: "{colors.action-red-hover}"
  text-action:
    textColor: "{colors.paper}"
  details:
    textColor: "{colors.paper}"
  request-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0.72rem 0.78rem"
  legacy-case-action:
    backgroundColor: "{colors.action-gold}"
    textColor: "{colors.navy-ink}"
    rounded: "8px"
    padding: "11px 16px"
---

# Design System: Fixauto

## Overview

**Creative North Star: "Back to your day"**

Fixauto's approved landing-page direction is minimal and photographic: near-black surfaces, warm off-white text and restrained red actions. One realistic scene and one short message lead each viewport; space and readable type carry the hierarchy.

This direction is implemented at / and /case/new. The public homepage and visit request share Home page and Request a visit navigation links. The case index, customer dossier and staff screens retain their Journey atlas system, archived in docs/design/journey-atlas-reference/. Keep that legacy system when maintaining those operational screens.

The user approved the visual direction and revised closing scene on 2026-10-20. The homepage implements four photographic scenes, an eight-step journey summary, and a closing request action. The small sentence Your car has a problem sits above the Request a visit button, which opens /case/new. The surface brief remains at docs/design/scrollytelling-v2/README.md.

**Key Characteristics:**

- Minimal composition with generous empty space.
- Photorealistic concept imagery and live HTML text.
- Red reserved for actions and visible interaction states.
- A distinct closing image showing confidence and a return to normal life.

## Colors

### Primary

Action red is the only primary accent. Use its darker hover shade for filled controls and the brighter focus red for focus outlines and small list markers. The brighter shade is not the filled primary-button background.

### Neutral

Canvas black establishes the page; surface black separates the journey summary. Warm paper carries headings, muted stone carries support text, and the divider stays subordinate. White is reserved for filled-action text. The media ground is a loading fallback; muted footer text, selection red and the scrollbar thumb are observed supporting colors.

### Existing application palette

The retained cobalt, gold, mineral, navy and case tokens apply to the retained operational application screens. Their presence in the frontmatter preserves those screen contracts; it does not make them alternate accents for the new landing page. Detailed legacy guidance remains in the archived reference.

**The Accent Rule.** In the new landing direction, red marks an action or interaction state; photographs carry the visual richness.

## Typography

Alexandria is self-hosted at regular (400) and semibold (600), with Arial and sans-serif fallbacks. The homepage uses next/font local files and disables synthesized weights; the standalone reference uses static files.

Desktop scene headings use the display token, with a narrower heading measure for supporting scenes. At intermediate desktop widths (701-1000px), headings use clamp(2.45rem, 5vw, 3.5rem). On phones, headings use clamp(1.85rem, 8.1vw, 3.05rem), with a line height of 1.08. These are observed responsive values, not a separate typeface.

Supporting copy uses the body token on desktop and 1rem on phones. Disclosure copy is smaller, with a relaxed line height; labels and navigation remain concise. The full-journey summary has its own smaller heading scale. Interface text is never baked into the image plates. Physical Fixauto embroidery on the expert's uniform and cap is the deliberate branding exception. Both the hero and inspection photographs use the same black branded workwear; the request form reuses the branded inspection image.

**The Live Text Rule.** Headlines, explanations and controls remain semantic HTML; image-generated lettering is never the interface.

## Layout

The homepage uses full-width photographic scenes with live copy over the darker left area on desktop. A scene occupies at least max(125svh, 42rem); its photograph holds at 100svh during normal scrolling. Copy occupies up to 70% of the scene with a 65rem cap, reducing to 61% at intermediate desktop widths. Text can grow naturally; short landscape windows use smaller padding and type. The desktop gutter uses the documented fluid spacing token.

At widths of 700px and below, text precedes a full-width, square-cropped photograph in a single reading column. Photos have a maximum height of 30rem and scene-specific crop positions. The mobile gutter is 1.25rem; at 350px and below it becomes 1rem. There is no forced scroll speed or nested scroll region.

The journey summary uses two columns on desktop and one on phones. Scene order, final copy placement, crop positions and the approved image paths are surface-specific; consult app/page.module.css rather than applying those measurements to all app screens.

**The Reading Order Rule.** Mobile and reduced-motion layouts preserve the same meaning and sequence as the desktop story.

## Elevation & Depth

The new landing system has no decorative card shadows or automotive doodle overlays. The user withdrew the doodle direction; do not restore automotive line drawings. The supplied dashboard warning symbols are a separate, later interaction request. Real photographic light supplies depth; typography, tonal grounds and fine dividers separate the interface. Photo transitions use a small scale and opacity change while keeping images visible by default.


The existing application retains its flat document panels and legacy tonal surfaces. This document does not introduce photographic backgrounds into operational screens.

## Shapes

Photographs are rectangular and extend to the scene edges. Filled actions have gently rounded corners using the control radius. Details and summary lists use fine horizontal dividers rather than enclosing cards. Focus outlines use a small corner radius. The visit request extends the same small-radius controls to dark inputs, selects and textareas. No new chips or modal shapes are implemented.

## Components

### Primary action

A compact red action with white text and a small inline SVG arrow. Desktop padding is defined in the frontmatter; minimum height is 3.5rem, reducing to 3.1rem on phones. Hover darkens the fill and lifts the control by 2px. Focus uses a 3px bright-red outline with a 5px offset.

### Text action

Warm-paper text with a red underline and an inline arrow. Hover brightens the text and underline. Use it when a second filled action would compete with the scene.

### Navigation and skip link

The shared public header contains the Fixauto wordmark, a quiet launch-location note and two page links: Home page and Request a visit. The current link has a red underline and aria-current=page. Home and the wordmark return to /. The header overlays the photographs on desktop and is sticky on phones; the optional ignition row is present only on the homepage. Navigation wraps rather than overflowing. The keyboard skip link appears on focus and reaches the full-journey summary.

### Supporting details

Native details/summary disclosures hold assessment and approval explanations behind a short descriptive label. Preserve keyboard toggling, visible focus and readable open-state copy.

### Photograph scenes

Text-free generated plates sit behind live desktop text and below mobile text. The current transition is opacity 0.88 to 1 and scale 1.018 to 1, using the sidecar's easing and durations. This is a chapter-entry transition, not a continuous crossfade between photographs. Without JavaScript, content and photographs remain visible. Reduced motion removes transitions, transforms, smooth anchor scrolling and sticky image positioning.

The approved closing photograph shows the woman relaxed and confident at her desk, with her keys nearby and her car outside. It deliberately differs from the exterior key handover in the hero. The exact scene and asset selection belong to the landing brief. The final request action has its own photograph: a woman describing her car problem by phone beside her parked car. Desktop live copy sits over its dark left side; mobile places the copy before a square crop of the photograph.

### Journey summary

A plain numbered list with dividers and a restrained red marker. It gives visitors a direct reading path through the service without playing through the motion.

### Visit request form

The user extended the photographic red-and-black language to /case/new on 2026-10-20. This is an Operate surface: a readable two-column desktop layout with a short photographic introduction and a standard form, followed by editable check answers and a pending-request receipt. The page reuses the same public header as the homepage, with a dark palette and red active state.

Fields use the request-input component token with a muted border, a brighter hover border, a 2px focus outline and a separate pale-red error state. Labels remain visible; required fields and inline messages are exposed semantically. Fields are grouped using native fieldsets. Review does not create a case; final submission reuses the existing browser-local case store.

The layout becomes one column at 56rem and the fields become one column at 36rem. Mobile omits the decorative photograph and the secondary timing explanation so visitors reach the form sooner. The visit headline is 3rem on desktop and 2rem at the single-column breakpoint. Other operational screens retain their existing palette.

### Header ignition sequence and cursor

The latest user direction places all five supplied dashboard warning symbols in a centered header row between the identity and navigation. The engine symbol is red like the other four. Use the transparent PNGs at public/images/warnings/*-clear.png as alpha masks with the single indicator color #e51b23. Black tiles and gray housings stay removed.

All five slots are reserved from the beginning. The icons start hidden, then appear left to right at 2.70, 3.91, 5.11, 6.31 and 7.50 seconds. Each revealed icon stays visible as the next appears; all five remain after the ten-second sequence. There are no chapter-body icons or blinking loops.

The soundtrack is the first 10.000 seconds of the user's supplied Toyota RAV4 ignition/electronics recording, saved as public/audio/ignition-first-10s.wav. The actual media currentTime drives reveal progress while audio plays. The cue points were measured from recurring tone-envelope attacks; output/audio/ignition-cues.json preserves the analysis and provenance. Pointer movement or touch begins an equivalent silent sequence. Enabling the speaker restarts the real recording and the visual sequence together; muting during playback keeps the same clock. No synthetic engine sound remains.

The desktop header is fixed and the phone header is sticky, keeping the indicator row visible during scrolling. On narrow screens the row sits between the identity and navigation rows. Other public pages keep their simpler header. Entering Back to your day stops audible playback under the earlier quiet-ending requirement, while the visual sequence can finish silently and remain visible. Leaving the page releases the media. Reduced motion uses immediate reveals without transition.

Desktop fine-pointer devices retain public/images/wrench-cursor.svg with its adjustable head upper-left, red handle lower-right, and 2,2 head hotspot.

### Existing app components

Case documents, forms, estimate controls, status pills, customer navigation and staff actions retain the archived Journey atlas specifications and their existing source styles. The visit request is the scoped exception; other app forms, documents and approval controls have not been restyled.

## Do's and Don'ts

### Do:

- Do use the red-and-black direction for the approved landing redesign and visit request.
- Do keep one main image and one short message in each landing scene.
- Do keep interface text selectable and controls keyboard accessible.
- Do crop photographs deliberately for mobile and support reduced motion.
- Do identify generated scenes as concept imagery.
- Do retain the existing app palette when maintaining its current screens.

### Don't:

- Don't restore blue-and-gold styling to the new landing direction.
- Don't use comic-style illustrations or crowded image collages for the new landing.
- Don't repeat the opening handover image for the closing scene.
- Don't hide essential content behind animation or require a fixed scroll speed.
- Don't treat concept images as proof of staff, customers, premises or completed operations.
- Don't imply that the local sample request confirms a real visit or that concept imagery proves operational availability.
