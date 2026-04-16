---
created: "2026-04-16"
last_edited: "2026-04-16"
---

# Cavekit: Widgets

## Scope
The widget manifest layer: a fixed catalog of UI widgets that the user toggles for inclusion in the export package, presented as themed read-only preview cards that double as selection toggles.

## Requirements

### R1: Fixed Widget Catalog and Schema
**Description:** Catalog matches cavekit-product-boundary.md R3 exactly. The selection schema is strict: every catalog ID present as a boolean key, no extras, no missing, no other types. Default selection has every ID off.
**Acceptance Criteria:**
- [ ] WIDGET_IDS array exposes the 11 frozen IDs in alphabetical order: badge, button, card, empty-state, input, kpi-tile, modal, navbar, pricing-card, table, testimonial
- [ ] WIDGET_LABELS exposes a human-readable label for every ID
- [ ] WidgetSelectionSchema rejects any payload missing a required key
- [ ] WidgetSelectionSchema rejects any payload with an unknown key
- [ ] WidgetSelectionSchema rejects any payload with a non-boolean value at any key
- [ ] DEFAULT_WIDGET_SELECTION returns every ID false
- [ ] validateWidgetSelection returns a structured error report on invalid input
**Dependencies:** cavekit-product-boundary R3

### R2: Selection Projection
**Description:** A pure projection function returns selected widget IDs in deterministic alphabetical order regardless of the input object's key insertion order.
**Acceptance Criteria:**
- [ ] selectedWidgetIds(selection) returns ids in alphabetical order
- [ ] Output is independent of key insertion order
- [ ] Output is deterministic across calls
- [ ] No widget IDs that are absent from WIDGET_IDS appear in the output
**Dependencies:** R1

### R3: Preview-Card Selector Surface
**Description:** Each catalog widget is presented as a clickable themed preview card that doubles as the inclusion toggle. No separate text-only checkbox row exists.
**Acceptance Criteria:**
- [ ] One toggle per catalog ID is rendered
- [ ] Each toggle is a button with role=switch and aria-checked reflecting selection state
- [ ] Each toggle has an accessible label that matches WIDGET_LABELS for its ID
- [ ] Selected cards render at full visual weight; unselected cards render dimmed
- [ ] A selected-count indicator showing N/total is visible
- [ ] Bulk Select-all and Clear actions are available and disabled at the appropriate boundary states
- [ ] Clicking a card flips its selection without affecting any other card
**Dependencies:** R1

### R4: Live Themed Widget Previews
**Description:** Each card renders a small read-only mini-rendering of its widget using the active theme tokens. Previews automatically re-theme when the active theme changes (preset apply, undo/redo, import). The kpi-tile widget supports two visual variants: a default tile rendering and a "metric" variant (top hairline border + serif numeric value + uppercase tracked label). The variant is user-selectable via a small in-card toggle on the kpi-tile preview only — no other widget exposes per-widget configuration. The selection is transient (per-session, not persisted) and influences only how the preview renders; export emission of the kpi-tile manifest entry is identical regardless of variant.
**Acceptance Criteria:**
- [ ] Each catalog ID has a dedicated preview rendering
- [ ] All preview copy is fixed deterministic strings (no clocks, no randomness, no fetched data)
- [ ] Previews consume theme tokens via inherited CSS custom properties (no inline color literals)
- [ ] Switching theme presets re-themes every preview within the same render cycle
- [ ] kpi-tile renders the default tile variant by default
- [ ] kpi-tile renders the metric variant when the user clicks the in-card variant toggle
- [ ] Only the kpi-tile preview exposes a variant toggle; no other widget gains per-widget configuration UI
- [ ] The toggle has accessible labels for both states (Tile / Metric) and reflects the active variant via aria-pressed or aria-checked
- [ ] The variant choice is per-session (not persisted to localStorage) and does not appear in any export format
- [ ] The variant toggle is rendered alongside the kpi-tile card whenever the card is rendered, regardless of whether kpi-tile is included in the current selection (the toggle controls preview rendering, not export inclusion)
- [ ] Previews never trigger network, storage, or DOM-mutation side effects
**Dependencies:** R1, cavekit-product-boundary R4

### R5: Export Integration
**Description:** When a widget selection is provided to any export function, the output includes a deterministic alphabetical manifest of the selected IDs. Omitting the selection yields the prior theme-only output exactly.
**Acceptance Criteria:**
- [ ] toJSON and toJSONVariant emit a top-level "widgets" array with the selected IDs in alphabetical order
- [ ] toCSSVars and toCSSVarsVariant emit a header comment listing the selected widgets
- [ ] toTSObject and toTSObjectVariant emit an additional named export "widgets" as a const tuple of the selected IDs
- [ ] toTailwindConfig and toTailwindConfigVariant emit theme.extend.widgets as an array of the selected IDs
- [ ] toSCSSVars and toSCSSVarsVariant emit a header comment plus a $widgets SCSS list
- [ ] toStyleDictionary and toStyleDictionaryVariant emit a "widgets" token group with one camelCased boolean token per selected ID
- [ ] Calling any export function without a widgets argument produces output identical to the pre-widget-feature output (back-compat)
**Dependencies:** R1, R2, cavekit-export

### R6: Persistence Integration
**Description:** Widget selection is saved alongside the theme in the same persisted record. Records lacking widgets load with the default selection.
**Acceptance Criteria:**
- [ ] saveTheme persists both the active theme and the widget selection in a single record
- [ ] loadTheme returns the persisted widget selection alongside the theme on success
- [ ] A persisted record with no "widgets" field loads with DEFAULT_WIDGET_SELECTION (read back-compat)
- [ ] A persisted record with a malformed "widgets" field is treated as corrupt
- [ ] Existing schema version field continues to gate corruption recovery for both fields
**Dependencies:** R1, cavekit-persistence

## Out of Scope
- Drag-and-drop, reordering, or arrangement of widgets
- Per-widget configuration beyond the kpi-tile variant flag (no sizes, no states, no color overrides)
- Interactive previews (no hover demos, no click-through, no animations, no real input)
- New widget IDs beyond the catalog frozen in cavekit-product-boundary R3
- Variant-pair (light/dark) widget previews
- Icon library bundling

## Cross-References
- See also: cavekit-product-boundary.md (catalog freeze, purity constraints)
- See also: cavekit-schema.md (theme tokens consumed for preview rendering and export)
- See also: cavekit-export.md (every export format includes the widget manifest)
- See also: cavekit-persistence.md (widget selection persists alongside the active theme)

## Changelog
- 2026-04-16: Initial cavekit. Backfills shipped 8-widget surface; extends catalog to 11 (adds badge, pricing-card, testimonial). kpi-tile gains a "metric" visual variant absorbing the proposed metric-stat widget.
- 2026-04-16 (Batch 10): R4 clarified — kpi-tile metric variant is user-selectable via an in-card toggle (transient per-session, not persisted, not in export). Codifies the boundary that no other widget exposes per-widget configuration UI.
- 2026-04-16 (Batch 11): R4 codifies that the variant toggle is operable regardless of kpi-tile selection state (matches shipped behavior).
