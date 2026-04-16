---
created: "2026-04-16"
last_edited: "2026-04-16"
---

# Cavekit Overview

## Project
theme-forge — portfolio-grade visual theme editor. A static, browser-only React/TypeScript app that lets a user adjust color, typography, and spacing tokens in a sidebar, see a live preview, and export the finished theme in multiple developer-ready formats.

## Domain Index
| Domain | Cavekit File | Requirements | Status | Description |
|--------|-------------|-------------|--------|-------------|
| Product Boundary | cavekit-product-boundary.md | R1–R4 | DRAFT | Locked product surface; cross-cutting constraint inherited by every domain |
| Schema | cavekit-schema.md | R1–R9 | Drafted | Canonical theme data model, variant pair shape, and validation surface |
| Editor | cavekit-editor.md | R1–R11 | Drafted | Interactive token controls, built-in presets, undo/redo history, active-theme state, Simple/Advanced color mode |
| Preview | cavekit-preview.md | R1–R6 | Drafted | Live canvas rendering representative UI under the active theme with light/dark variant toggle |
| Export | cavekit-export.md | R1–R11 | Drafted | Pure serialization to JSON, CSS, TS, Tailwind, SCSS, Style Dictionary; copy and download |
| Persistence | cavekit-persistence.md | R1–R8 | Drafted | Local-storage save/restore of the active theme and import from JSON string or file; optional color-mode wrapper fields |
| Widgets | cavekit-widgets.md | R1–R6 | DRAFT | Bounded widget manifest, themed selector cards, export and persistence integration |

## Cross-Reference Map
| Domain A | Interacts With | Interaction Type |
|----------|---------------|-----------------|
| Editor | Schema | Consumes default theme, types, and validation |
| Preview | Schema | Consumes theme configuration and variant pair shape |
| Preview | Editor | Subscribes to active theme |
| Export | Schema | Consumes theme configuration as input to serialization |
| Export | Editor | Reads active theme on demand (read-only, no mutation) |
| Persistence | Schema | Validates records on save, restore, and import |
| Persistence | Editor | Saves active-theme changes; supplies restored or imported themes via the editor's external-adoption interface |
| Editor | Persistence | Persists `colorMode` + `colorOverrides` per cavekit-editor.md R11 / cavekit-persistence.md R8 |
| Widgets | Schema | Consumes color/shadow/radius tokens for preview rendering |
| Widgets | Export | Adds widget manifest to every export format |
| Widgets | Persistence | Selection persists alongside the active theme |
| Product Boundary | Schema | Constrains token surface |
| Product Boundary | Widgets | Freezes the catalog |
| Product Boundary | Editor, Preview, Export, Persistence | Cross-cutting denial list (no backend, no routing, etc.) |

## Dependency Graph
```
Product Boundary  (cross-cutting constraint inherited by all domains)
   |
   v
Schema  (foundation — no dependencies)
   |
   +--> Editor       (active state, history, presets)
   |       |
   |       +--> Preview        (subscribes to active theme)
   |       +--> Export         (reads active theme)
   |       +--> Persistence    (saves active theme; supplies themes back to Editor)
   |
   +--> Preview      (also reads schema directly for variant pair shape)
   +--> Export       (also reads schema directly for serialization shape)
   +--> Persistence  (also reads schema directly for validation)

Widgets  (depends on Schema for token consumption, Editor for active-theme subscription,
          Export for manifest emission, Persistence for selection storage)
```

Implementation order:
1. Schema — must exist before any other domain can be built or tested.
2. Editor — establishes the active-theme contract that Preview, Export, and Persistence all depend on.
3. Preview, Export, Persistence — independent of one another and may be built in parallel after Editor.

## Coverage Summary
- Total domains: 7
- Total requirements: 55
- All requirements have testable acceptance criteria
- All domains have explicit Out of Scope sections
- All cross-references are bidirectional

## Changelog
- 2026-04-16: Initial overview with five drafted domains (Schema, Editor, Preview, Export, Persistence).
- 2026-04-16: Batch 9 boundary revision. Added Product Boundary domain (locks scope and freezes 11-widget catalog) and Widgets domain (backfills shipped widget-builder, extends to 11 IDs). Schema extended with shadow + radius groups and 5 new color slots.
- 2026-04-16: Batch B-arch — Editor R11 + Persistence R8 added for Simple/Advanced color mode contract. Total reqs 53 → 55.
