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
  case-ground: "#edf3f6"
  case-muted: "#52647d"
  case-divider: "#d7e1e9"
  case-soft-blue: "#edf3ff"
  case-panel: "#ffffff"
  case-action-border: "#d7a82f"
typography:
  display:
    fontFamily: "Alexandria, sans-serif"
    fontSize: "clamp(46px, 5vw, 76px)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
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
    fontSize: "clamp(16px, 1.35vw, 20px)"
    fontWeight: 400
    lineHeight: 1.4
  case-body:
    fontFamily: "Alexandria, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  label: "6px"
  control: "8px"
  panel: "12px"
  status: "999px"
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
  case-document-panel:
    backgroundColor: "{colors.case-panel}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.panel}"
    padding: "22px"
  case-action:
    backgroundColor: "{colors.action-gold}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.control}"
    height: "46px"
    padding: "11px 16px"
---

# Design System: Fixauto

## Overview

**Creative North Star: "Journey atlas"**

Journey atlas connects a repair process through clear milestones, a visible approval pause, and a calm route ground. Broad destination lettering and silver-car illustrations give the system its character; live text carries the information.

This documents the approved marketing surface and its scoped customer-case extension. The existing `/case` index and `/cases/[caseId]` customer dossier share the cobalt and cool-paper case shell. Issue #27 extends the same navigation and cobalt defaults across the existing app routes, including the request form. The approved Option C composition remains defined in `docs/CUSTOMER-CASE-BRIEF.md`.

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

Mineral and quiet grounds separate marketing reading areas. Navy ink provides contrast. Route-label blue, near-white panels, and fine dividers support the journey surface.

### Customer-case extension

- **Cool paper** (#edf3f6): the `/case` shell and customer dossier ground.
- **Muted slate** (#52647d) and **cool divider** (#d7e1e9): secondary text and document borders.
- **Soft cobalt** (#edf3ff) and **white panels** (#ffffff): current-step surfaces and saved case records.
- **Action border** (#d7a82f): the outline around dossier decision controls.

The home and cases routes use the same cobalt and gold authority while keeping their route-specific surfaces distinct.

**The Approval Rule.** Gold makes the approval boundary visible without implying that approval has occurred.

## Typography

Alexandria is self-hosted with its license in app/fonts. The coordinator headline is semibold (600), with the geographic line in regular (400). The benefits display is semibold (600). Hero support is regular (400) on desktop and light (300) on phones; controls and section headings use bold (700).

The shared case shell loads the same local Alexandria files at weights 400, 600, and 700. Its base line height is 1.5; dossier headings, labels, and table text set their own sizes in the route stylesheet. The home and workspace shells use local Alexandria; the global fallback remains Arial, Helvetica, sans-serif.

Desktop display type scales with the viewport. On smaller screens it uses clamp(42px, 7.5vw, 64px), a line height of 1.08, and tracking of -0.03em. Body copy remains readable at phone widths (15–18px).

**The Live Text Rule.** Headlines, process labels, and controls remain semantic text rather than being baked into illustrations.

## Layout

The marketing route is full width with generous side insets (about 4.4% on desktop; 24px on phones). Wide composition becomes a single reading column at 900px. The journey changes from a continuous horizontal band to readable sequential lists. Keep related text together when reflowing.

The quieter home refinement on 2026-10-09 preserves the dominant coordinator message and intentional break before “start to finish”, with a smaller semibold display and restrained artwork anchored at the lower right. The benefits use a pale reading ground with navy headings. Gold distinguishes the launch action and approval checkpoint. The detailed three-step explanation stays consolidated beside the problem on desktop and follows it on phones.

The home polish keeps desktop journey labels at 14–16px, milestone headings at 16–22px, and problem copy at 17–20px. The journey reserves enough vertical space for wrapped labels, and the detailed steps form one column between 901px and 1100px.

The `/case` index and `/cases/[caseId]` dossier share `CaseLayout` and its Alexandria, cobalt navigation, demo label, and footer. The dossier uses a 1720px maximum screen width. Above 980px, its overview and facts column sit side by side, with documents below the overview; at 980px the page becomes one column while the sidebar keeps two columns. At 700px the sidebar and overview details stack, section links wrap, and the screen uses 16px side padding. At 420px the screen uses 12px side padding and the vehicle illustration narrows. The reading order stays overview, next-step/facts, then documents. The selected page composition and interaction contract remain in `docs/CUSTOMER-CASE-BRIEF.md`.

**The Reading Order Rule.** Responsive layout preserves the meaning and sequence of the content in the document.

## Elevation & Depth

Surfaces are flat at rest. Tonal grounds and fine dividers establish hierarchy. Illustrations supply physical depth. There are no decorative card shadows; the primary button gains a white surround only for keyboard focus.

Case documents use white panels with a 1px divider and 12px corners; inset summary groups and action groups use 8px corners. Depth remains tonal and border-led.

## Shapes

Controls and panels have gentle corners (8px); route labels have smaller corners (6px). Circular numbered markers indicate sequence. Fine borders remain subordinate to the illustrated route.

On the dossier, document panels use 12px corners, inset groups use 8px, and status pills are fully rounded. The shared case shell keeps the existing component shapes.

## Components

### Buttons

The gold primary control has navy text, generous padding, and a lighter hover fill. Keyboard focus remains visible. Its brief color transition (0.18s ease-out) is removed under reduced motion.

### Inputs / Fields

A white field uses navy text, a cobalt caret, a visible label, and a contrastful placeholder. Native required and non-whitespace validation prevents blank submission. Demonstration feedback is announced through a status region.

### Cards / Containers

Demo previews use near-white panels, one fine border, and comfortable padding. They contain meaningful request, approval, and coordination content rather than decorative controls.

### Navigation

A plain text wordmark and shared navigation connect Home page, Cases, Users, Staffs, and Coming Soon. Users opens the sample customer dossier; it is not a user administration screen. Dossier navigation retains its case when opening the staff workspace. Links wrap on phones and the active section has a gold underline. The primary action uses a native in-page anchor; reduced motion disables smooth scrolling.

### Journey markers and labels

Numbered circles establish the broad stages. A gold label identifies awaiting approval. These are explanatory elements, not live tracking controls.

### Customer case workspace

The shared case header keeps the Fixauto wordmark, main navigation, Demo label, and contextual staff demo link. The dossier uses a vehicle identity header, status pill, wrapping section links, white document panels, soft-blue next-step/fact groups, and gold action buttons. Its estimate, payment, and record sections use semantic tables and lists; links navigate to visible sections. Keep the illustrative vehicle caption and the shell's sample-data notice. The Demo label describes simulated behavior; this design reference does not authorize real payments, bookings, or operational use.

## Do's and Don'ts

### Do:

- Do preserve a visible approval boundary.
- Do keep labels readable and semantic.
- Do retain keyboard focus and reduced-motion support.
- Do keep the approved cobalt and gold identity consistent across Home and the existing demo workspaces.

### Don't:

- Don't imply live vehicle tracking through decorative route notation.
- Don't use illustration text as a substitute for accessible content.
- Don't extend this route-specific styling to other application routes without a separate request.
- Don't treat the Demo label or this design reference as authorization for live actions.

## Staff workspace extension — issue #23

Approved 2026-10-09: the staff route extends the customer cases palette, Alexandria type and flat document panels using the selected C dossier composition. A case selector and identity band lead; section anchors navigate visible content; workflow/facts form the desktop sidebar and the required action leads on phones. All staff actions and customer authorization gates remain simulated. See docs/STAFF-BRIEF.md for the approved composition and translation decisions. This extension supersedes the earlier green-system restriction for /staff only.
