# Knowledge graph plan and guide

Open [Fixauto Knowledge Graph](<Fixauto Knowledge Graph.html>) in a browser. It is a self-contained HTML file with native SVG, inline styles and JavaScript; no network, installation or build step is required. A standalone [SVG snapshot](<Fixauto Knowledge Graph.svg>) of the product view is also available for sharing or importing into design tools.

## Four linked views

1. **Product:** people, vehicles, cases and records connected by named domain relationships.
2. **Service journey:** assessment, approvals, custody, repairs and failure/revision paths. This describes agreed operations, not a currently deployed service.
3. **Documents:** each class document's purpose and relationship to the other documents. Select a node to open its Markdown source.
4. **Data proposal:** candidate records and cardinalities, explicitly distinguished from an implemented database. Demo persistence is same-browser sample storage, not a production database.

The class distinguishes domain, documents, code and data maps. There is no application code yet, so the service journey is offered as a useful additional view; a code map is intentionally deferred until implementation exists.

## Interaction

- Drag empty space to pan; mouse wheel or pinch to zoom.
- Use + / − or Fit to change the view; keyboard arrow keys pan while graph has focus, + / − zoom, and 0 fits.
- Click a node (or Tab to it and press Enter/Space) to highlight its immediate relationships and show details and source links.
- Search names/descriptions; choose a result to focus it.
- Switch view with the four tabs. Toggle edge labels to reduce visual clutter.
- Download the active view as a standalone SVG. It remains vector artwork; the HTML retains the interactive controls.

## Meaning and maintenance

Teal = people/roles; blue = core records; purple = actions/documentation; amber = launch dependency or pending external fact. The data view is entirely a proposed model. Arrows are directional and named; they express relationships, not arbitrary decoration.

Authoritative decisions are in [DECISIONS](DECISIONS.md); the consolidated scope is in [PLAN](PLAN.md). The graph embeds a readable `maps` data object to work offline. Update that object when those documents change. Node details include sources and separate operational facts from demonstration proposals.

This visualization is a snapshot after Q87 and user confirmation. It does not establish insurance, workshop agreements, prices, gateway readiness or real security controls.
