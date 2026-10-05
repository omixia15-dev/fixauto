---
name: Fixauto Journey atlas
description: Managed repair coordination through a clear visual journey
colors:
  cobalt: "#1749b9"
  action-gold: "#e8b848"
  action-hover: "#f4cb64"
  approval-gold: "#ffdc82"
  mineral-ground: "#e7eeee"
  quiet-ground: "#edf3f1"
  navy-ink: "#11253f"
  route-label: "#d2e2e9"
  panel: "#f9fcfb"
  divider: "#c6d4d5"
typography:
  display:
    fontFamily: "Alexandria, sans-serif"
    fontSize: "5.2vw"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Alexandria, sans-serif"
    fontSize: "clamp(30px, 3vw, 44px)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-1.4px"
  body:
    fontFamily: "Alexandria, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.4
  hero-support:
    fontFamily: "Alexandria, sans-serif"
    fontSize: "1.4974vw"
    fontWeight: 300
    lineHeight: 1.4
rounded:
  label: "6px"
  control: "8px"
spacing:
  small: "8px"
  medium: "16px"
  group: "24px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.action-gold}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.control}"
    height: "61px"
    padding: "0 30px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  input:
    backgroundColor: "white"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.control}"
    height: "61px"
    padding: "16px"
  preview-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.control}"
    padding: "28px"
  approval-label:
    backgroundColor: "{colors.approval-gold}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.label}"
---

# Design System: Fixauto

## Overview

**Creative North Star: "Journey atlas"**

Journey atlas connects a repair process through clear milestones, a visible approval pause, and a calm route ground. Broad destination lettering and silver-car illustrations give the system its character; live text carries the information.

This documents the approved marketing surface. Existing service-application routes retain their incumbent green system. The new palette is not authorization to restyle those routes.

**Key Characteristics:**

- Broad destination lettering.
- Cobalt, mineral ground, and a gold approval pause.
- Illustrations paired with readable semantic text.

## Colors

### Primary

Cobalt carries the main visual field, milestone markers, and quiet navigation. The hero field varies subtly through sampled cobalt shades (#134cbe, #144cbd, #205ebe); the flat cobalt token is used elsewhere.

### Secondary

Action gold highlights the primary action. Its lighter hover state makes the action respond without movement. Approval gold distinguishes the pause in a planned journey.

### Neutral

Mineral and quiet grounds separate reading areas. Navy ink provides contrast. Route-label blue, near-white panels, and fine dividers support dense content.

**The Approval Rule.** Gold makes the approval boundary visible without implying that approval has occurred.

## Typography

Alexandria is self-hosted with its license in app/fonts. Display lettering is semibold (600); hero support is light (300); regular reading copy uses regular (400); controls and section headings use bold (700).

Desktop display type scales with the viewport. On smaller screens it uses clamp(42px, 7.5vw, 64px), a slightly looser line height (1.02), and tracking (-0.04em). Body copy remains readable at phone widths (15–18px).

**The Live Text Rule.** Headlines, process labels, and controls remain semantic text rather than being baked into illustrations.

## Layout

The marketing route is full width with generous side insets (about 4.4% on desktop; 24px on phones). Wide composition becomes a single reading column at 900px. The journey changes from a continuous horizontal band to readable sequential lists. Keep related text together when reflowing.

**The Reading Order Rule.** Responsive layout preserves the meaning and sequence of the content in the document.

## Elevation & Depth

Surfaces are flat at rest. Tonal grounds and fine dividers establish hierarchy. Illustrations supply physical depth. There are no decorative card shadows; the primary button gains a white surround only for keyboard focus.

## Shapes

Controls and panels have gentle corners (8px); route labels have smaller corners (6px). Circular numbered markers indicate sequence. Fine borders remain subordinate to the illustrated route.

## Components

### Buttons

The gold primary control has navy text, generous padding, and a lighter hover fill. Keyboard focus remains visible. Its brief color transition (0.18s ease-out) is removed under reduced motion.

### Inputs / Fields

A white field uses navy text, a cobalt caret, a visible label, and a contrastful placeholder. Native required and non-whitespace validation prevents blank submission. Demonstration feedback is announced through a status region.

### Cards / Containers

Demo previews use near-white panels, one fine border, and comfortable padding. They contain meaningful request, approval, and coordination content rather than decorative controls.

### Navigation

A plain text wordmark and quiet Coming soon link keep navigation small. The primary action uses a native in-page anchor; reduced motion disables smooth scrolling.

### Journey markers and labels

Numbered circles establish the broad stages. A gold label identifies awaiting approval. These are explanatory elements, not live tracking controls.

## Do's and Don'ts

### Do:

- Do preserve a visible approval boundary.
- Do keep labels readable and semantic.
- Do retain keyboard focus and reduced-motion support.

### Don't:

- Don't imply live vehicle tracking through decorative route notation.
- Don't use illustration text as a substitute for accessible content.
- Don't apply this marketing restyle to existing application routes without a separate request.