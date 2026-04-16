---
created: "2026-04-16"
last_edited: "2026-04-16"
---

# Cavekit: Product Boundary

## Scope
This cavekit defines what theme-forge is and what it isn't. It is a cross-cutting constraint inherited by every other cavekit. Any future kit, requirement, or implementation that contradicts this cavekit must trigger an explicit revision PR to this file BEFORE being drafted.

## Requirements

### R1: In-Scope Product Surface
**Description:** theme-forge is a static, browser-only React/TypeScript application whose entire purpose is producing two artifacts:
1. A designed theme — color, typography, spacing, shadow, and radius tokens
2. A widget manifest — the user's selection from a fixed catalog of widgets

All capabilities must support those two artifacts. Capabilities that exist in this product:
- Theme design via interactive controls
- Built-in theme presets and reset-to-default
- Live themed preview of representative UI and the widget catalog
- Multi-format export (JSON, CSS, TypeScript, Tailwind, SCSS, Style Dictionary) of theme + widget manifest
- Local-only persistence of the active theme + widget selection
- Import of a theme back into the editor (paste JSON or upload .json file)
- Undo/redo of design changes

**Acceptance Criteria:**
- [ ] Every requirement in every other cavekit serves one of the seven listed capabilities
- [ ] No cavekit introduces a capability not derivable from the seven listed above without first revising this requirement

**Dependencies:** none

### R2: Out of Scope (Hard Wall)
**Description:** The following directions are explicitly denied. A batch touching any of these MUST be rejected unless this cavekit is updated first in a dedicated PR.

**Acceptance Criteria:**
- [ ] No backend, no authentication, no database, no cloud storage, no remote sync, no real-time collaboration
- [ ] No routing, no multi-page navigation, no server-side rendering
- [ ] No drag-and-drop, no layout builder, no page composition canvas, no arbitrary widget arrangement
- [ ] No open-ended widget schema (per-widget configuration is constrained to what cavekit-widgets explicitly permits)
- [ ] No new widget IDs beyond the frozen catalog (R3)
- [ ] No plugin system, no extension API, no user-authored components
- [ ] No mobile-native shell, no native packaging
- [ ] No analytics, telemetry, tracking, or third-party scripts at runtime
- [ ] No paid features, licensing, or feature flags
- [ ] No motion or animation requirements (entrance fades, marquees, parallax, scroll effects)
- [ ] No theme-marketplace, theme-sharing, or import-from-URL features
- [ ] No icon library bundling

**Dependencies:** none

### R3: Frozen Widget Catalog
**Description:** The widget catalog is exactly the following eleven (11) IDs, in alphabetical order:
badge, button, card, empty-state, input, kpi-tile, modal, navbar, pricing-card, table, testimonial.
Adding, removing, or renaming any ID requires a dedicated PR that updates this requirement first. The catalog is the contract between every other domain (schema, widgets, export, persistence, preview).

**Acceptance Criteria:**
- [ ] cavekit-widgets.md R1 references this exact list, in this exact order
- [ ] Implementation WIDGET_IDS array matches exactly, in alphabetical order
- [ ] Implementation tests fail if the array drifts in any way (count, order, spelling)
- [ ] WIDGET_LABELS covers every ID with a human label
- [ ] DEFAULT_WIDGET_SELECTION has every ID set to false

**Dependencies:** none

### R4: Cross-Cutting Purity Constraints
**Description:** Three invariants apply to every other cavekit, regardless of domain.

**Acceptance Criteria:**
- [ ] Every export function is pure and Node-safe — no DOM access, no localStorage access, no network access, no clock reads, no random values
- [ ] Every preview is read-only and deterministic — fixed copy, no fetched data, no randomness, no clocks
- [ ] All persistence is local-only (browser localStorage); no requirement may introduce remote storage
- [ ] An export call with the same inputs produces byte-identical output across calls and across machines

**Dependencies:** none

## Out of Scope
- Implementation choices (which validation library, which CSS technique, file paths, framework primitives)
- Visual design specifications (those belong in DESIGN.md if added later)
- Dependency or build-tool selection

## Cross-References
- Inherited by: cavekit-schema.md, cavekit-editor.md, cavekit-preview.md, cavekit-export.md, cavekit-persistence.md, cavekit-widgets.md
- See also: AGENT_HANDOFF.md (current shipped state)

## Changelog
- 2026-04-16: Initial boundary lock. Catalog frozen at 11 IDs. Token surface expanded to include shadow + radius groups; out-of-scope list is hard-wall.
- 2026-04-16: Batch B-arch — confirmed Simple/Advanced color mode falls under R1 capability "Theme design via interactive controls"; no R revision required. R1/R2/R3/R4 text unchanged.
